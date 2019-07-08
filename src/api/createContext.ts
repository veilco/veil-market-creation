import Knex from "knex";
import { ethers } from "ethers";
import { Context } from "./types";
import Augur from "augur.js";

function createPg() {
  const knexConfig = require("../../knexfile");
  const pg = Knex({
    ...knexConfig[process.env.NODE_ENV || "development"],
    debug: true,
    log: {
      warn: (obj: any) => console.warn("KNEX WARN", obj),
      error: (obj: any) => console.error("KNEX ERROR", obj),
      debug: (obj: any) => {
        if (process.env.NODE_ENV === "production") return;
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

function getEthereumHttp() {
  if (process.env.NETWORK_ID === "1")
    return `https://eth-mainnet.alchemyapi.io/jsonrpc/${
      process.env.ALCHEMY_KEY
    }`;
  return `https://eth-kovan.alchemyapi.io/jsonrpc/${process.env.ALCHEMY_KEY}`;
}

export default async function createContext(): Promise<Context> {
  const provider = new ethers.providers.JsonRpcProvider(getEthereumHttp());
  const augurUrl = "ws://predictions.market:9001";
  const augur = new Augur();
  await new Promise((resolve, reject) => {
    augur.connect({ augurNode: augurUrl }, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

  return {
    provider,
    pg: createPg(),
    augur: new Augur()
  };
}
