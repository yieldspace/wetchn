import { expect, test } from "vitest"
import globalWetch, {WetchnFactory} from "./index"
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
    }, waitUntil(promise: Promise<any>): void {
    }
}

test("test etch", async () => {
    const factory = WetchnFactory.create()
    const wetch = factory.wetch(mockFetcher)
    const mockExports = etch<{}>(factory)({
        async fetch() {
            return await wetch("https://mock-url/")
        }
    })
    const mockExportsFails = {
        async fetch() {
            return await wetch("https://mock-url/")
        }
    }
    const resp = await mockExports.fetch!(new Request("https://dummy-url"), {}, mockExecutionContext)
    expect(resp.ok).toBe(true)
    expect(mockExportsFails.fetch()).rejects.toStrictEqual(new Error("Factory is not running"))
})

test("test global etch", async () => {
    WetchnFactory.global()
    const mockExports = etch<{}>(undefined, mockFetcher)({
        async fetch() {
            return await globalWetch("https://mock-url/")
        }
    })
    const mockExportsFails = {
        async fetch() {
            return await globalWetch("https://mock-url/")
        }
    }
    const resp = await mockExports.fetch!(new Request("https://dummy-url"), {}, mockExecutionContext)
    expect(resp.ok).toBe(true)
    expect(mockExportsFails.fetch()).rejects.toStrictEqual(new Error("Factory is not running"))
})
