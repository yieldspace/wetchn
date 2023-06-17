import type {WetchnFactory} from "./index";

export type EtchDefaultExports<Env> = {
    fetch?: (request: Request, env: Env, context: ExecutionContext) => Promise<Response>
    scheduled?: (event: ScheduledEvent, env: Env, context: ExecutionContext) => Promise<void>
    tail?: (event: TailEvent) => Promise<void>
}

export function etch<Env>(factory: WetchnFactory) {
    if (typeof factory === "undefined") {
        throw new Error("Global Factory is not initialized!")
    }
    return function etching(exports: EtchDefaultExports<Env>): EtchDefaultExports<Env> {
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
