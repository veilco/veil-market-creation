import tinycolor from "tinycolor2";

export const lighten = (color: string, perc: number) => {
  return tinycolor(color)
    .lighten(perc)
    .toString();
};

export const darken = (color: string, perc: number) => {
  return tinycolor(color)
    .darken(perc)
    .toString();
};

export const hue = (color1: string, color2: string, amount: number) => {
  return tinycolor.mix(color1, color2, amount).toString();
};

export const complement = (color: string) => {
  return tinycolor(color)
    .complement()
    .toString();
};

export const fade = (color: string, alpha: number) => {
  return tinycolor(color)
    .setAlpha(alpha)
    .toString();
};