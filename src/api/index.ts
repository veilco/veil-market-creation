import { ApolloServer, gql, IResolvers } from "apollo-server";
import { GraphQLScalarType } from "graphql";
import uuid from "uuid/v4";

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
}

type Context = {
  markets: Market[];
};

const context = {
  markets: []
};

const typeDefs = gql`
  scalar Date

  enum MarketStatus {
    draft
    activating
    activated
  }

  type Market {
    uid: ID
    description: String!
    details: String
    resolutionSource: String
    endTime: Date
    tags: [String]
    category: String
    marketCreatorFeeRate: String
    author: String
    status: MarketStatus
  }

  input MarketInput {
    description: String!
    details: String
    resolutionSource: String
    endTime: Date
    tags: [String]
    category: String
    marketCreatorFeeRate: String
    author: String
    signature: String
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
    markets: (_: any, args: { author: string }, ctx: Context) => {
      return ctx.markets.filter(m => m.author === args.author);
    },
    market: (_: any, args: { uid: string }, ctx: Context) => {
      return ctx.markets.find(m => m.uid === args.uid);
    }
  },
  Mutation: {
    createMarket: (_: any, args: any, ctx: Context) => {
      const { signature, ...market } = args.market;
      // TODO: validate signature
      ctx.markets.push({ ...market, status: "draft", uid: uuid() });
      return market;
    },
    updateMarket: (_: any, args: any, ctx: Context) => {
      const { signature, ...market } = args.market;
      const uid = args.uid;
      // TODO: validate signature
      ctx.markets = ctx.markets.map(m => {
        if (m.uid === uid) {
          if (m.status !== "draft")
            throw new Error("Cannot update market after activation");
          return market;
        }
        return m;
      });
    },
    activateMarket: (_: any, args: any, ctx: Context) => {
      const { uid, transactionHash } = args;
      // TODO: validate signature
      ctx.markets = ctx.markets.map(m => {
        if (m.uid === uid) {
          if (m.status !== "draft")
            throw new Error("Market is already activated");
          return { ...m, status: "activating", transactionHash };
        }
        return m;
      });
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
  })
};

const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
