import React, { useContext } from "react";
import styled from "@emotion/styled";
import Spacer from "src/components/Spacer";
import Button from "src/components/Button";
import Icon from "src/components/Icon";
import Transactions from "src/components/Transactions";
import { colors, basePadding, headerHeight, media } from "src/styles";
import { Link } from "react-router-dom";
import StoreContext from "./StoreContext";
import Wallet from "src/components/Wallet";
const logo = require("src/images/logo.png");

const HeaderContainer = styled.div`
  padding: 0 ${basePadding}px;
  display: flex;
  align-items: center;
  height: ${headerHeight}px;
  background-color: #fff;
  border-bottom: 1px solid ${colors.lightBorderGrey};
  & .your-markets {
    text-decoration: none;
  }

  ${media.phone} {
    & .your-markets {
      display: none;
    }
  }
`;

const LogoContainer = styled.div`
  & img {
    width: 36px;
  }
`;

export default function Header() {
  const store = useContext(StoreContext);
  return (
    <HeaderContainer>
      <LogoContainer>
        <Link to="/">
          <img src={logo} />
        </Link>
      </LogoContainer>
      <Link className="your-markets" to="/">
        <Spacer inline big />
        Your Markets
      </Link>
      <div style={{ flex: 1 }} />
      <Button small to="/create">
        <Icon name="add" block /> Create
      </Button>
      <Spacer inline />
      <Transactions store={store} />
      <Spacer inline />
      <Wallet />
    </HeaderContainer>
  );
}
