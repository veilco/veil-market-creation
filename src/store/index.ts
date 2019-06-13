import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import Transactions from "src/store/Transactions";

function createApollo() {
  const cache = new InMemoryCache({
    dataIdFromObject: (obj: any) => obj.uid
  });
  const link = new HttpLink({
    uri: process.env.API_URL
  });

  return new ApolloClient({
    cache,
    link
  });
}

export default class Store {
  client = createApollo();
  transactions = new Transactions(this);

  start() {
    console.log("Starting store");
  }

  stop() {
    console.log("Stopping store");
  }
}
