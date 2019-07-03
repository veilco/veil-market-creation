import { Log } from "ethers/providers/abstract-provider";
import { ethers } from "ethers";
import { Augur } from "augur-core-abi";
import compact from "lodash/compact";

export default function decodeAugurLogs(logs: Log[]) {
  if (!Array.isArray(logs) || !logs.length) return [];

  const iface = new ethers.utils.Interface(Augur);
  return compact(
    logs.map(log => {
      const parsedLog = iface.parseLog(log);
      if (!parsedLog || !parsedLog.name) return null;
      return parsedLog;
    })
  );
}
