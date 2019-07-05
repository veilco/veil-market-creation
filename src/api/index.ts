import { ApolloServer } from "apollo-server";
import createContext from "./createContext";
import { typeDefs, resolvers } from "./schema";
import work from "./worker";

const context = createContext();
const server = new ApolloServer({ typeDefs, resolvers, context });

work(context);

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
