import React from "react";
import { basePadding, colors, fade, darken, lighten, media } from "src/styles";
import Tooltip from "src/components/Tooltip";
import { round } from "src/utils/units";
import styled from "@emotion/styled";

export const ModalForm = styled.div`
  width: 400px;

  ${media.phone} {
    width: auto;
  }
`;

export const ModalFormHeader = styled.div`
  background-color: ${colors.blue};
  padding: ${1.5 * basePadding}px;
  color: #fff;

  & h2 {
    font-weight: 500;
    font-size: 18px;
  }

  & h3 {
    font-weight: 400;
    font-size: 13px;
  }
`;

export const ModalFormContent = styled.div`
  padding: ${1.5 * basePadding}px;
`;

export const Label = styled.label`
  display: block;
  font-weight: 500;
  padding-bottom: ${basePadding / 2}px;

  & small {
    font-weight: 400;
    color: ${colors.textGrey};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  ${media.phone} {
    flex-direction: column;
  }
`;

export const PositionButton = styled.button<{
  selected: boolean;
  disabled?: boolean;
}>`
  position: relative;
  border: 2px solid ${colors.borderGrey};
  flex: 1;
  padding: ${basePadding}px;
  background-color: ${colors.white};
  cursor: pointer;
  border-radius: 4px;
  ${props => props.disabled && `pointer-events: none; opacity: 0.5;`};

  & h1 {
    font-weight: 500;
    font-size: 18px;
  }

  & h3 {
    font-weight: 400;
    color: ${colors.textGrey};
  }

  &:hover {
    background-color: ${colors.lightGrey};
  }
  font-family: inherit;

  & i,
  & svg {
    color: ${colors.blue};
  }

  ${props =>
    props.selected &&
    `
    border-color: ${colors.blue};
    `};
`;

const CheckSvg: React.SFC<React.HTMLAttributes<SVGElement>> = ({
  className
}) => (
  <svg
    className={className}
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10.5" cy="10.5" r="10.5" fill="currentColor" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.20904 13.0138L5.20222 9.85437L4.19995 10.9075L8.20904 15.12L16.8 6.09317L15.7977 5.04004L8.20904 13.0138Z"
      fill="white"
    />
  </svg>
);

export const Check = styled(CheckSvg)<{ in: boolean }>`
  position: absolute;
  top: -11px;
  right: -11px;
  transition: transform 0.1s, opacity 0.1s;
  transform: translateY(3px);
  opacity: 0;
  ${props => props.in && `transform: translateY(0); opacity: 1;`};
`;

export const ShortButton = styled(PositionButton)`
  & i,
  & svg {
    color: ${colors.red};
  }

  ${props =>
    props.selected &&
    `
    background-color: ${fade(colors.red, 0.03)};
    border-color: ${colors.red};
  `};
`;

export const LongButton = styled(PositionButton)`
  & i,
  & svg {
    color: ${colors.darkGreen};
  }

  ${props =>
    props.selected &&
    `
    background-color: ${fade(colors.darkGreen, 0.03)};
    border-color: ${colors.darkGreen};
  `};
`;

export const LoggedOut = styled.div`
  color: ${colors.textGrey};
  text-align: center;
  padding: ${basePadding}px;
  font-size: 18px;
`;

export const ErrorBox = styled.div`
  border: ${props =>
    props.color ? `2px solid ${props.color}` : `2px solid ${colors.red}`};
  color: ${props =>
    props.color ? `${props.color}` : `${darken(colors.red, 10)}`};
  border-radius: 4px;
  padding: ${basePadding}px;

  & a {
    border-bottom: 1px solid currentColor;
  }
`;

export const ReceiptItem = styled.div`
  display: flex;
  justify-content: stretch;
  align-items: flex-end;
  font-size: 14px;

  & label {
    color: ${colors.textGrey};
    font-weight: 400;
    padding-bottom: 0;
    max-width: 60%;
  }
`;

export const ReceiptUnderline = styled.div`
  flex: 1;
  border-bottom: 1px solid ${colors.borderGrey};
  margin: 0 ${basePadding / 2}px 3px;
`;

export const BNTooltip: React.SFC<{
  longNumber: string;
  unit: React.ReactNode | string;
}> = ({ longNumber, unit }) => (
  <Tooltip
    content={
      <span>
        {longNumber} <small>{unit}</small>
      </span>
    }
  >
    <span>
      {round(longNumber, 5)} <small>{unit}</small>
    </span>
  </Tooltip>
);

export const InputGroup = styled.div`
  display: flex;
  flex-direction: row;
  border: 2px solid ${colors.borderGrey};
  border-radius: 4px;
  align-items: center;
  background-color: ${colors.white};

  &:focus-within {
    box-shadow: 0 0 0 1px ${lighten(colors.blue, 20)};
  }
`;

export const Input = styled("input")<{ as?: any }>`
  display: block;
  border: none;
  background-color: transparent;
  font-size: 18px;
  flex: 1;
  padding: ${basePadding}px;
  font-family: inherit;

  &:disabled {
    color: rgba(0, 0, 0, 0.5);
  }

  &:focus {
    outline: 0 none;
  }
`;

export const InputUnit = styled.div`
  font-size: 14px;
  color: ${colors.blue};
  padding-right: ${basePadding}px;
`;
