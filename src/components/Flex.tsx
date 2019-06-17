import React from "react";

interface Props {
  alignCenter?: boolean;
  justifyCenter?: boolean;
  stretch?: boolean;
  children: React.ReactNode;
}

export default function Flex(props: Props) {
  let styles: React.CSSProperties = { display: "flex" };
  if (props.alignCenter) styles.alignItems = "center";
  if (props.justifyCenter) styles.justifyContent = "center";
  if (props.stretch) styles.justifyContent = "stretch";

  return <div style={styles}>{props.children}</div>;
}
