import React, { Fragment, useContext, useEffect, useCallback } from "react";
import { reaction } from "mobx";
import Button from "src/components/Button";
import Spacer from "src/components/Spacer";
import { colors, fade, basePadding } from "src/styles";
import Store from "src/store";
import { useLocalStore } from "mobx-react";
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
import { round, fromWei } from "src/utils/units";
import styled from "@emotion/styled";
import { Market } from "src/types";
import PlaceholderBox from "src/components/PlaceholderBox";
import StoreContext from "./StoreContext";
import { useObserver } from "mobx-react-lite";
import useErc20Balance from "src/hooks/useErc20Balance";

interface Props {
  store?: Store;
  onClose: any;
  market: Market;
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

const ErrorMessage = styled.div`
  font-size: 16px;
  padding: ${basePadding}px;
  color: ${colors.red};
  border: 2px solid ${colors.red};
  border-radius: 4px;
`;

function NetworkWarning({ children }: { children: React.ReactChild }) {
  return useObserver(() => {
    const store = useContext(StoreContext);
    if (store.eth.networkId !== Store.getDesiredNetworkId())
      return (
        <ErrorMessage>
          <b>Wrong network</b>: switch over to{" "}
          {Store.getDesiredNetworkId() === "1" ? "Mainnet" : "Kovan"} to
          activate this market.
        </ErrorMessage>
      );
    return <>{children}</>;
  });
}

export default function ActivateDraftModal(props: Props) {
  return useObserver(() => {
    const store = useContext(StoreContext);
    const repBalance = useErc20Balance(
      store.repAddress,
      store.eth.currentAddress
    );

    const local = useLocalStore(
      source => ({
        repCost: undefined as BigNumber | undefined,
        ethCost: undefined as BigNumber | undefined,
        ethRequired: undefined as BigNumber | undefined,
        augurAllowance: undefined as BigNumber | undefined,
        activationStatus: "none" as "none" | "signing" | "activating" | "error",
        buyStatus: "none" as "none" | "signing" | "buying" | "error",
        get additionalRepNeededToActivateMarket() {
          if (source.repBalance && local.repCost) {
            if (source.repBalance.gte(local.repCost)) return new BigNumber(0);
            else return local.repCost.minus(source.repBalance);
          }
          return null;
        }
      }),
      {
        repBalance
      }
    );

    const getUniswapExchangeRate = useCallback(async () => {
      if (!local.additionalRepNeededToActivateMarket) return;
      local.ethRequired = await store.getUniswapExchangeRate(
        "rep",
        local.additionalRepNeededToActivateMarket
      );
    }, []);

    const fetchAugurCosts = useCallback(async () => {
      [local.repCost, local.ethCost] = await store.getMarketCreationCost();
    }, []);

    const buyRep = useCallback(async () => {
      if (!local.ethRequired || !local.additionalRepNeededToActivateMarket)
        return;
      local.buyStatus = "signing";
      try {
        const emitter = store.buyFromUniswap(
          "rep",
          local.ethRequired,
          local.additionalRepNeededToActivateMarket
        );
        emitter.on("signed", () => (local.buyStatus = "buying"));
        await emitter;
      } catch (e) {
        console.error(e);
        local.buyStatus = "error";
      }
    }, []);

    const activateMarket = useCallback(async () => {
      local.activationStatus = "signing";
      try {
        const emitter = store.activateDraftMarket(props.market);
        emitter.on("signed", () => (local.activationStatus = "activating"));
        await emitter;
        props.onClose();
      } catch (e) {
        console.error(e);
        local.activationStatus = "error";
      }
    }, []);

    useEffect(
      () =>
        reaction(
          () => local.additionalRepNeededToActivateMarket,
          getUniswapExchangeRate
        ),
      []
    );

    useEffect(() => void fetchAugurCosts(), []);

    const { market } = props;
    return (
      <ModalForm>
        <ModalFormHeader>
          <h3>Activate market</h3>
          <Spacer small />
          <h2>{market.description}</h2>
        </ModalFormHeader>
        <ModalFormContent>
          <div>Make a deposit to deploy this market to Augur.</div>
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
            {local.repCost ? (
              <span style={{ color: colors.textBlack }}>
                <Tooltip
                  content={`${local.repCost.div(TEN_18).toString()} REP`}
                >
                  <b>{round(fromWei(local.repCost), 3)}</b> <small>REP</small>
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
            {local.ethCost ? (
              <span style={{ color: colors.textBlack }}>
                <Tooltip
                  content={`${local.ethCost.div(TEN_18).toString()} ETH`}
                >
                  <b>{round(fromWei(local.ethCost), 3)}</b> <small>ETH</small>
                </Tooltip>
              </span>
            ) : (
              <PlaceholderBox />
            )}
          </EarningsItem>

          {local.additionalRepNeededToActivateMarket &&
            local.additionalRepNeededToActivateMarket.lte(0) && (
              <Fragment>
                <Spacer size={2} />
                {local.activationStatus !== "error" ? (
                  <NetworkWarning>
                    <Button
                      block
                      onClick={activateMarket}
                      disabled={local.activationStatus !== "none"}
                    >
                      {local.activationStatus === "none" && "Activate Market"}
                      {local.activationStatus === "signing" &&
                        "Please check your wallet..."}
                      {local.activationStatus === "activating" &&
                        "Activating market..."}
                    </Button>
                  </NetworkWarning>
                ) : (
                  <ErrorMessage>
                    Something went wrong during market activation.
                  </ErrorMessage>
                )}
              </Fragment>
            )}
        </ModalFormContent>
        {local.additionalRepNeededToActivateMarket &&
          local.additionalRepNeededToActivateMarket.gt(0) && (
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
                      content={`${local.additionalRepNeededToActivateMarket
                        .div(TEN_18)
                        .toString()} REP`}
                    >
                      {round(
                        fromWei(local.additionalRepNeededToActivateMarket),
                        3
                      )}{" "}
                      REP
                    </Tooltip>{" "}
                    for{" "}
                    {local.ethRequired ? (
                      <Tooltip
                        content={`${local.ethRequired
                          .div(TEN_18)
                          .toString()} ETH`}
                      >
                        {round(fromWei(local.ethRequired), 3)} ETH
                      </Tooltip>
                    ) : (
                      "0.000 ETH"
                    )}{" "}
                    on 🦄 Uniswap.
                  </div>
                  <Spacer />
                  {local.buyStatus === "error" && (
                    <>
                      <ErrorMessage>
                        Something went wrong when buying REP. Try again in a few
                        seconds.
                      </ErrorMessage>
                      <Spacer />
                    </>
                  )}

                  <Button
                    color={"#F737E4"}
                    block
                    disabled={local.buyStatus !== "none"}
                    onClick={buyRep}
                  >
                    {(local.buyStatus === "none" ||
                      local.buyStatus === "error") &&
                      `Buy ${round(
                        fromWei(local.additionalRepNeededToActivateMarket),
                        3
                      )} REP`}
                    {local.buyStatus === "signing" &&
                      "Please check your wallet..."}
                    {local.buyStatus === "buying" && "Buying REP..."}
                  </Button>
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
                  {local.buyStatus !== "error" ? (
                    <Button
                      color={colors.blue}
                      block
                      disabled={local.buyStatus !== "none"}
                      onClick={buyRep}
                    >
                      {local.buyStatus === "none" && "Get REP"}
                      {local.buyStatus === "signing" &&
                        "Please check your wallet..."}
                      {local.buyStatus === "buying" && "Getting REP..."}
                    </Button>
                  ) : (
                    <ErrorMessage>
                      Whoops, something went wrong when getting REP.
                    </ErrorMessage>
                  )}
                </ModalFormHeader>
              )}
            </Fragment>
          )}
      </ModalForm>
    );
  });
}
