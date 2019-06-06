import React from "react";
import { basePadding } from "src/styles";

export default function Spacer(props: {
  size?: number;
  big?: boolean;
  small?: boolean;
  inline?: boolean;
  xsmall?: boolean;
}) {
  let { size, big, small, inline, xsmall } = props;
  if (big) size = 2;
  if (small) size = 0.5;
  if (small) size = 0.5;
  if (xsmall) size = 0.25;
  if (!size) size = 1;
  const pixelSize = size * basePadding;
  let styles: React.CSSProperties = { height: pixelSize };
  if (inline) styles = { width: pixelSize, display: "inline-block" };
  return <div style={{ ...styles, flexShrink: 0 }} />;
}
