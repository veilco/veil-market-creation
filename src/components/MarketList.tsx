import React, { useContext, useEffect } from "react";
import { useQuery } from "react-apollo-hooks";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import getTimezoneName from "src/utils/getTimezoneName";
import MarketStatusBadge from "src/components/MarketStatusBadge";
import { Market } from "src/types";
import { colors, basePadding } from "src/styles";
import Spacer from "src/components/Spacer";
import StoreContext from "src/components/StoreContext";
import { useObserver } from "mobx-react-lite";
import BigLoader from "src/components/BigLoader";
import TextLink from "./TextLink";

const Wrapper = styled.div`
  padding: 0 ${basePadding * 2}px;
`;

const TableWrapper = styled.div`
  overflow: auto;
  padding: 1px;
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
  min-width: 540px;
  margin-right: 1px;

  ${Td} {
    padding: ${basePadding}px;
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

const NoResults = styled.div<{ error?: boolean }>`
  text-align: center;
  font-size: 18px;
  color: ${props => (props.error ? colors.red : colors.textGrey)};
`;

const WalletWarning = styled.div`
  border-radius: 5px;
  border: 1px solid ${colors.red};
  color: ${colors.red};
  padding: ${basePadding * 1.5}px;
  font-size: 18px;
  line-height: 1.4;
`;

const RelativeTime = styled.div`
  font-size: 14px;
  color: ${colors.textGrey};
`;

export default function MarketList() {
  return useObserver(() => {
    const store = useContext(StoreContext);
    const { data, error, loading, refetch } = useQuery<{ markets: Market[] }>(
      gql`
        query MarketList($address: String!) {
          markets(author: $address) {
            uid
            description
            status
            author
            endTime
          }
        }
      `,
      {
        fetchPolicy: "no-cache",
        variables: {
          address: store.eth.currentAddress || ""
        }
      }
    );
    useEffect(() => {
      if (store.eth.currentAddress) refetch();
    }, [store.eth.currentAddress]);

    if (loading)
      return (
        <>
          <Spacer big />
          <BigLoader />
        </>
      );
    const markets = error || !data ? [] : data.markets;

    return (
      <Wrapper>
        <Spacer big />
        {store.eth.hasLoadedCurrentAddressFirstTime && (
          <>
            {!store.eth.isConnected && (
              <>
                <WalletWarning>
                  <b>Warning:</b> It looks like you don't have an Ethereum
                  wallet installed. You can install a wallet like{" "}
                  <a href="https://metamask.io/">Metamask</a>,{" "}
                  <a href="https://wallet.coinbase.com/">Coinbase Wallet</a>, or{" "}
                  <a href="https://tokenmint.io/blog/web-3-enabled-ethereum-wallets-and-browsers.html">
                    others
                  </a>{" "}
                  to create markets using this tool.
                </WalletWarning>
                <Spacer big />
              </>
            )}
            {store.eth.isConnected &&
              (!store.eth.isUnlocked || !store.eth.isEnabled) && (
                <>
                  <WalletWarning>
                    <b>Note:</b> Your wallet is locked. To see the markets and
                    drafts you've created,{" "}
                    {store.eth.isEnabled ? (
                      "unlock your wallet"
                    ) : (
                      <TextLink onClick={() => store.eth.enable()}>
                        unlock your wallet
                      </TextLink>
                    )}
                    .
                  </WalletWarning>
                  <Spacer big />
                </>
              )}
          </>
        )}
        <Heading>
          Your Augur Markets
          <Spacer xsmall />
          <small>These are Augur markets or drafts you have created.</small>
        </Heading>
        <Spacer />
        <TableWrapper>
          <Table>
            <Tr className="head">
              <Td style={{ width: "50%" }}>Market</Td>
              <Td style={{ width: "35%" }}>Expiration</Td>
              <Td style={{ width: "15%" }}>Status</Td>
            </Tr>
            {markets.map(market => (
              <TrLink to={`/market/${market.uid}`} key={market.uid}>
                <Td>{market.description}</Td>
                <Td>
                  {format(new Date(market.endTime), "MMMM d, yyyy h:mma ")}{" "}
                  {getTimezoneName()}
                  <br />
                  <RelativeTime>
                    {formatDistanceToNow(new Date(market.endTime), {
                      addSuffix: true
                    })}
                  </RelativeTime>
                </Td>
                <Td>
                  <MarketStatusBadge market={market} />
                </Td>
              </TrLink>
            ))}
          </Table>
          <Spacer big />
          {!error && markets.length === 0 && (
            <NoResults>
              No markets or drafts yet.{" "}
              <Link to="/create">Create one now.</Link>
              <Spacer big />
            </NoResults>
          )}
          {error && (
            <>
              <NoResults error>
                There was an error loading markets. Please{" "}
                <TextLink onClick={() => (window.location = window.location)}>
                  refresh
                </TextLink>{" "}
                in a few seconds.
              </NoResults>
            </>
          )}
        </TableWrapper>
      </Wrapper>
    );
  });
}
