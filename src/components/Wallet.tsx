import React from "react";
import { useContext } from "react";
import StoreContext from "src/components/StoreContext";
import { useObserver } from "mobx-react-lite";
import styled from "@emotion/styled";
import { colors, basePadding } from "src/styles";

const WalletContainer = styled.div<{ clickable?: boolean }>`
  font-size: 14px;
  border: 1px solid ${colors.borderGrey};
  border-radius: 5px;
  padding: ${basePadding / 3}px ${basePadding / 2}px;
  cursor: ${props => (props.clickable ? "pointer" : "default")};
  ${props =>
    props.clickable &&
    `
    cursor: pointer;
    &:hover {
      background-color: #fbfcfd;
    }
  `}
  & span {
    font-size: 12px;
    color: ${colors.darkTextGrey};
    display: block;
  }
`;

function truncateAddress(address: string) {
  return address.substr(0, 8) + "..." + address.substr(36, 6);
}

export default function Wallet() {
  return useObserver(() => {
    const store = useContext(StoreContext);

    const currentAddress = store.eth.currentAddress;
    if (!store.eth.isConnected)
      return (
        <WalletContainer>
          Not connected
          <span>No wallet detected</span>
        </WalletContainer>
      );
    if (!store.eth.isUnlocked || !store.eth.isEnabled)
      return (
        <WalletContainer
          clickable={!store.eth.isEnabled}
          onClick={store.eth.isEnabled ? undefined : () => store.eth.enable()}
        >
          Wallet locked
          {store.eth.isEnabled ? (
            <span>Unlock to connect</span>
          ) : (
            <span>Click here to unlock</span>
          )}
        </WalletContainer>
      );
    return (
      <WalletContainer>
        Connected<span>{truncateAddress(currentAddress)}</span>
      </WalletContainer>
    );
  });
}
