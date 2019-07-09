import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import Transactions from "src/store/Transactions";
import Eth from "src/store/Eth";
import BigNumber from "bignumber.js";
import { Market } from "src/types";
import { toWei } from "src/utils/units";
import { addresses } from "augur-core-abi";
import * as ethers from "ethers";
import getWindowProvider from "src/utils/getWindowProvider";
import ms from "ms";
import PromiseEmitter from "src/utils/PromiseEmitter";
import { when, computed } from "mobx";
import getRepAddress from "src/utils/getRepAddress";
import gql from "graphql-tag";
import encodeCategory from "src/utils/encodeCategory";

const universeAbi = [
  "function createScalarMarket(uint256 endTime, uint256 feePerEthInWei, address denominationToken, address designatedReporterAddress, int256 minPrice, int256 maxPrice, uint256 numTicks, bytes32 topic, string description, string extraInfo)",
  "function createYesNoMarket(uint256 endTime, uint256 feePerEthInWei, address denominationToken, address designatedReporterAddress, bytes32 topic, string description, string extraInfo)",
  "function getOrCacheMarketCreationCost() constant returns (uint256)",
  "function getOrCacheDesignatedReportNoShowBond() constant returns (uint256)",
  "function getOrCacheDesignatedReportStake() constant returns (uint256)"
];

function createApollo() {
  const cache = new InMemoryCache({
    dataIdFromObject: (obj: any) => obj.uid
  });
  const link = new HttpLink({
    uri: (process.env.API_URL || "") + "/graphql"
  });

  return new ApolloClient({
    cache,
    link
  });
}

export default class Store {
  client = createApollo();
  transactions = new Transactions(this);
  eth = new Eth(this);

  start() {
    console.log("Starting store");
    this.eth.refresh();
  }

  stop() {
    console.log("Stopping store");
    this.eth.stop();
  }

  static getDesiredNetworkId() {
    if (process.env.NETWORK_ID) return process.env.NETWORK_ID;
    return "42";
  }

  static getEthereumHttp() {
    return process.env.ETHEREUM_HTTP;
  }

  get repAddress() {
    return getRepAddress(Store.getDesiredNetworkId());
  }

  @computed
  get signer() {
    return new ethers.providers.Web3Provider(getWindowProvider()).getSigner();
  }

  @computed
  get provider() {
    return new ethers.providers.JsonRpcProvider(Store.getEthereumHttp());
  }

  async getMarketCreationCost() {
    const networkId: string = Store.getDesiredNetworkId();
    const universe = new ethers.Contract(
      addresses[networkId].Universe.toLowerCase(),
      universeAbi,
      this.provider
    );
    const strings = await Promise.all([
      universe.getOrCacheDesignatedReportNoShowBond(),
      universe.getOrCacheMarketCreationCost()
    ]);
    return strings.map(str => new BigNumber(str));
  }

  async signMarket(market: Partial<Market>) {
    const timestamp = new Date();
    const message = `By signing this message, you prove ownership over the address ${
      this.eth.currentAddress
    }.\n\nMarket question: ${market.description}\n\nMarket details:\n${
      market.details
    }\n\nResolution time: ${new Date(
      market.endTime!
    ).toISOString()}\n\nCurrent time: ${timestamp.toISOString()}`;
    const signature = await this.signer.signMessage(message);
    (window as any).ethers = ethers;
    (window as any).signature = { signature, message, timestamp };
    return { signature, message, timestamp };
  }

  activateDraftMarket(market: Market) {
    return PromiseEmitter.await(async emit => {
      const networkId: string = Store.getDesiredNetworkId();
      const cashAddress = addresses[networkId].Cash.toLowerCase();
      const universe = new ethers.Contract(
        addresses[networkId].Universe.toLowerCase(),
        universeAbi,
        this.signer
      );
      const marketCreationCost = await universe.getOrCacheMarketCreationCost();
      const convertForEthers = (num: string | BigNumber) =>
        new ethers.utils.BigNumber(num.toString());
      const fee = convertForEthers(toWei(market.marketCreatorFeeRate).div(100));
      const category = encodeCategory(market.category);
      const endTime = Math.floor(new Date(market.endTime).getTime() / 1000);
      let tx;
      if (market.type === "yesno")
        tx = await universe.createYesNoMarket(
          endTime,
          fee,
          cashAddress,
          this.eth.currentAddress,
          category,
          market.description,
          JSON.stringify({
            longDescription: market.details,
            tags: market.tags,
            resolutionSource: market.resolutionSource
          }),
          {
            gasPrice: convertForEthers(await this.getGasPrice()),
            value: convertForEthers(marketCreationCost)
          }
        );
      else if (market.type === "scalar")
        tx = await universe.createScalarMarket(
          endTime,
          fee,
          cashAddress,
          this.eth.currentAddress,
          convertForEthers(market.minPrice),
          convertForEthers(market.maxPrice),
          market.numTicks,
          category,
          market.description,
          JSON.stringify({
            longDescription: market.details,
            tags: [],
            resolutionSource: market.resolutionSource
          }),
          {
            gasPrice: convertForEthers(await this.getGasPrice()),
            value: convertForEthers(marketCreationCost)
          }
        );
      this.transactions.addTransaction({
        type: "activateDraftMarket",
        transactionHash: tx.hash
      });
      emit("signed");
      await this.client.mutate({
        mutation: gql`
          mutation ActivateMarket($uid: String!, $transactionHash: String!) {
            activateMarket(
              uid: $uid
              transactionHash: $transactionHash
              signature: ""
            ) {
              uid
              status
            }
          }
        `,
        variables: {
          uid: market.uid,
          transactionHash: tx.hash
        }
      });
      emit("success");
      return tx.hash;
    });
  }

  async getGasPrice(): Promise<BigNumber> {
    const url = "https://ethgasstation.info/json/ethgasAPI.json";
    const response = await fetch(url);
    const json = await response.json();
    // This is kinda whack, for some reason EGS returns gas prices multiplied by 10
    const fastGwei = json.fast / 10;
    const BILLION = new BigNumber("10").pow(new BigNumber("9"));
    const fastWei = new BigNumber(fastGwei).times(BILLION);
    return fastWei;
  }

  getExchangeAddress(currency: "rep") {
    const addressesByNetworkId: {
      [networkId: string]: { rep: string };
    } = {
      1: {
        rep: "0x48b04d2a05b6b604d8d5223fd1984f191ded51af"
      },
      42: {
        rep: "0x4ca9baaffcc2692db2b33ab2ab2edda86c2c4a4d"
      }
    };
    return addressesByNetworkId[Store.getDesiredNetworkId()][currency];
  }

  async getUniswapExchangeRate(currency: "rep", amount: BigNumber) {
    const exchangeAddress = this.getExchangeAddress(currency);
    const abi = [
      "function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline)",
      "function getEthToTokenOutputPrice(uint256 tokens_bought) constant returns (uint256)"
    ];
    const uniswap = new ethers.Contract(exchangeAddress, abi, this.provider);
    return new BigNumber(
      (await uniswap.getEthToTokenOutputPrice(
        new ethers.utils.BigNumber(amount.toString())
      )).toString()
    );
  }

  buyFromUniswap(
    currency: "rep",
    ethRequired: BigNumber,
    tokenAmount: BigNumber
  ) {
    return PromiseEmitter.await(async emit => {
      let txHash;
      const exchangeAddress = this.getExchangeAddress(currency);
      const abi = [
        "function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline)",
        "function getEthToTokenOutputPrice(uint256 tokens_bought) returns (uint256)"
      ];
      const uniswap = new ethers.Contract(exchangeAddress, abi, this.signer);
      txHash = await uniswap.ethToTokenSwapInput(
        tokenAmount,
        new Date(Date.now() + ms("10m")),
        {
          from: this.eth.currentAddress,
          gasPrice: (await this.getGasPrice()).toString(),
          value: ethRequired
        }
      );
      const tx = this.transactions.addTransaction({
        type: "uniswapBuy",
        transactionHash: txHash
      });
      emit("signed");
      try {
        await when(() => tx.status === "completed", {
          timeout: 180000
        });
        emit("success");
      } catch (e) {
        // there was a timeout
      }
      return txHash;
    });
  }
}
