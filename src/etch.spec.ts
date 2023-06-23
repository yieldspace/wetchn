import { expect, test } from "vitest"
import {WetchFactory} from "./index"
import {etch} from "./etch"
import {ExecutionContext, Fetcher} from "@cloudflare/workers-types";

const mockFetcher: Fetcher = {
    async fetch(): Promise<Response> {
        return new Response("")
    },
    connect(): Socket {
        throw new Error("")
    }
}

const mockExecutionContext: ExecutionContext = {
    passThroughOnException(): void {
    }, waitUntil(): void {
    }
}

test("test etch", async () => {
    const factory = WetchFactory.create()
    const wetch = factory.wetch(mockFetcher)
    const mockExports = etch(factory)({
        async fetch() {
            return await wetch("https://mock-url/")
        }
    })
    const resp = await mockExports.fetch!(new Request("https://dummy-url"), {}, mockExecutionContext)
    expect(resp.ok).toBe(true)
})
