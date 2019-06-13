import React, { Component } from "react";
import styled from "@emotion/styled";
import Spacer from "./Spacer";
import { colors, lighten } from "../styles";

interface Props {
  inline?: boolean;
  color?: string;
  padded?: number | boolean;
  dark?: boolean;
  style?: React.CSSProperties;
}

const Line = styled("hr")<Props>`
  margin: 0;
  padding: 0;
  border: none;
  ${props =>
    props.inline
      ? `border-right: 1px solid ${props.color || lighten(colors.bgLight, 10)}`
      : `border-bottom: 1px solid ${props.color ||
          lighten(colors.bgLight, 10)}`};
  height: ${props => (props.inline ? "100%" : 0)};
  width: ${props => (props.inline ? 0 : "100%")};
`;

export default class Divider extends Component<Props> {
  render() {
    let { padded, inline, color, dark, ...props } = this.props;
    if (dark) color = colors.bgLight;
    const size = parseFloat((padded || "1").toString()) || 1;
    return (
      <React.Fragment>
        {padded && <Spacer inline={inline} size={size} />}
        <Line color={color} inline={inline} {...props} />
        {padded && <Spacer inline={inline} size={size} />}
      </React.Fragment>
    );
  }
}
