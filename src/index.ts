import type {fetch as workerFetch, Fetcher} from "@cloudflare/workers-types"

import { AsyncLocalStorage } from 'node:async_hooks';
export {etch} from "./etch"

export type WetchnStorage = Map<string, any>

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
        return async (info, init) => {
            const store = this.als.getStore()
            // if not factory running
            if (typeof store === "undefined") {
                return await (fetch as typeof workerFetch)(info, init)
            }
            // TODO get data and store data
            return await ((fetcher ?? fetch) as typeof workerFetch)(info, init)
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
