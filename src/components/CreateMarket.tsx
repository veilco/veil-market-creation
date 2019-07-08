import React, { useCallback, useRef, useContext } from "react";
import { useMutation } from "react-apollo-hooks";
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
import StoreContext from "src/components/StoreContext";
import { useObserver } from "mobx-react-lite";
import ActionBlocker from "./ActionBlocker";

export default function CreateMarket(props: RouteComponentProps) {
  return useObserver(() => {
    const createMarket = useMutation<{ createMarket: Market }>(
      gql`
        mutation CreateMarket($market: MarketInput!) {
          createMarket(market: $market) {
            description
          }
        }
      `
    );
    const [isCreating, setIsCreating] = useState(false);
    const store = useContext(StoreContext);

    const createMarketCallback = useCallback(async () => {
      setIsCreating(true);
      const market = form.current.toParams();
      const signature = await store.signMarket(market);
      await createMarket({
        variables: {
          market: {
            ...market,
            author: store.eth.currentAddress
          },
          signature
        }
      });
      props.history.push("/");
    }, [setIsCreating, createMarket]);

    const form = useRef(new MarketFormStore());

    return (
      <MarketBackground>
        <MarketContainer>
          <MarketBox>
            <div>
              <MarketForm form={form.current} />
              <Spacer big />
              <ActionBlocker blockerText="Unable to create draft">
                <Button
                  onClick={createMarketCallback}
                  disabled={!form.current.isValid || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Draft"}
                </Button>
              </ActionBlocker>
            </div>
            <MarketBoxSidebar>
              <MarketStatusHeading>
                Market status
                <Spacer inline />
                <Badge color={colors.purple}>Unsaved</Badge>
              </MarketStatusHeading>
              <Spacer />
              <MarketStatusText>
                This market is unsaved. When you save it, it will become a draft
                market and will be visible to the public.
              </MarketStatusText>
            </MarketBoxSidebar>
          </MarketBox>
        </MarketContainer>
      </MarketBackground>
    );
  });
}
