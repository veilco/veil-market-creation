require("dotenv").config();
import { ApolloServer } from "apollo-server";
import createContext from "./createContext";
import { typeDefs, resolvers } from "./schema";
import work from "./worker";

async function start() {
  const context = await createContext();
  const server = new ApolloServer({ typeDefs, resolvers, context });

  work(context);

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

start();
