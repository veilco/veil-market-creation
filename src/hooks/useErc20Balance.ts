import { useEffect, useState } from "react";
import Store from "src/store";
import { JSONRPCResponsePayload } from "ethereum-types";
import { BigNumber } from "bignumber.js";

async function batchFetchBalances(
  tokens: string[],
  ownerAddress: string
): Promise<BigNumber[]> {
  const jsonRpcPayload = tokens.map((token, i) => {
    const ownerAddressHex = ownerAddress.substr(2);

    // This is the hex data for "balanceOf(address)"
    const balanceData = `0x70a08231000000000000000000000000${ownerAddressHex}`;

    const to = token;
    return {
      id: 2 * i,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to, data: balanceData }, "latest"]
    };
  });
  const response = await fetch(Store.getEthereumHttp(), {
    method: "POST",
    body: JSON.stringify(jsonRpcPayload),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const json: JSONRPCResponsePayload[] = await response.json();

  if (json.length !== tokens.length) throw new Error("Error fetching balances");

  // Make sure results are sorted by their ids
  json.sort((a, b) => a.id - b.id);
  return tokens.map((_, i) => new BigNumber(json[i].result.substr(2), 16));
}

export default function useErc20Balance(
  tokenAddress: string,
  userAddress: string
) {
  const [balance, setBalance] = useState<BigNumber | undefined>(undefined);

  if (!tokenAddress || !userAddress) return undefined;

  useEffect(() => {
    async function refetch() {
      timeout = setTimeout(refetch, 2000);
      const [newBalance] = await batchFetchBalances(
        [tokenAddress],
        userAddress
      );
      if (!balance || !balance.eq(newBalance)) setBalance(newBalance);
    }
    let timeout = setTimeout(refetch, 0);
    return () => clearTimeout(timeout);
  }, [tokenAddress, userAddress, balance, setBalance]);

  return balance;
}
