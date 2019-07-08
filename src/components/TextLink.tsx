import React from "react";

// Prevents default click event
const TextLink: React.SFC<React.HTMLProps<HTMLAnchorElement>> = ({
  onClick,
  disabled,
  ...others
}) =>
  disabled ? (
    <span {...others} />
  ) : (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
      {...others}
    />
  );

export default TextLink;
