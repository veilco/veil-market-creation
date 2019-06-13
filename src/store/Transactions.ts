import {
  observable,
  computed,
  action,
  IObservableArray,
  autorun,
  toJS
} from "mobx";
import Store from "./index";
import EventEmitter from "events";
import ms from "ms";

const randomId = () =>
  Math.random()
    .toString(16)
    .substr(2);

export class Transaction {
  uid: string;
  type: string;
  createdAt: Date;
  completedAt?: Date;
  transactionHash?: string;
  metadata: any;
  @observable status: "pending" | "completed" | "failed";

  constructor(tx: Partial<Transaction>) {
    Object.assign(this, tx);
    this.createdAt = tx.createdAt ? new Date(tx.createdAt) : new Date();
    this.completedAt = tx.completedAt && new Date(tx.completedAt);
    this.uid = tx.uid || randomId();
  }

  @action
  finish() {
    this.status = "completed";
    this.completedAt = new Date();
  }

  @action
  fail() {
    this.status = "failed";
  }
}

export default class Transactions extends EventEmitter {
  transactions: IObservableArray<Transaction> = observable.array([], {
    deep: false
  });

  @observable isOpen: boolean = false;
  pollTimeout: any;

  constructor(public store: Store) {
    super();
    this.restore();
    if (this.pending.length > 0) this.poll();
    autorun(() => this.save());
  }

  @action
  addTransaction(details: {
    type: string;
    transactionHash?: string;
    metadata?: any;
  }) {
    const tx = new Transaction({
      ...details,
      status: "pending",
      createdAt: new Date()
    });
    this.transactions.unshift(tx);
    this.emit("transactionStart", tx);
    this.poll();
    return tx;
  }

  @action
  focus(_tx: Transaction) {
    this.isOpen = true;
    // TODO: this is kinda hacky
    window.scrollTo(0, 0);
  }

  @action
  async poll() {
    if (this.pollTimeout) clearTimeout(this.pollTimeout);
    if (!this.pending.length) return;
    this.pollTimeout = setTimeout(() => this.poll(), 2000);

    const web3 = await this.store.getWeb3();
    for (let tx of this.pending) {
      if (tx.transactionHash) {
        const receipt = await web3.getTransactionReceiptIfExistsAsync(
          tx.transactionHash
        );
        if (receipt) {
          if (receipt.status === 1) tx.finish();
          else tx.fail();
        }
      } else {
        // TODO before mainnet: figure out a better way of tracking order fills
        if (Date.now() - tx.createdAt.getTime() > ms("20s")) {
          tx.finish();
        }
      }
    }
  }

  @computed
  get count() {
    return this.transactions.length;
  }

  @computed
  get pending() {
    return this.transactions.filter(tx => tx.status === "pending");
  }

  @computed
  get completed() {
    return this.transactions.filter(tx => tx.status === "completed");
  }

  @computed
  get pendingCount() {
    return this.pending.length;
  }

  // TODO: this is a hacky stand-in until we implement transactions on the backend
  save() {
    const js = toJS(this.transactions);
    window.localStorage.setItem("veilTransactions", JSON.stringify(js));
  }

  restore() {
    const json = window.localStorage.getItem("veilTransactions");
    try {
      const transactions: Partial<Transaction>[] = JSON.parse(json as any);
      for (let transaction of transactions) {
        this.transactions.push(new Transaction(transaction));
      }
    } catch {}
  }
}
