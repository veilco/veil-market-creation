import { observable, action, computed } from "mobx";
import Store from "./index";
import getWindowProvider from "src/utils/getWindowProvider";

function promisify<T = any>(func: any, thisContext: any = undefined) {
  return (...args: any[]) => {
    return new Promise<T>((resolve, reject) => {
      args.push((error: Error, result: T) => {
        if (error) reject(error);
        resolve(result);
      });
      func.apply(thisContext, args);
    });
  };
}

const REFRESH_DELAY = 1000;

export default class Eth {
  store: Store;

  @observable networkId: string | null;
  @observable currentAddress: string;
  @observable hasLoadedCurrentAddressFirstTime: boolean = false;
  @observable isEnabled = false;

  isStopped: boolean = false;
  refreshTimeout: any;

  constructor(store: Store) {
    this.store = store;
  }

  @action
  async refresh() {
    if (this.isStopped) return;
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => this.refresh(), REFRESH_DELAY);

    try {
      this.isEnabled = await this.getIsEnabled();
      const accounts = await this.getAvailableAddresses();
      this.networkId = await this.getNetworkId();
      if (accounts && this.currentAddress != accounts[0]) {
        this.currentAddress = accounts[0];
      }
    } catch (err) {
      console.error(err);
    }
    this.isEnabled = await this.getIsEnabled();
    this.hasLoadedCurrentAddressFirstTime = true;
  }

  @action
  async enable() {
    if (!(window as any).ethereum || !(window as any)) return true;
    try {
      await (window as any).ethereum.enable();
      await this.refresh();
    } catch (e) {
      throw new Error("Error enabling ethereum");
    }
    this.refresh();
  }

  stop() {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    this.isStopped = true;
  }

  async getIsEnabled() {
    if (!(window as any).ethereum) return true;
    if (!(window as any).ethereum._metamask) return true;
    return await (window as any).ethereum._metamask.isApproved();
  }

  @computed
  get windowProvider() {
    return getWindowProvider();
  }

  @computed
  get isReady() {
    return this.hasLoadedCurrentAddressFirstTime;
  }

  @computed
  get isConnected() {
    return !!this.windowProvider;
  }

  @computed
  get isUnlocked() {
    return this.hasLoadedCurrentAddressFirstTime && !!this.currentAddress;
  }

  @computed
  get isRightNetwork() {
    return this.networkId === Store.getDesiredNetworkId();
  }

  @computed
  get networkName() {
    const networkMap: any = {
      1: "Mainnet",
      42: "Kovan",
      4: "Rinkeby",
      3: "Ropsten",
      other: undefined
    };
    return networkMap[this.networkId || "other"] || "Unknown Network";
  }

  @computed
  get etherscanUrl() {
    const etherscanMap: any = {
      1: "https://etherscan.io",
      42: "https://kovan.etherscan.io",
      4: "https://rinkeby.etherscan.io",
      3: "https://ropsten.etherscan.io",
      other: undefined
    };
    return etherscanMap[this.networkId || "other"] || "https://etherscan.io/";
  }

  @computed
  get sendAsync() {
    return promisify<any>(this.windowProvider.sendAsync, this.windowProvider);
  }

  async getAvailableAddresses() {
    if (!this.windowProvider) return null;
    const result = await this.sendAsync({
      method: "eth_accounts",
      params: [],
      jsonrpc: "2.0",
      id: 1
    });
    return result.result as string[];
  }

  async getNetworkId() {
    if (!this.windowProvider) return null;
    const result = await this.sendAsync({
      method: "net_version",
      params: [],
      jsonrpc: "2.0",
      id: 1
    });
    return result.result.toString() as string;
  }
}
