import {WacheService} from "../service";
import {AsyncLocalStorage} from "node:async_hooks";
import {WetchStorage} from "./storage";
import {Fn} from "../util";

export default class AsyncLocalStorageWacheService implements WacheService {
    constructor(private als: AsyncLocalStorage<WetchStorage>) {
    }
    static create() {
        return new AsyncLocalStorageWacheService(new AsyncLocalStorage<WetchStorage>())
    }

    run<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.als.run(new WetchStorage(), () => {
                fn().then((result) => {
                    resolve(result)
                }).catch(err => {
                    reject(err)
                })
            })
        })
    }

    getOrRunFunction<A extends any[], T>(fn: Fn<A, T>, args: A): T {
        const store = this.als.getStore()
        if (typeof store === "undefined") {
            return fn(...args)
        }
        const storage = store.getOrRegisterCacheStorage(fn)
        const leaf = storage.resolveLeaf(args)

        return leaf.run(fn, args)
    }
}