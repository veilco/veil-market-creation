import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useQuery } from "react-apollo-hooks";
import gql from "graphql-tag";
import { Market } from "src/types";

export default function ViewMarket(
  props: RouteComponentProps<{ uid: string }>
) {
  const { data, loading, error } = useQuery<{ market: Market }>(
    gql`
      query GetMarket($uid: String!) {
        market(uid: $uid) {
          uid
          description
          author
        }
      }
    `,
    { variables: { uid: props.match.params.uid } }
  );

  if (loading) return <>Loading...</>;
  if (error || !data) return <>Error</>;

  return (
    <>
      <div>{data.market.description}</div>
      <div>{data.market.author}</div>
    </>
  );
}
