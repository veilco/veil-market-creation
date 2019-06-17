import React from "react";
import { Global, css } from "@emotion/core";
import MarketList from "src/components/MarketList";
import CreateMarket from "src/components/CreateMarket";
import ViewMarket from "src/components/ViewMarket";
import Header from "src/components/Header";
import { BrowserRouter, Route } from "react-router-dom";

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

            button,
            input {
              font-family: inherit;
            }

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              margin: 0;
            }
          `}
        />
        <Header />
        <Route path="/" exact component={MarketList} />
        <Route path="/market/:uid" component={ViewMarket} />
        <Route path="/create" component={CreateMarket} />
      </BrowserRouter>
    </>
  );
}
