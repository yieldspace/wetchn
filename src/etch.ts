import type {WetchnFactory} from "./index";
import {Fetcher} from "@cloudflare/workers-types";

export type EtchDefaultExports<Env> = {
    fetch?: (request: Request, env: Env, context: ExecutionContext) => Promise<Response>
    scheduled?: (event: ScheduledEvent, env: Env, context: ExecutionContext) => Promise<void>
    tail?: (event: TailEvent) => Promise<void>
}

export function etch<Env>(factory?: WetchnFactory, fetcher?: Fetcher) {
    if (typeof factory === "undefined" && typeof globalThis.__GLOBAL_FACTORY__ === "undefined") {
        throw new Error("Global Factory is not initialized!")
    }
    const f = factory ?? globalThis.__GLOBAL_FACTORY__!
    if (!!fetcher) {
        f.setFetcher(fetcher)
    }
    return function etching(exports: EtchDefaultExports<Env>): EtchDefaultExports<Env> {
        return {
            fetch: !exports.fetch ? undefined
                : async (request, env, context) => {
                let response: Response | null = null
                await f.run(async () => {
                    response = await exports.fetch!(request, env, context)
                })
                if (response === null) {
                    throw new Error("Etch Failed")
                }
                return response as Response
            },
            scheduled: !exports.scheduled ? undefined
                : async (event, env, context) => {
                await f.run(async () => {
                    await exports.scheduled!(event, env, context)
                })
            },
            tail: !exports.tail ? undefined
                : async (event) => {
                await f.run(async () => {
                    await exports.tail!(event)
                })
            },
        }
    }
}
