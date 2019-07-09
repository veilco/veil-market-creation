import { Context } from "./types";
import decodeAugurLogs from "./decodeAugurLogs";
import createContext from "./createContext";
import { differenceInMinutes } from "date-fns";

// Cancel market activations after 15 minutes
const ACTIVATION_TIMEOUT_MINUTES = 15;

export default function work(context: Context) {
  // Every five seconds, check if there are activating markets to update to active
  // The setInterval is a bit janky, but it's not worth setting up a background
  // queue just for this
  setInterval(async () => {
    const activatingMarkets = await context
      .pg("markets")
      .where("status", "activating");
    for (let market of activatingMarkets) {
      if (
        differenceInMinutes(new Date(), market.activatedAt) >
        ACTIVATION_TIMEOUT_MINUTES
      ) {
        // Transaction hash invalid, return market to draft
        await context
          .pg("markets")
          .where("uid", market.uid)
          .update({
            transactionHash: null,
            activatedAt: null,
            status: "draft"
          });
        continue;
      }
      const receipt = await context.provider.getTransactionReceipt(
        market.transactionHash
      );
      if (receipt && receipt.logs) {
        if (
          !receipt.from ||
          receipt.from.toLowerCase() !== market.author.toLowerCase()
        ) {
          // Make sure market is being activated by author
          await context
            .pg("markets")
            .where("uid", market.uid)
            .update({
              transactionHash: null,
              activatedAt: null,
              status: "draft"
            });
          continue;
        }
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
}

async function start() {
  const context = await createContext();
  work(context);
}

if (require.main === module) {
  start();
}
