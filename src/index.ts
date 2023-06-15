import {AsyncLocalStorage} from 'node:async_hooks';
import {makeKeyFromFetch} from "./store";
import {StoredResponse} from "./response";
import {Fetcher} from "@cloudflare/workers-types";

export {etch} from "./etch"

export type WetchnStorage = Map<string, StoredResponse>


declare global {
    var __GLOBAL_FACTORY__: WetchnFactory | undefined
}

export class WetchnFactory {
    private fetcher?: Fetcher
    constructor(private als: AsyncLocalStorage<WetchnStorage>) {
    }

    static create() {
        return new WetchnFactory(new AsyncLocalStorage<WetchnStorage>())
    }

    static global() {
        globalThis.__GLOBAL_FACTORY__ = new WetchnFactory(new AsyncLocalStorage<WetchnStorage>())
    }

    setFetcher(fetcher: Fetcher) {
        this.fetcher = fetcher
    }

    wetch(fetcher?: Fetcher): typeof fetch {
        const f = (!fetcher?.fetch ? (!this.fetcher ? fetch : this.fetcher.fetch) : fetcher.fetch) as typeof fetch
        return async (info, init) => {
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
            if (store.has(key)) {
                return (store.get(key) as StoredResponse)
            }

            const response = await f(info, init)
            const stored = new StoredResponse(response)
            store.set(key, stored)

            return stored
        }
    }

    async run(fn: () => Promise<void>, fetcher?: Fetcher) {
        if (!!fetcher) {
            this.setFetcher(fetcher)
        }
        const promise: Promise<void> = new Promise((resolve, reject) => {
            this.als.run(new Map(), () => {
                fn().then(() => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        })
        await promise
    }

    static async runGlobal(fn: () => Promise<void>, fetcher?: Fetcher) {
        if (typeof globalThis.__GLOBAL_FACTORY__ === "undefined") {
            throw new Error("Global Factory is not initialized!")
        }
        if (!!fetcher) {
            globalThis.__GLOBAL_FACTORY__.setFetcher(fetcher)
        }
        await globalThis.__GLOBAL_FACTORY__.run(fn)
    }
}

const wetch: typeof fetch = async (info, init) => {
    if (typeof globalThis.__GLOBAL_FACTORY__ === "undefined") {
        return await fetch(info, init)
    }
    return globalThis.__GLOBAL_FACTORY__.wetch()(info, init)
}

export default wetch
