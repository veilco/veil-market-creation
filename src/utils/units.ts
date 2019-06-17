import { BigNumber } from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 1e9 });

const ZEROES = "000000000000";
const TEN_18 = new BigNumber("1000000000000000000");

export function round(number: number | string, decimals: number = 2) {
  if (typeof number === "string") number = parseFloat(number);
  const pow = Math.pow(10, decimals);
  const rounded = (Math.round(number * pow) / pow).toString();
  const decimalPosition = rounded.indexOf(".");
  if (decimalPosition === -1) {
    return rounded + "." + ZEROES.substr(0, decimals);
  } else {
    const decimalPositionFromEnd = rounded.length - decimalPosition - 1;
    const zeroesToAdd = decimals - decimalPositionFromEnd;
    return rounded + ZEROES.substr(0, zeroesToAdd);
  }
}

export function fromWei(
  wei: BigNumber | string,
  _unit: string = "ether"
): string {
  wei = typeof wei === "string" ? new BigNumber(wei) : wei;
  return wei.div(TEN_18).toString();
}

export function toWei(
  eth: number | string,
  _unit: string = "ether"
): BigNumber {
  return new BigNumber(eth).times(TEN_18).dp(0);
}

export function toEthDisplayPrice(
  price: BigNumber | string,
  numTicks: BigNumber | string
) {
  if (!numTicks) throw new Error("You must specify numTicks");
  return parseFloat(
    fromWei(
      new BigNumber(price)
        .times(new BigNumber(toWei(1, "ether")))
        .div(new BigNumber(numTicks)),
      "ether"
    )
  );
}

export function fromEthDisplayPrice(
  price: string,
  numTicks: BigNumber | string
) {
  if (!numTicks) throw new Error("You must specify numTicks");
  return toWei(price, "ether")
    .times(new BigNumber(numTicks))
    .dividedToIntegerBy(TEN_18);
}

export function toDisplayShares(
  shares: BigNumber | string,
  numTicks: BigNumber | string
) {
  if (!numTicks) throw new Error("You must specify numTicks");
  return parseFloat(
    fromWei(new BigNumber(shares).times(new BigNumber(numTicks)), "ether")
  );
}

export function fromDisplayShares(
  shares: BigNumber | string,
  numTicks: BigNumber | string
) {
  if (!numTicks) throw new Error("You must specify numTicks");
  return toWei(parseFloat(shares.toString()), "ether")
    .div(new BigNumber(numTicks))
    .dp(0);
}

export function toPercentage(
  shares: BigNumber | string,
  numTicks: BigNumber | string
) {
  if (!numTicks) throw new Error("You must specify numTicks");
  return (
    (100 * parseFloat(shares.toString())) / parseFloat(numTicks.toString())
  );
}

export function fromPercentage(
  percentage: number,
  numTicks: BigNumber | string
) {
  if (!numTicks) throw new Error("You must specify numTicks");
  numTicks = new BigNumber(numTicks);
  return new BigNumber(Math.floor((percentage / 100) * numTicks.toNumber()));
}
