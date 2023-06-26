import type {WetchFactory} from "./index";
import {Env} from "./worker";

export type EtchDefaultExports<E extends Env = Env> = {
    fetch?: (request: Request, env: E, context: ExecutionContext) => Response | Promise<Response>
    scheduled?: (event: ScheduledEvent, env: E, context: ExecutionContext) => Promise<void>
    tail?: (event: TailEvent) => Promise<void>
}

/**
 * A wrapper of worker's default export. It runs input factory before request.
 * @param factory {WetchFactory} - The factory to run
 */
export function etch<E extends Env = Env>(factory: WetchFactory) {
    if (typeof factory === "undefined") {
        throw new Error("Global Factory is not initialized!")
    }
    return function etching(exports: EtchDefaultExports<E>): EtchDefaultExports<E> {
        return {
            fetch: !exports.fetch ? undefined
                : async (request, env, context) => {
                let response: Response | null = null
                await factory.run(async () => {
                    response = await exports.fetch!(request, env, context)
                })
                if (response === null) {
                    throw new Error("Etch Failed")
                }
                return response as Response
            },
            scheduled: !exports.scheduled ? undefined
                : async (event, env, context) => {
                await factory.run(async () => {
                    await exports.scheduled!(event, env, context)
                })
            },
            tail: !exports.tail ? undefined
                : async (event) => {
                await factory.run(async () => {
                    await exports.tail!(event)
                })
            },
        }
    }
}
