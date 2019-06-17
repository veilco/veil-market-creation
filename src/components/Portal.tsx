import React from "react";
import ReactDOM from "react-dom";

// Useful for rendering subtrees outside of the context of a parent.
class Portal extends React.Component {
  node: HTMLDivElement | null;

  componentWillMount() {
    this.createNode();
  }

  componentWillUnmount() {
    this.removeNode();
  }

  createNode() {
    if (!this.node) {
      this.node = document.createElement("div");
      document.body.appendChild(this.node);
    }
  }

  removeNode() {
    if (this.node) {
      document.body.removeChild(this.node);
    }
    this.node = null;
  }

  render() {
    if (!this.node) return null;
    return ReactDOM.createPortal(this.props.children, this.node);
  }
}

export default Portal;
