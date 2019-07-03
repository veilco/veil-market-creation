import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/core";
import { headerHeight, colors } from "src/styles";
import Spacer from "src/components/Spacer";
import Divider from "src/components/Divider";
import Icon from "src/components/Icon";
import { Link } from "react-router-dom";
import { now } from "mobx-utils";
import ms from "ms";
import { Popover } from "src/components/Popover";
import { Transaction } from "src/store/Transactions";
import Store from "src/store";

const TransactionHeader = styled.div`
  font-size: 12px;
  color: ${colors.textGrey};
`;

const None = styled.div`
  color: ${colors.lightTextGrey};
`;

const Container = styled.div`
  position: relative;
  height: ${headerHeight}px;
  display: flex;
  align-items: center;
`;

const TransactionContainer = styled.div`
  & small {
    font-size: 12px;
    color: ${colors.textGrey};
  }

  & a {
    font-size: 12px;
    color: ${colors.blue};
    text-decoration: none;
  }

  & a:hover {
    text-decoration: underline;
  }
`;

const CircleAnimateContainer = styled.div`
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  border-radius: 50%;
  box-shadow: inset 0 0 0 2px ${colors.borderGrey};

  font-size: 12px;
`;

const CircleAnimate = styled.div`
  position: absolute;
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-top-color: ${colors.blue};
  border-radius: 50%;
  animation: ${keyframes`
    100% {
      transform: rotate(360deg);
    }
  `} 0.5s ease-in-out infinite;
`;

interface Props {
  store: Store;
}

@inject("store")
@observer
export default class ConsumerHeaderTransactions extends Component<Props> {
  transactionName(tx: Transaction) {
    return {
      activateDraftMarket: "Market activation"
    }[tx.type as "activateDraftMarket"];
  }

  transactionLink(tx: Transaction) {
    const icon = <Icon name="arrow_forward" />;
    if (tx.type === "createOrder")
      return (
        <Link to={`/market/${tx.metadata.marketSlug}`}>View market {icon}</Link>
      );
    return (
      <a
        target="_blank"
        href={`${this.props.store.eth.etherscanUrl}/tx/${tx.transactionHash}`}
      >
        View on Etherscan {icon}
      </a>
    );
  }

  formatTime(time: Date) {
    return ms(Math.max(1000, now() - time.getTime()));
  }

  render() {
    const {
      pending,
      completed,
      isOpen,
      pendingCount
    } = this.props.store.transactions;
    return (
      <Container>
        <CircleAnimateContainer
          onClick={() =>
            (this.props.store.transactions.isOpen = !this.props.store
              .transactions.isOpen)
          }
        >
          {pendingCount > 0 && <CircleAnimate />}
          {pendingCount}
        </CircleAnimateContainer>
        <Popover
          isOpen={isOpen}
          onClose={() => (this.props.store.transactions.isOpen = false)}
        >
          <Spacer />
          <TransactionHeader>Pending transactions</TransactionHeader>
          <Spacer />
          {pending.map(tx => (
            <TransactionContainer key={tx.uid}>
              {this.transactionName(tx)} <Spacer inline small />
              <small>Queued {this.formatTime(tx.createdAt)} ago</small>
              <br />
              {this.transactionLink(tx)}
              <Spacer />
            </TransactionContainer>
          ))}
          {pending.length === 0 && (
            <None>
              None
              <Spacer />
            </None>
          )}
          <Divider color={colors.borderGrey} />
          <Spacer />
          <TransactionHeader>Completed transactions</TransactionHeader>
          <Spacer />
          {completed.slice(0, 10).map(tx => (
            <TransactionContainer key={tx.uid}>
              {this.transactionName(tx)} <Spacer inline small />
              <small>
                Completed {tx.completedAt && this.formatTime(tx.completedAt)}{" "}
                ago
              </small>
              <br />
              {this.transactionLink(tx)}
              <Spacer />
            </TransactionContainer>
          ))}
          {completed.length === 0 && (
            <None>
              None
              <Spacer />
            </None>
          )}
        </Popover>
      </Container>
    );
  }
}
