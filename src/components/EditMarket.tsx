import React, { useCallback, useRef, useContext } from "react";
import { useMutation, useQuery } from "react-apollo-hooks";
import gql from "graphql-tag";
import { useState } from "react";
import { Market } from "src/types";
import { RouteComponentProps } from "react-router-dom";
import MarketForm, { MarketFormStore } from "./MarketForm";
import Button from "src/components/Button";
import Spacer from "src/components/Spacer";
import {
  MarketBackground,
  MarketContainer,
  MarketBox,
  MarketBoxSidebar
} from "src/components/Market";
import { colors } from "src/styles";
import Badge from "src/components/Badge";
import {
  MarketStatusHeading,
  MarketStatusText
} from "src/components/ViewMarket";
import { useObserver } from "mobx-react-lite";
import StoreContext from "src/components/StoreContext";
import Error404 from "src/components/Error404";

export default function EditMarket(
  props: RouteComponentProps<{ uid: string }>
) {
  return useObserver(() => {
    const { data, loading, error } = useQuery<{ market: Market }>(
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
            metadata
            marketCreatorFeeRate
          }
        }
      `,
      { variables: { uid: props.match.params.uid } }
    );

    const updateMarket = useMutation<{ updateMarket: Market }>(
      gql`
        mutation UpdateMarket(
          $uid: String!
          $market: MarketInput!
          $signature: Signature!
        ) {
          updateMarket(uid: $uid, market: $market, signature: $signature) {
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
            metadata
            marketCreatorFeeRate
          }
        }
      `
    );
    const [isUpdating, setIsUpdating] = useState(false);
    const [isError, setIsError] = useState(false);
    const store = useContext(StoreContext);

    const updateMarketCallback = useCallback(async () => {
      try {
        if (!data || !form.current) return;
        setIsUpdating(true);
        const market = form.current.toParams();
        const signature = await store.signMarket(market);
        await updateMarket({
          variables: {
            uid: data.market.uid,
            market: {
              ...market,
              author: store.eth.currentAddress
            },
            signature
          }
        });
        props.history.push(`/market/${data.market.uid}`);
      } catch (e) {
        setIsError(true);
        setIsUpdating(false);
      }
    }, [setIsUpdating, updateMarket]);

    const form = useRef<MarketFormStore | null>(null);

    if (error) return <Error404 />; // TODO
    if (!form.current && !loading && data) {
      form.current = MarketFormStore.fromMarket(data.market);
    }
    if (loading || !form.current) return null;

    return (
      <MarketBackground>
        <MarketContainer>
          <MarketBox>
            <div>
              <MarketForm form={form.current} />
              <Spacer big />
              {isError && (
                <>
                  <span style={{ color: colors.red }}>
                    There was an error while saving your draft. Please try
                    again.
                  </span>
                  <Spacer />
                </>
              )}
              <Button
                onClick={updateMarketCallback}
                disabled={!form.current.isValid || isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Draft"}
              </Button>
            </div>
            <MarketBoxSidebar>
              <MarketStatusHeading>
                Market status
                <Spacer inline />
                <Badge color={colors.orange}>Draft</Badge>
              </MarketStatusHeading>
              <Spacer />
              <MarketStatusText>
                This market is a draft. It has not been created on Augur yet and
                can be edited.
              </MarketStatusText>
            </MarketBoxSidebar>
          </MarketBox>
        </MarketContainer>
      </MarketBackground>
    );
  });
}
