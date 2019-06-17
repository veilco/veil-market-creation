import React, { useCallback, useRef } from "react";
import { useMutation } from "react-apollo-hooks";
import gql from "graphql-tag";
import { useState } from "react";
import { Market } from "src/types";
import { RouteComponentProps } from "react-router-dom";
import MarketForm, { MarketFormStore } from "./MarketForm";

export default function CreateMarket(props: RouteComponentProps) {
  const createMarket = useMutation<{ createMarket: Market }>(
    gql`
      mutation CreateMarket($market: MarketInput) {
        createMarket(market: $market) {
          description
        }
      }
    `
  );

  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const getMarket = () => ({
    description,
    details: "Tests",
    resolutionSource: "",
    endTime: "2019-07-01T00:00:00.000Z",
    tags: ["test", "market"],
    category: "test",
    marketCreatorFeeRate: "0.01",
    author: "me",
    signature: "me"
  });

  const createMarketCallback = useCallback(async () => {
    setIsCreating(true);
    await createMarket({ variables: { market: form.current.toParams() } });
    props.history.push("/");
  }, [setIsCreating, createMarket, getMarket]);

  const form = useRef(new MarketFormStore());

  return (
    <>
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <MarketForm form={form.current} />
      <button onClick={createMarketCallback} disabled={isCreating}>
        {isCreating ? "Creating..." : "Create"}
      </button>
    </>
  );
}
