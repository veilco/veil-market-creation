import React from "react";
import { useContext } from "react";
import StoreContext from "src/components/StoreContext";
import { useObserver } from "mobx-react-lite";
import styled from "@emotion/styled";
import { colors, basePadding } from "src/styles";
import TextLink from "src/components/TextLink";

const Blocker = styled.div`
  border: 1px solid ${colors.red};
  border-radius: 5px;
  color: ${colors.red};
  padding: ${basePadding}px;
`;

export default function ActionBlocker(props: {
  children: React.ReactChild;
  blockerText: string;
}) {
  return useObserver(() => {
    const store = useContext(StoreContext);

    if (!store.eth.isConnected)
      return (
        <Blocker>
          <b>{props.blockerText}</b>: No wallet detected.
        </Blocker>
      );
    if (!store.eth.isUnlocked || !store.eth.isEnabled)
      return (
        <Blocker>
          <b>{props.blockerText}</b>: Wallet locked.
          {!store.eth.isEnabled && (
            <>
              {" "}
              <TextLink onClick={() => store.eth.enable()}>
                Click here to unlock.
              </TextLink>
            </>
          )}
        </Blocker>
      );
    return <>{props.children}</>;
  });
}
