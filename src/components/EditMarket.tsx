import React, { useCallback, useRef } from "react";
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
import { Observer } from "mobx-react";
import { useObserver } from "mobx-react-lite";

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
        mutation UpdateMarket($uid: String!, $market: MarketInput) {
          updateMarket(uid: $uid, market: $market) {
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
            minPrice
            maxPrice
            scalarDenomination
            metadata
            marketCreatorFeeRate
          }
        }
      `
    );
    const [isCreating, setIsCreating] = useState(false);

    const updateMarketCallback = useCallback(async () => {
      if (!data || !form.current) return;
      setIsCreating(true);
      await updateMarket({
        variables: {
          uid: data.market.uid,
          market: {
            ...form.current.toParams(),
            author: "me"
          }
        }
      });
      props.history.push(`/market/${data.market.uid}`);
    }, [setIsCreating, updateMarket]);

    const form = useRef<MarketFormStore | null>(null);

    if (error) return <>Error</>; // TODO
    if (!form.current && !loading && data) {
      console.log(data);
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
              <Button
                onClick={updateMarketCallback}
                disabled={!form.current.isValid || isCreating}
              >
                {isCreating ? "Updating..." : "Update Draft"}
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
