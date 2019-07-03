import { ApolloServer, gql, IResolvers } from "apollo-server";
import { GraphQLScalarType } from "graphql";
import uuid from "uuid/v4";
import Knex from "knex";
import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";
import decodeAugurLogs from "./decodeAugurLogs";

interface Market {
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

type Context = {
  markets: Market[];
  pg: Knex;
};

function createPg() {
  const knexConfig = require("../../knexfile");
  const pg = Knex({
    ...knexConfig[process.env.NODE_ENV || "development"],
    debug: true,
    log: {
      warn: (obj: any) => console.warn("KNEX WARN", obj),
      error: (obj: any) => console.error("KNEX ERROR", obj),
      debug: (obj: any) => {
        if (obj.sql)
          return console.debug("SQL: " + obj.sql.replace(/[\s]+/g, " "), {
            bindings: obj.bindings
          });
        console.debug("KNEX DEBUG", obj);
      },
      deprecate: (obj: any) => console.debug("KNEX DEPRECATE", obj)
    }
  });
  return pg;
}

const context = {
  markets: [],
  pg: createPg()
};

const typeDefs = gql`
  scalar Date
  scalar JSON
  scalar BigNumber

  enum MarketStatus {
    draft
    activating
    active
  }

  enum MarketType {
    yesno
    scalar
    categorical
  }

  type Market {
    uid: ID
    type: MarketType
    description: String!
    details: String
    resolutionSource: String
    endTime: Date
    tags: [String]
    category: String
    marketCreatorFeeRate: BigNumber
    author: String
    status: MarketStatus
    metadata: JSON
    numTicks: BigNumber
    minPrice: BigNumber
    maxPrice: BigNumber
    scalarDenomination: String
  }

  input MarketInput {
    type: MarketType
    description: String!
    details: String
    resolutionSource: String
    endTime: Date
    tags: [String]
    category: String
    marketCreatorFeeRate: BigNumber
    author: String
    signature: String
    metadata: JSON
    minPrice: BigNumber
    maxPrice: BigNumber
    numTicks: BigNumber
    scalarDenomination: String
  }

  type Query {
    markets(author: String!): [Market]
    market(uid: String!): Market
  }

  type Mutation {
    createMarket(market: MarketInput): Market
    updateMarket(uid: String!, market: MarketInput): Market
    activateMarket(
      uid: String!
      transactionHash: String!
      signature: String!
    ): Market
  }
`;

const resolvers: IResolvers<any, Context> = {
  Query: {
    markets: async (_: any, args: { author: string }, ctx: Context) => {
      return await ctx.pg("markets").where("author", args.author);
    },
    market: async (_: any, args: { uid: string }, ctx: Context) => {
      return await ctx
        .pg("markets")
        .where("uid", args.uid)
        .first();
    }
  },
  Mutation: {
    createMarket: async (_: any, args: any, ctx: Context) => {
      const { signature, ...market } = args.market;
      // TODO: validate input
      const [inserted] = await ctx
        .pg("markets")
        .insert({
          ...market,
          tags: JSON.stringify(market.tags || []),
          status: "draft",
          uid: uuid()
        })
        .returning("*");
      return inserted;
    },
    updateMarket: async (_: any, args: any, ctx: Context) => {
      const { signature, ...market } = args.market;
      const uid = args.uid;
      const existing: Market = await ctx
        .pg("markets")
        .where("uid", uid)
        .first();
      if (!existing) throw new Error("Market not found");
      if (existing.status !== "draft")
        throw new Error("Cannot update market after activation");
      // TODO: validate input
      const [updated] = await ctx
        .pg("markets")
        .where("uid", uid)
        .update({
          ...market,
          tags: JSON.stringify(market.tags || []),
          updatedAt: new Date()
        })
        .returning("*");
      console.log(updated);
      return updated;
    },
    activateMarket: async (_: any, args: any, ctx: Context) => {
      const { uid, transactionHash } = args;
      const existing: Market = await ctx
        .pg("markets")
        .where("uid", uid)
        .first();
      if (!existing) throw new Error("Market not found");
      if (existing.status !== "draft")
        throw new Error("Market is already activated");
      // TODO: validate input
      const [updated] = await ctx
        .pg("markets")
        .where("uid", uid)
        .update({
          status: "activating",
          transactionHash
        })
        .returning("*");
      return updated;
    }
  },
  Date: new GraphQLScalarType({
    name: "Date",
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: any) => {
      if (value instanceof Date) return value;
      if (
        value.match(
          "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})?Z"
        )
      )
        return new Date(value);
      return undefined;
    },
    parseLiteral(ast) {
      if (ast.kind === "StringValue") {
        if (
          ast.value.match(
            "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})?Z"
          )
        )
          return new Date(ast.value);
      }
      return undefined;
    }
  }),
  BigNumber: new GraphQLScalarType({
    name: "BigNumber",
    serialize: (bn: string) => new BigNumber(bn).toString(),
    parseValue: (value: string) => {
      if (value.match(/^[0-9]{0,78}(\.[0-9]{0,78})?$/)) return value;
      return undefined;
    },
    parseLiteral(ast) {
      if (
        ast.kind === "StringValue" &&
        ast.value.match(/^[0-9]{0,78}(\.[0-9]{0,78})?$/)
      )
        return ast.value;
      return undefined;
    }
  })
};

function getEthereumHttp() {
  if (process.env.NETWORK_ID === "1")
    return `https://eth-mainnet.alchemyapi.io/jsonrpc/${
      process.env.ALCHEMY_KEY
    }`;
  return `https://eth-kovan.alchemyapi.io/jsonrpc/${process.env.ALCHEMY_KEY}`;
}

const server = new ApolloServer({ typeDefs, resolvers, context });
const provider = new ethers.providers.JsonRpcProvider(getEthereumHttp());

// Every five seconds, check if there are activating markets to update to active
setInterval(async () => {
  const activatingMarkets = await context
    .pg("markets")
    .where("status", "activating");
  for (let market of activatingMarkets) {
    const receipt = await provider.getTransactionReceipt(
      market.transactionHash
    );
    if (receipt && receipt.logs) {
      const logs = decodeAugurLogs(receipt.logs);
      const creationLog = logs.find(log => log.name === "MarketCreated");
      if (creationLog) {
        await context
          .pg("markets")
          .where("uid", market.uid)
          .update({
            address: creationLog.values.market,
            status: "active"
          });
      }
    }
  }
}, 5000);

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
