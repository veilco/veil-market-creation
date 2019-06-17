import styled from "@emotion/styled";
import { colors, fade } from "src/styles";

const Checkbox = styled("input")`
  margin: 0;
  border-radius: 4px;
  appearance: button;
  -webkit-appearance: button;
  -moz-appearance: button;
  border: 2px solid ${colors.lightTextGrey};
  white-space: nowrap;
  overflow: hidden;
  width: ${props => (props.small ? 14 : 16)}px;
  height: ${props => (props.small ? 14 : 16)}px;
  position: relative;
  cursor: pointer;
  &:focus {
    box-shadow: ${props =>
      props.color
        ? `0 0 1px 1px ${fade(props.color, 0.4)}`
        : `0 0 1px 1px ${fade(colors.blue, 0.4)}`}px;
  }
  &:checked {
    border-color: ${props => (props.color ? props.color : colors.blue)};
    &:before {
      background: ${props => (props.color ? props.color : colors.blue)};
      border-radius: 2px;
      content: "";
      display: block;
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 2px;
      pointer-events: none;
    }

    &:hover {
      border-color: ${props => (props.color ? props.color : colors.blue)};
    }
  }
  &:hover {
    border-color: ${colors.darkTextGrey};
  }
`;

export default Checkbox;
