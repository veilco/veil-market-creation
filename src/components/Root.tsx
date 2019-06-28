import React, { useState, useEffect } from "react";
import { ApolloProvider } from "react-apollo-hooks";
import { Provider as MobxProvider } from "mobx-react";
import Store from "../store";
import StoreContext from "./StoreContext";
import App from "./App";

export default function Root() {
  const [store, setStore] = useState(() => new Store());

  // Start and stop store on hot reload
  useEffect(() => {
    store.start();
    (window as any).store = store;
    let isMounted = true;
    if (module.hot) {
      module.hot.accept("../store", () => {
        if (!isMounted) return;
        setStore(new Store());
      });
    }
    return () => {
      store.stop();
      isMounted = false;
    };
  }, [store]);

  return (
    <StoreContext.Provider value={store}>
      <MobxProvider store={store}>
        <ApolloProvider client={store.client}>
          <App />
        </ApolloProvider>
      </MobxProvider>
    </StoreContext.Provider>
  );
}
