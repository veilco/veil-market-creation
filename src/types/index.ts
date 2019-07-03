export type MarketStatus = "draft" | "activating" | "active";

interface BaseMarket {
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
  minPrice?: string;
  maxPrice?: string;
  scalarDenomination?: string;
  numTicks?: string;
  metadata: {
    timezone: string;
  };
}

interface ScalarMarket extends BaseMarket {
  type: "scalar";
  minPrice: string;
  maxPrice: string;
  scalarDenomination: string;
  numTicks: string;
}

interface YesNoMarket extends BaseMarket {
  type: "yesno";
  minPrice: undefined;
  maxPrice: undefined;
  scalarDenomination: undefined;
  numTicks: undefined;
}

export type Market = ScalarMarket | YesNoMarket;
