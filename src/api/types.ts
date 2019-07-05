import Knex from "knex";
import { ethers } from "ethers";

export interface Market {
  uid: string;
  description: string;
  details?: string;
  resolutionSource?: string;
  endTime: Date;
  tags: string[];
  category: string;
  marketCreatorFeeRate: string;
  author: string;
  transactionHash?: string;
  status: "draft" | "activating" | "activated";
  type: "yesno" | "scalar" | "categorical";
  numTicks?: string;
  minPrice?: string;
  maxPrice?: string;
  scalarDenomination?: string;
  metadata: {
    timezone: string;
  };
}

export type Context = {
  pg: Knex;
  provider: ethers.providers.JsonRpcProvider;
};
