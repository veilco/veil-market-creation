import styled from "@emotion/styled";
import { colors } from "../styles";

interface Props {
  color?: string;
  textColor?: string;
}

export default styled("span")<Props>`
  display: inline-block;
  line-height: 1em;
  border-radius: 4px;
  padding: 5px 7px;
  background-color: ${props => (props.color ? props.color : colors.textBlack)};
  color: ${props => (props.textColor ? props.textColor : "#fff")};
  text-transform: uppercase;
  font-size: 0.7em;
  font-weight: 500;
  margin-top: -2px;
  vertical-align: middle;
`;
