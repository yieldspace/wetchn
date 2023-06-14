import type {fetch as workerFetch, Request, Response, ExecutionContext, Fetcher} from "@cloudflare/workers-types"

import { AsyncLocalStorage } from 'node:async_hooks';

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
            // if not running
            if (typeof store === "undefined") {
                return await (fetch as typeof workerFetch)(info, init)
            }
            // TODO get data and store data
            return await ((fetcher ?? fetch) as typeof workerFetch)(info, init)
        }
    }

    async run(fn: () => Promise<void>) {
        this.als.run(new Map(), () => {
            fn().catch(err => {
                throw err
            })
        })
    }
}


export function etch(factory: WetchnFactory) {
    return function <E>(fn: (request: Request, env: E, context: ExecutionContext) => Promise<Response>) {
        return async (request: Request, env: E, context: ExecutionContext) => {
            let response: Response | null = null
            await factory.run(async () => {
                response = await fn(request, env, context)
            })
            if (response === null) {
                throw new Error("Etch Failed")
            }
            return response as Response
        }
    }
}

export default WetchnFactory
