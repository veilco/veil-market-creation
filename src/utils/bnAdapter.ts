import { BigNumber } from "bignumber.js";

const bnAdapter = (
  bnToString: (bn: BigNumber) => string,
  stringToBn: (str: string) => BigNumber,
  allowEmpty: boolean = false
) => ({
  render(bn: BigNumber) {
    return bnToString(bn);
  },
  parse(decimal: string) {
    decimal = decimal.toString();
    if (
      (!allowEmpty && decimal.length === 0) ||
      !decimal.match(/^[0-9]*(\.[0-9]+)?$/)
    )
      throw new Error("Please enter a valid number");
    return stringToBn(decimal);
  }
});

export default bnAdapter;
