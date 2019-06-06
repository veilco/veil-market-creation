import React from "react";
import StoreContext from "./StoreContext";
import { useContext } from "react";
import styled from "@emotion/styled";
import { Global, css } from "@emotion/core";
import Spacer from "src/components/Spacer";

const Heading = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

export default function App() {
  const store = useContext(StoreContext);
  console.log(store);
  return (
    <>
      <Global
        styles={css`
          body {
            margin: 0;
            font-family: system-ui;
          }
        `}
      />
      <Heading>
        <Spacer />
        <Spacer inline />
        Hello world!
      </Heading>
    </>
  );
}
