import type {fetch as workerFetch, Fetcher} from "@cloudflare/workers-types"

import {AsyncLocalStorage} from 'node:async_hooks';
import {makeKeyFromFetch} from "./store";
import {StoredResponse} from "./response";

export {etch} from "./etch"

export type WetchnStorage = Map<string, StoredResponse>

export class WetchnFactory {
    constructor(private als: AsyncLocalStorage<WetchnStorage>) {
    }

    static create() {
        return new WetchnFactory(new AsyncLocalStorage<WetchnStorage>())
    }

    // static global() {
    //     globalThis._wetchFactory = new WetchnFactory(new AsyncLocalStorage<WetchnStorage>())
    // }

    wetch(fetcher?: Fetcher): typeof workerFetch {
        const f = (!fetcher?.fetch ? fetch : fetcher.fetch) as typeof workerFetch
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

    async run(fn: () => Promise<void>) {
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
}

export default WetchnFactory
