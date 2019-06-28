import React from "react";
import styled from "@emotion/styled";
import { colors, lighten } from "src/styles";
import { Link } from "react-router-dom";

interface Props {
  xsmall?: boolean;
  small?: boolean;
  medium?: boolean;
  block?: boolean;
  color?: string;
  transparent?: boolean;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  disabled?: boolean;
  to?: string;
}

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const RawButton = styled.button<{
  color?: string;
  block?: boolean;
  paddingX: number;
  paddingY: number;
  fontSize: number;
}>`
  color: #fff;
  border: 0 none;
  background-color: ${props => (props.color ? props.color : colors.blue)};
  padding: ${props => props.paddingY}px ${props => props.paddingX}px;
  font-size: ${props => props.fontSize}px;
  cursor: pointer;
  ${props => props.block && `display: block; width: 100%;`};
  border-radius: 4px;
  font-family: inherit;
  transition: background-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  text-decoration: none;

  &:hover {
    background-color: ${props =>
      lighten(props.color ? props.color : colors.blue, 5)};
  }

  &:active {
    box-shadow: none;
    background-color: ${props => (props.color ? props.color : colors.blue)};
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &:focus,
  &:active {
    outline: 0 none;
    box-shadow: 0 0 0 1px ${lighten(colors.blue, 20)};
  }
`;

const WrapperLink = styled(Link)`
  text-decoration: none;
  display: contents;

  &:focus,
  &:focus-within,
  &:active {
    outline: 0 none;
    box-shadow: 0 0 0 1px ${lighten(colors.blue, 20)};
  }
`;

export const RawTransparentButton = styled(RawButton)`
  background-color: transparent;
  border: 1px solid ${colors.grey};
  color: ${colors.darkTextGrey};
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgba(0, 0, 0, 0.025);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const getSizes = (props: Props) => {
  const basePadding = 12;
  let paddingY = basePadding * 1.5;
  let paddingX = basePadding * 2.5;
  let fontSize = 18;

  if (props.xsmall) {
    paddingY = 5;
    paddingX = 8;
    fontSize = 12;
  } else if (props.small) {
    paddingY = basePadding / 2;
    paddingX = basePadding;
    fontSize = 14;
  } else if (props.medium) {
    paddingY = basePadding;
    paddingX = basePadding * 1.5;
    fontSize = 16;
  }
  return { paddingX, paddingY, fontSize };
};

const Button: React.SFC<Props & ButtonProps> = props => {
  let { paddingY, paddingX, fontSize } = getSizes(props);
  let Component = RawButton;
  if (props.transparent) {
    paddingX -= 1;
    paddingY -= 1;
    Component = RawTransparentButton;
  }

  props.type;

  const button = (
    <Component
      fontSize={fontSize}
      paddingX={paddingX}
      paddingY={paddingY}
      {...props}
    />
  );

  if (props.to && !props.disabled)
    return <WrapperLink to={props.to}>{button}</WrapperLink>;
  return button;
};

export const TransparentButton: React.SFC<Props & ButtonProps> = props => {
  return <Button {...props} transparent />;
};

export default Button;
