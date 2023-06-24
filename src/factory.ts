import {Fetcher} from "@cloudflare/workers-types";
import {AsyncLocalStorage} from "node:async_hooks";
import {StoredResponse} from "./response";
import {WacheConfig, WetchStorage} from "./storage";

type Fn<A extends any[], T> = (...args: A) => T

export type Wetch = (input: RequestInfo<unknown, CfProperties<unknown>>, init?: RequestInit<RequestInitCfProperties>) => Promise<StoredResponse>

export class WetchFactory {
    private fetcher?: Fetcher

    constructor(private als: AsyncLocalStorage<WetchStorage>) {
    }

    /**
     * Create New Factory with new AsyncLocalStorage.
     */
    static create() {
        return new WetchFactory(new AsyncLocalStorage<WetchStorage>())
    }

    setFetcher(fetcher: Fetcher) {
        this.fetcher = fetcher
    }

    /**
     * Create wache function.
     */
    wache() {
        return <A extends any[], T>(fn: (...args: A) => T, config?: WacheConfig): Fn<A, T> => {
            return (...args) => {
                const store = this.als.getStore()
                // if not factory running, run without caching
                if (typeof store === "undefined") {
                    return fn(...args)
                }
                const storage = store.getOrRegisterCacheStorage(fn, config)

                const leaf = storage.resolveLeaf(args)

                return leaf.run(fn, args)
            }
        }
    }

    /**
     * Create wetch function. If fetcher is provided, it uses fetcher instead of global fetch.
     * @param fetcher {Fetcher} - Fetcher if needed
     */
    wetch(fetcher?: Fetcher): Wetch {
        return this.wache()(async (info, init) => {
            const f = (!fetcher?.fetch ? (!this.fetcher ? fetch : this.fetcher.fetch) : fetcher.fetch) as typeof fetch
            return new StoredResponse(await f(info, init))
        })
    }

    /**
     * Run this factory and run inputted function.
     * @param fn {() => Promise<void>} - The function to run in the context
     */
    async run(fn: () => Promise<void>) {
        const promise: Promise<void> = new Promise((resolve, reject) => {
            this.als.run(new WetchStorage(), () => {
                fn().then(() => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        })
        await promise
    }
}
