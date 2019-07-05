import { Context } from "./types";
import decodeAugurLogs from "./decodeAugurLogs";

export default function work(context: Context) {
  // Every five seconds, check if there are activating markets to update to active
  setInterval(async () => {
    const activatingMarkets = await context
      .pg("markets")
      .where("status", "activating");
    for (let market of activatingMarkets) {
      const receipt = await context.provider.getTransactionReceipt(
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
}
