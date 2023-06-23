import {Fetcher} from "@cloudflare/workers-types";
import {AsyncLocalStorage} from "node:async_hooks";
import {makeKeyFromFetch} from "./store";
import {StoredResponse} from "./response";
import {WetchnStorage} from "./storage";

type Fn<A extends any[], T> = (...args: A) => T

type WacheConfig<T extends any = {}> = {
    revalidate?: number
    customId?: T
}

export class WetchnFactory {
    private fetcher?: Fetcher
    constructor(private als: AsyncLocalStorage<WetchnStorage>) {
    }

    static create() {
        return new WetchnFactory(new AsyncLocalStorage<WetchnStorage>())
    }

    setFetcher(fetcher: Fetcher) {
        this.fetcher = fetcher
        console.error(this.fetcher)
    }

    wache() {
        return <A extends any[], T>(fn: (...args: A) => T, config?: WacheConfig): Fn<A, T> => {
            // TODO
            return (...args) => {
                return fn.apply(null, args)
            }
        }
    }

    wetch(fetcher?: Fetcher): typeof fetch {
        return async (info, init) => {
            const f = (!fetcher?.fetch ? (!this.fetcher ? fetch : this.fetcher.fetch) : fetcher.fetch) as typeof fetch
            const store = this.als.getStore()
            // if not factory running
            if (typeof store === "undefined") {
                throw new Error("Factory is not running")
            }
            // no cache if request is not get or head
            if (!["GET", "HEAD"].includes(init?.method?.toUpperCase() ?? "GET")) {
                return await f(info, init)
            }
            const key = makeKeyFromFetch(info, init)
            if (store.hasResponse(key)) {
                return (store.getResponse(key) as StoredResponse)
            }

            const response = await f(info, init)
            const stored = new StoredResponse(response)
            store.storeResponse(key, stored)

            return stored
        }
    }

    async run(fn: () => Promise<void>, fetcher?: Fetcher) {
        if (!!fetcher) {
            this.setFetcher(fetcher)
        }
        const promise: Promise<void> = new Promise((resolve, reject) => {
            this.als.run(new WetchnStorage(), () => {
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
