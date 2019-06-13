import React from "react";
import { useQuery } from "react-apollo-hooks";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import format from "date-fns/format";
import getTimezoneName from "src/utils/getTimezoneName";
import Badge from "src/components/Badge";
import { Market } from "src/types";
import { colors } from "src/styles";

const Table = styled.table`
  table-layout: fixed;
`;

export default function MarketList() {
  const { data, error, loading } = useQuery<{ markets: Market[] }>(
    gql`
      query MarketList {
        markets(author: "me") {
          uid
          description
          status
          author
          endTime
        }
      }
    `,
    {
      fetchPolicy: "no-cache"
    }
  );

  if (loading) return <>Loading...</>;
  if (error || !data) return <>Error</>;

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Market</th>
            <th>Expiration</th>
            <th>Status</th>
            <th>Open Interest</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
          {data.markets.map(market => (
            <tr>
              <td>
                <Link to={`/market/${market.uid}`}>{market.description}</Link>
              </td>
              <td>
                {format(market.endTime, "MMMM d, YYYY h:mmA ")}{" "}
                {getTimezoneName()}
              </td>
              <td>
                {market.status === "draft" && (
                  <Badge color={colors.orange}>DRAFT</Badge>
                )}
                {market.status === "activated" && (
                  <Badge color={colors.blue}>ACTIVE</Badge>
                )}
                {market.status === "activating" && (
                  <Badge color={colors.blue}>ACTIVATING</Badge>
                )}
              </td>
              <td>-</td>
              <td>-</td>
            </tr>
          ))}
          <tr />
        </tbody>
      </Table>
      <Link to="/create">Create new market</Link>
    </>
  );
}
