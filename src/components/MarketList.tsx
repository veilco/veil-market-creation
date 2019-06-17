import React from "react";
import { useQuery } from "react-apollo-hooks";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import format from "date-fns/format";
import getTimezoneName from "src/utils/getTimezoneName";
import Badge from "src/components/Badge";
import { Market } from "src/types";
import { colors, basePadding } from "src/styles";
import Spacer from "src/components/Spacer";

const Wrapper = styled.div`
  padding: 0 ${basePadding}px;
`;

const Tr = styled.div`
  display: table-row;
`;

const TrLink = styled(Tr)`
  text-decoration: none;
  color: inherit;
  background-color: ${colors.white};

  &:hover {
    background-color: transparent;
  }
`.withComponent(Link);

const Td = styled.div`
  display: table-cell;
`;

const Table = styled.div`
  display: table;
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border-style: hidden;
  box-shadow: 0 0 0 1px ${colors.borderGrey};
  overflow: hidden;

  ${Td} {
    padding: ${basePadding / 2}px;
    text-align: left;
    vertical-align: middle;
    border: 1px solid ${colors.borderGrey};
  }

  .head ${Td} {
    background-color: ${colors.lightGrey};
    color: ${colors.darkTextGrey};
    font-weight: 400;
  }
`;

const Heading = styled.h1`
  font-size: 22px;
  font-weight: 500;
  & small {
    font-size: 16px;
    font-weight: 400;
    color: ${colors.darkTextGrey};
  }
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
    <Wrapper>
      <Spacer />
      <Heading>
        Your Augur Markets
        <Spacer xsmall />
        <small>These are Augur markets or draft you have created.</small>
      </Heading>
      <Spacer />
      <Table>
        <Tr className="head">
          <Td style={{ width: "40%" }}>Market</Td>
          <Td style={{ width: "22%" }}>Expiration</Td>
          <Td style={{ width: "12%" }}>Status</Td>
          <Td style={{ width: "18%" }}>Open Interest</Td>
          <Td style={{ width: "18%" }}>Earnings</Td>
        </Tr>
        {data.markets.map(market => (
          <TrLink to={`/market/${market.uid}`} key={market.uid}>
            <Td>{market.description}</Td>
            <Td>
              {format(market.endTime, "MMMM D, YYYY h:mmA ")}{" "}
              {getTimezoneName()}
            </Td>
            <Td>
              {market.status === "draft" && (
                <Badge color={colors.orange}>DRAFT</Badge>
              )}
              {market.status === "activated" && (
                <Badge color={colors.blue}>ACTIVE</Badge>
              )}
              {market.status === "activating" && (
                <Badge color={colors.blue}>ACTIVATING</Badge>
              )}
            </Td>
            <Td>-</Td>
            <Td>-</Td>
          </TrLink>
        ))}
      </Table>
    </Wrapper>
  );
}
