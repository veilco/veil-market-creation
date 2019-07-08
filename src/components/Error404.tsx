import React from "react";
import styled from "@emotion/styled";
import { colors } from "src/styles";
import Spacer from "src/components/Spacer";

const Error404Page = styled.div`
  text-align: center;
  & h1 {
    text-align: center;
    font-size: 42px;
    font-weight: 500;
  }

  & span {
    font-size: 24px;
    color: ${colors.textGrey};
  }
`;

export default function Error404() {
  return (
    <Error404Page>
      <Spacer size={4} />
      <h1>404 :(</h1>
      <span>Page not found</span>
    </Error404Page>
  );
}
