import React, { Component } from "react";
import styled from "@emotion/styled";

interface Props {
  name: string;
  block?: boolean;
}

const IconWrapper = styled("i")<{ block?: boolean }>`
  vertical-align: middle;
  ${props => !props.block && `transform: translateY(-0.075em)`};
  margin-left: -2px;
  margin-right: -2px;
  font-size: 1.2em;
  line-height: 1;
`;

export default class Icon extends Component<
  Props & React.HTMLProps<HTMLSpanElement>
> {
  render() {
    const { className, name, block, ...props } = this.props;
    return (
      <IconWrapper
        className={`material-icons ${className}`}
        block={block}
        {...props}
      >
        {name}
      </IconWrapper>
    );
  }
}
