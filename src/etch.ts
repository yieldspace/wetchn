import type {ExecutionContext, Request, Response} from "@cloudflare/workers-types";
import type WetchnFactory from "./index";

export function etch(factory: WetchnFactory) {
    return function <E>(fn: (request: Request, env: E, context: ExecutionContext) => Promise<Response>) {
        return async (request: Request, env: E, context: ExecutionContext) => {
            let response: Response | null = null
            await factory.etch(async () => {
                response = await fn(request, env, context)
            })
            if (response === null) {
                throw new Error("Etch Failed")
            }
            return response as Response
        }
    }
}
