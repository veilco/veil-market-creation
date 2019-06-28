import React from "react";
import { Market } from "src/types";
import Badge from "src/components/Badge";
import { colors } from "src/styles";

export default function MarketStatusBadge({ market }: { market: Market }) {
  return (
    <>
      {market.status === "draft" && <Badge color={colors.orange}>DRAFT</Badge>}
      {market.status === "active" && <Badge color={colors.blue}>ACTIVE</Badge>}
      {market.status === "activating" && (
        <Badge color={colors.blue}>ACTIVATING</Badge>
      )}
    </>
  );
}
