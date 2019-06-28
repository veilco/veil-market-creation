export default function getWindowProvider() {
  if (typeof (window as any).ethereum !== "undefined") {
    (window as any).ethereum.autoRefreshOnNetworkChange = false;
    return (window as any).ethereum;
  }
  if (typeof (window as any).web3 !== "undefined")
    return (window as any).web3.currentProvider;
  return null;
}
