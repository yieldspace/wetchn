import {WacheService} from "./service";
import {Fn, Env} from "./util";

export type EtchDefaultExports<E extends Env = Env> = {
    fetch?: (request: Request, env: E, context: ExecutionContext) => Response | Promise<Response>
    scheduled?: (event: ScheduledEvent, env: E, context: ExecutionContext) => Promise<void>
    tail?: (event: TailEvent) => Promise<void>
}

export type Wache = <A extends any[], T>(fn: Fn<A, T>) => Fn<A, T>
export type Etch = <E extends Env = Env>(exports: EtchDefaultExports<E>) => EtchDefaultExports<E>
export type CreateWache = {
    service: WacheService
    wache: Wache
    etch: Etch
    run: <T>(fn: () => Promise<T>) => Promise<T>
}

export function createWache(service: WacheService): CreateWache {
    return {
        service,
        wache<A extends any[], T>(fn: Fn<A, T>): Fn<A, T> {
            return (...args) => {
                return service.getOrRunFunction(fn, args)
            }
        },
        run<T>(fn: () => Promise<T>): Promise<T> {
            return service.run(fn)
        },
        etch<E extends Env = Env>(exports: EtchDefaultExports<E>): EtchDefaultExports<E> {
            return {
                fetch: !exports.fetch ? undefined
                    : async (request, env, context) => {
                        return await service.run(async () => {
                            return exports.fetch!(request, env, context);
                        })
                    },
                    scheduled: !exports.scheduled ? undefined
                : async (event, env, context) => {
                    await service.run(async () => {
                        await exports.scheduled!(event, env, context)
                    })
                },
                tail: !exports.tail ? undefined
                : async (event) => {
                    await service.run(async () => {
                        await exports.tail!(event)
                    })
                },
            }
        }
    }
}
