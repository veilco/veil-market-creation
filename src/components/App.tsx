import React from "react";
import { Global, css } from "@emotion/core";
import MarketList from "src/components/MarketList";
import CreateMarket from "src/components/CreateMarket";
import ViewMarket from "src/components/ViewMarket";
import EditMarket from "src/components/EditMarket";
import Header from "src/components/Header";
import { BrowserRouter, Route } from "react-router-dom";
import { lighten, colors } from "src/styles";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Global
          styles={css`
            body {
              margin: 0;
              font-family: system-ui;
              background-color: #fbfcfd;
              font-family: "Inter", system-ui, sans-serif;
            }

            * {
              box-sizing: border-box;
            }

            button,
            input {
              font-family: inherit;
            }

            button:focus,
            button:active {
              outline: 0 none;
              box-shadow: 0 0 0 1px ${lighten(colors.blue, 20)};
            }

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              margin: 0;
            }

            a,
            a:hover,
            a:visited,
            a:active {
              color: inherit;
            }
          `}
        />
        <Header />
        <Route path="/" exact component={MarketList} />
        <Route path="/market/:uid" component={ViewMarket} />
        <Route path="/edit/:uid" component={EditMarket} />
        <Route path="/create" component={CreateMarket} />
      </BrowserRouter>
    </>
  );
}
