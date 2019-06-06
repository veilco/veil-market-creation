import Root from "./components/Root";
import ReactDOM from "react-dom";
import React from "react";

function render(RootToRender: typeof Root) {
  ReactDOM.render(
    React.createElement(RootToRender),
    document.getElementById("root")
  );
}

render(Root);

if (module.hot) {
  module.hot.accept("./components/Root", () => {
    const NewRoot = require("./components/Root").default;
    render(NewRoot);
  });
}
