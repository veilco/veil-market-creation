import { ethers } from "ethers";

function rightPadWithZeroes(str: string, length: number) {
  let newStr = str.substr(0, length);
  while (newStr.length < length) {
    newStr = newStr + "0";
  }
  return newStr;
}

// Encodes an augur category. Category will be truncated
export default function encodeCategory(category?: string) {
  if (!category) return "0x0";
  return (
    "0x" +
    rightPadWithZeroes(
      Buffer.from(ethers.utils.toUtf8Bytes(category.trim())).toString("hex"),
      64
    )
  );
}
