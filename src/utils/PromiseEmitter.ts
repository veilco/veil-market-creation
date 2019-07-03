import EventEmitter from "events";

interface Thenable<T> {
  then<U>(
    onFulfilled?: (value: T) => U | Thenable<U>,
    onRejected?: (error: any) => U | Thenable<U>
  ): Thenable<U>;
  then<U>(
    onFulfilled?: (value: T) => U | Thenable<U>,
    onRejected?: (error: any) => void
  ): Thenable<U>;
}

export default class PromiseEmitter<T> extends EventEmitter {
  protected _promise: Promise<T>;

  constructor() {
    super();
    this.on("error", () => {});
  }

  static await<T>(func: (emit: any) => Promise<T>) {
    const emitter = new PromiseEmitter<T>();
    emitter.await(() => func(emitter.emit.bind(emitter)));
    return emitter;
  }

  await(promise: () => Promise<T>) {
    this._promise = promise();
  }

  then<U>(
    onFulfilled?: (value: T) => U | Thenable<U>,
    onRejected?: (error: any) => U | Thenable<U>
  ): Promise<U>;
  then<U>(
    onFulfilled?: (value: T) => U | Thenable<U>,
    onRejected?: (error: any) => void
  ): Promise<U>;
  then<U>(
    onFulfilled?: (value: T) => U | Thenable<U>,
    onRejected?: (error: any) => U | Thenable<U>
  ): Thenable<U>;
  then() {
    return this._promise.then.apply(this._promise, arguments);
  }

  catch<U>(onError?: (error: any) => U | Thenable<U>): Promise<U>;
  catch() {
    return this._promise.catch.apply(this._promise, arguments);
  }

  [Symbol.toStringTag] = Promise.prototype[Symbol.toStringTag];
}
