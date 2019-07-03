import styled from "@emotion/styled";
import { colors, basePadding, media } from "src/styles";

export const MarketBackground = styled.div`
  background-image: linear-gradient(
    ${colors.blue} 0,
    ${colors.blue} 300px,
    transparent 300.01px
  );
`;

export const MarketContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: 960px;
  padding: ${basePadding}px;
`;

export const MarketBox = styled.div`
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: auto 280px;
  overflow: hidden;

  & > div {
    padding: ${basePadding * 2}px;
  }

  ${media.phone} {
    grid-template-columns: auto;
  }
`;

export const MarketBoxSidebar = styled.div`
  background-color: ${colors.lightGrey};
  border-left: 1px solid ${colors.lightBorderGrey};
  ${media.phone} {
    border-left: 0 none;
    border-top: 1px solid ${colors.lightBorderGrey};
  }
`;
