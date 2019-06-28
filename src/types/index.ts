export type MarketStatus = "draft" | "activating" | "active";

export interface Market {
  uid: string;
  description: string;
  details: string;
  resolutionSource: string | null;
  endTime: string;
  tags: string[];
  category: string;
  marketCreatorFeeRate: string;
  author: string;
  transactionHash?: string;
  status: MarketStatus;
  type: "yesno" | "scalar" | "categorical";
  minPrice: string;
  maxPrice: string;
  scalarDenomination: string;
  metadata: {
    timezone: string;
  };
}
