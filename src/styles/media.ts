export const breakpoints = {
  giant: 1170,
  desktop: 992,
  tablet: 800,
  phone: 540
};

// iterate through the breakpoints and create a media template
export const media = Object.keys(breakpoints).reduce(
  (accumulator, label: keyof typeof breakpoints) => {
    // use em in breakpoints to work properly cross-browser and support users
    // changing their browsers font-size: https://zellwk.com/blog/media-query-units/
    const emSize = breakpoints[label] / 16;
    accumulator[label] = `@media (max-width: ${emSize}em)`;
    return accumulator;
  },
  {} as { [size: string]: string }
);
