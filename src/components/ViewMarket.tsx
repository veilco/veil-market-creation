import React, { useState, useEffect, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useQuery } from "react-apollo-hooks";
import gql from "graphql-tag";
import { Market } from "src/types";
import {
  MarketBackground,
  MarketContainer,
  MarketBox,
  MarketBoxSidebar
} from "src/components/Market";
import styled from "@emotion/styled";
import MarketStatusBadge from "src/components/MarketStatusBadge";
import Spacer from "src/components/Spacer";
import { colors } from "src/styles";
import format from "date-fns/format";
import { fromWei } from "src/utils/units";
import Divider from "src/components/Divider";
import Button from "src/components/Button";
import ActivateDraftModal from "src/components/ActivateDraftModal";
import Modal from "src/components/Modal";
import Error404 from "src/components/Error404";
import StoreContext from "src/components/StoreContext";
import { useObserver } from "mobx-react-lite";

const Label = styled.div`
  font-size: 12px;
  color: ${colors.textGrey};
  text-transform: uppercase;
  font-weight: 500;
`;

const MarketQuestion = styled.h1`
  font-size: 22px;
  font-weight: 500;
`;

const MarketDescription = styled.div`
  font-size: 16px;
`;

const MarketExpiration = styled.div`
  font-size: 14px;
  color: ${colors.darkTextGrey};
`;

export const MarketStatusHeading = styled.div`
  font-weight: 500;
  font-size: 18px;
`;

export const MarketStatusText = styled.div`
  color: ${colors.textGrey};
  font-size: 14px;
`;

export function MarketStatusSection({ market }: { market: Market }) {
  return (
    <>
      <MarketStatusHeading>
        Market status
        <Spacer inline />
        <MarketStatusBadge market={market} />
      </MarketStatusHeading>
      <Spacer />
      <MarketStatusText>
        {market.status === "activating" && (
          <>
            This market is currently being activated. As soon as the Ethereum
            transaction finishes executing, the market will be active and
            available to trade.
          </>
        )}
        {market.status === "active" && (
          <>
            This market is active. It has been created on Augur and cannot be
            changed. Anyone can find this market and trade in it.
          </>
        )}
        {market.status === "draft" && (
          <>
            This market is a draft. It has not been created on Augur yet and can
            be edited.
          </>
        )}
      </MarketStatusText>
    </>
  );
}

export default function ViewMarket(
  props: RouteComponentProps<{ uid: string }>
) {
  return useObserver(() => {
    const { data, loading, error, refetch } = useQuery<{ market: Market }>(
      gql`
        query GetMarket($uid: String!) {
          market(uid: $uid) {
            uid
            description
            author
            status
            details
            endTime
            type
            resolutionSource
            tags
            category
            numTicks
            minPrice
            maxPrice
            scalarDenomination
            marketCreatorFeeRate
          }
        }
      `,
      { variables: { uid: props.match.params.uid } }
    );
    const store = useContext(StoreContext);

    useEffect(() => {
      let interval: any;
      if (data && data.market && data.market.status === "activating") {
        interval = setInterval(refetch, 2000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [data, refetch]);

    const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

    if (loading) return null;
    if (error || !data || !data.market) return <Error404 />;

    return (
      <MarketBackground>
        <MarketContainer>
          <MarketBox>
            <div>
              <Label>Question by {data.market.author}</Label>
              <Spacer small />
              <MarketQuestion>{data.market.description}</MarketQuestion>
              <Spacer small />
              <MarketExpiration>
                Expires{" "}
                {format(new Date(data.market.endTime), "MMMM d, yyyy h:mm a")}
              </MarketExpiration>
              <Spacer />
              {data.market.type === "scalar" && (
                <>
                  <Label>Bounds</Label>
                  <Spacer small />
                  <MarketDescription>
                    {fromWei(data.market.minPrice)} to{" "}
                    {fromWei(data.market.maxPrice)}{" "}
                    <small>({data.market.scalarDenomination})</small>
                  </MarketDescription>
                  <Spacer />
                </>
              )}
              <Label>Details</Label>
              <Spacer small />
              <MarketDescription>{data.market.details}</MarketDescription>
              <Spacer />
              <Label>Resolution source</Label>
              <Spacer small />
              <MarketDescription>
                {data.market.resolutionSource || (
                  <span style={{ color: colors.borderGrey }}>&mdash;</span>
                )}
              </MarketDescription>
              <Spacer />
              <Label>Tags</Label>
              <Spacer small />
              <MarketDescription>
                {(data.market.tags || []).join(", ") || (
                  <span style={{ color: colors.borderGrey }}>&mdash;</span>
                )}
              </MarketDescription>
              <Spacer />
              <Label>Category</Label>
              <Spacer small />
              <MarketDescription>
                {data.market.category || (
                  <span style={{ color: colors.borderGrey }}>&mdash;</span>
                )}
              </MarketDescription>
              <Spacer />
              <Label>Market creator fee</Label>
              <Spacer small />
              <MarketDescription>
                {data.market.marketCreatorFeeRate}%
              </MarketDescription>
            </div>
            <MarketBoxSidebar>
              <MarketStatusSection market={data.market} />
              {data.market.status === "draft" &&
                data.market.author === store.eth.currentAddress && (
                  <>
                    <Divider padded color={colors.lightBorderGrey} />
                    <Button
                      medium
                      block
                      onClick={() => setIsActivationModalOpen(true)}
                      color={colors.darkGreen}
                    >
                      Activate market
                    </Button>
                    <Spacer />
                    <Button
                      medium
                      block
                      to={`/edit/${data.market.uid}`}
                      color={colors.blue}
                    >
                      Edit draft
                    </Button>
                  </>
                )}
            </MarketBoxSidebar>
          </MarketBox>
        </MarketContainer>
        <Modal
          isOpen={isActivationModalOpen}
          onClose={() => setIsActivationModalOpen(false)}
        >
          <ActivateDraftModal
            onClose={() => setIsActivationModalOpen(false)}
            market={data.market}
          />
        </Modal>
      </MarketBackground>
    );
  });
}
