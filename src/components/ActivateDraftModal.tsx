import React, { Component, Fragment } from "react";
import { observable, action, computed, reaction } from "mobx";
import Button from "src/components/Button";
import Spacer from "src/components/Spacer";
import { colors, fade } from "src/styles";
import Store from "src/store";
import { observer, inject } from "mobx-react";
import Icon from "src/components/Icon";
import Tooltip from "src/components/Tooltip";
import { BigNumber } from "bignumber.js";
import {
  ReceiptUnderline,
  ModalForm,
  ModalFormHeader,
  ModalFormContent,
  ReceiptItem
} from "src/components/Form";
import { round, fromWei } from "utils/units";
const PlaceholderBox = require("components/PlaceholderBox").default;
import styled from "@emotion/styled";

interface Props {
  consumerStore: ConsumerStore;
  store?: Store;
  onClose: any;
}

const TEN_18 = new BigNumber(10).pow(18);

export const EarningsItem = styled(ReceiptItem)`
  font-size: 16px;
  color: ${colors.darkTextGrey};

  & i {
    font-size: 14px;
    color: ${colors.textGrey};
  }
`;

@inject("store")
@observer
export default class ActivateDraftModal extends Component<Props> {
  @observable repCost?: BigNumber = undefined;
  @observable ethCost?: BigNumber = undefined;
  @observable ethRequired?: BigNumber = undefined;
  @observable augurAllowance?: BigNumber = undefined;
  @observable activationStatus: "none" | "signing" | "activating" | "error" =
    "none";
  @observable buyStatus: "none" | "signing" | "buying" | "error" = "none";
  teardown: any;

  componentDidMount() {
    this.fetchAugurData();

    this.teardown = reaction(
      () => this.additionalRepNeededToActivateMarket,
      () => {
        this.getUniswapExchangeRate(this.additionalRepNeededToActivateMarket);
      }
    );
  }

  async fetchAugurData() {
    const { consumerStore } = this.props;
    [this.repCost, this.ethCost] = await consumerStore.getMarketCreationCost();
  }

  async getUniswapExchangeRate(amount: BigNumber) {
    if (!amount) return;
    this.ethRequired = await this.props.store.getUniswapExchangeRate(
      "rep",
      amount
    );
  }

  componentWillUnmount() {
    if (this.teardown) this.teardown();
  }

  @action
  async activateDraftMarket() {
    this.activationStatus = "signing";
    try {
      const emitter = this.props.consumerStore.activateDraftMarket(
        this.props.consumerStore.marketWrapper.market
      );
      emitter.on("signed", () => (this.activationStatus = "activating"));
      await emitter;
      await this.props.consumerStore.fetchMarket();
      this.props.onClose();
    } catch (e) {
      console.error(e);
      this.activationStatus = "error";
    }
  }

  @action
  async buyRep() {
    this.buyStatus = "signing";
    try {
      const emitter = this.props.store.buyFromUniswap(
        "rep",
        this.ethRequired,
        this.additionalRepNeededToActivateMarket
      );
      emitter.on("signed", () => (this.buyStatus = "buying"));
      await emitter;
    } catch (e) {
      console.error(e);
      this.buyStatus = "error";
    }
  }

  @computed
  get repBalance() {
    return this.props.consumerStore.store.balances.repBalance;
  }

  @computed
  get additionalRepNeededToActivateMarket() {
    if (this.repBalance && this.repCost) {
      if (this.repBalance.gte(this.repCost)) return new BigNumber(0);
      else return this.repCost.minus(this.repBalance);
    }
    return null;
  }

  render() {
    const { marketWrapper } = this.props.consumerStore;
    return (
      <ModalForm>
        <ModalFormHeader>
          <h3>Activate market</h3>
          <Spacer small />
          <h2>{marketWrapper.name}</h2>
        </ModalFormHeader>
        <ModalFormContent>
          <div>
            Make a deposit to deploy this market to Augur and activate it on
            Veil.
          </div>
          <Spacer size={1.5} />
          <div
            style={{
              color: colors.darkTextGrey,
              fontSize: "14px"
            }}
          >
            Your deposit of REP and ETH will be returned to you if you report on
            your market and it resolves to a valid outcome.
          </div>
          <Spacer size={1.5} />
          <EarningsItem>
            <span>
              👻 No-show deposit{" "}
              <Tooltip
                content={
                  "You will get this deposit back when you report on your market within 3 days of expiration"
                }
              >
                <Icon name="help" />
              </Tooltip>
            </span>
            <ReceiptUnderline />
            {this.repCost ? (
              <span style={{ color: colors.textBlack }}>
                <Tooltip content={`${this.repCost.div(TEN_18).toString()} REP`}>
                  <b>{round(fromWei(this.repCost), 3)}</b> <small>REP</small>
                </Tooltip>
              </span>
            ) : (
              <PlaceholderBox />
            )}
          </EarningsItem>
          <Spacer />
          <EarningsItem>
            <span>
              🗳 ️Validity deposit{" "}
              <Tooltip
                content={
                  "You will get this deposit back when your market resolves to a valid outcome"
                }
              >
                <Icon name="help" />
              </Tooltip>
            </span>
            <ReceiptUnderline />
            {this.ethCost ? (
              <span style={{ color: colors.textBlack }}>
                <Tooltip content={`${this.ethCost.div(TEN_18).toString()} ETH`}>
                  <b>{round(fromWei(this.ethCost), 3)}</b> <small>ETH</small>
                </Tooltip>
              </span>
            ) : (
              <PlaceholderBox />
            )}
          </EarningsItem>

          {this.additionalRepNeededToActivateMarket &&
            this.additionalRepNeededToActivateMarket.lte(0) && (
              <Fragment>
                <Spacer size={2} />
                {this.activationStatus !== "error" ? (
                  <Button
                    block
                    onClick={() => this.activateDraftMarket()}
                    disabled={this.activationStatus !== "none"}
                  >
                    {this.activationStatus === "none" && "Activate Market"}
                    {this.activationStatus === "signing" &&
                      "Please check your wallet..."}
                    {this.activationStatus === "activating" &&
                      "Activating market..."}
                  </Button>
                ) : (
                  <div>Something went wrong during market activation.</div>
                )}
              </Fragment>
            )}
        </ModalFormContent>
        {this.additionalRepNeededToActivateMarket &&
          this.additionalRepNeededToActivateMarket.gt(0) && (
            <Fragment>
              {Store.getDesiredNetworkId() === "1" ? (
                <ModalFormHeader
                  style={{
                    backgroundColor: fade("#FB60CF", 0.1),
                    borderTop: `1px solid ${fade("#EF3E4A", 0.3)}`
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "#B42B8E",
                      fontSize: "16px",
                      fontWeight: 500
                    }}
                  >
                    It looks like you don’t have enough REP to activate this
                    market.
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: "#AA5B94",
                      fontSize: "14px"
                    }}
                  >
                    Buy{" "}
                    <Tooltip
                      content={`${this.additionalRepNeededToActivateMarket
                        .div(TEN_18)
                        .toString()} REP`}
                    >
                      {round(
                        fromWei(this.additionalRepNeededToActivateMarket),
                        3
                      )}{" "}
                      REP
                    </Tooltip>{" "}
                    for{" "}
                    {this.ethRequired ? (
                      <Tooltip
                        content={`${this.ethRequired
                          .div(TEN_18)
                          .toString()} ETH`}
                      >
                        {round(fromWei(this.ethRequired), 3)} ETH
                      </Tooltip>
                    ) : (
                      "0.000 ETH"
                    )}{" "}
                    on 🦄 Uniswap.
                  </div>
                  <Spacer />
                  {this.buyStatus !== "error" ? (
                    <Button
                      color={"#F737E4"}
                      block
                      disabled={this.buyStatus !== "none"}
                      onClick={() => this.buyRep()}
                    >
                      {this.buyStatus === "none" &&
                        `Buy ${round(
                          fromWei(this.additionalRepNeededToActivateMarket),
                          3
                        )} REP`}
                      {this.buyStatus === "signing" &&
                        "Please check your wallet..."}
                      {this.buyStatus === "buying" && "Buying REP..."}
                    </Button>
                  ) : (
                    <div>Whoops, something went wrong when buying REP.</div>
                  )}
                </ModalFormHeader>
              ) : (
                <ModalFormHeader
                  style={{
                    backgroundColor: fade(colors.blue, 0.1),
                    borderTop: `1px solid ${fade(colors.blue, 0.3)}`
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: colors.blue,
                      fontSize: "16px",
                      fontWeight: 500
                    }}
                  >
                    It looks like you don’t have enough REP to activate this
                    market. Get free REP from Augur's faucet.
                  </div>
                  <Spacer size={1.5} />
                  {this.buyStatus !== "error" ? (
                    <Button
                      color={colors.blue}
                      block
                      disabled={this.buyStatus !== "none"}
                      onClick={() => this.buyRep()}
                    >
                      {this.buyStatus === "none" && "Get REP"}
                      {this.buyStatus === "signing" &&
                        "Please check your wallet..."}
                      {this.buyStatus === "buying" && "Getting REP..."}
                    </Button>
                  ) : (
                    <div>Whoops, something went wrong when getting REP.</div>
                  )}
                </ModalFormHeader>
              )}
            </Fragment>
          )}
      </ModalForm>
    );
  }
}
