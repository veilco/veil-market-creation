export default function getTimezoneName() {
  // Returns PST, PDT, etc
  // Source: https://stackoverflow.com/questions/1954397/detect-timezone-abbreviation-using-javascript
  return new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];
}
