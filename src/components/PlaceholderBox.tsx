import styled from "@emotion/styled";

const PlaceholderBox = styled.div<{
  color?: string;
  height?: number;
  width?: number;
}>`
  opacity: 0.3;
  display: inline-block;
  line-height: 1em;
  height: 0.6em;
  background-color: ${props => (props.color ? props.color : "currentColor")};
  ${props => props.height && `margin-bottom: ${props.height}px`};
  width: ${props => props.width || 100}px;
`;

export default PlaceholderBox;
