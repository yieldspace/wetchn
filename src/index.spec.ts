import { expect, test } from "vitest";
import type {Fetcher} from "@cloudflare/workers-types"
import globalWetch, {WetchnFactory} from "./index"

const mockFetcher: Fetcher = {
    async fetch(): Promise<Response> {
        return new Response(JSON.stringify({
            uuid: crypto.randomUUID()
        }), {
            headers: {
                "Content-Type": "application/json"
            }
        })
    },
    connect(): Socket {
        throw new Error("")
    }
}

const factory = WetchnFactory.create()
const wetch = factory.wetch(mockFetcher)

const getUuid = async () => {
    const response = await wetch("https://mock-url/")
    const {uuid} = await response.json<{uuid: string}>()
    return uuid
}
const getUuidGlobal = async () => {
    const response = await globalWetch("https://mock-url/")
    const {uuid} = await response.json<{uuid: string}>()
    return uuid
}

test("basic wetch", async () => {
    await factory.run(async () => {
        const uuid1 = await getUuid()
        const uuid2 = await getUuid()

        expect(uuid1).toBe(uuid2)
    })
});

test("test global wetch", async () => {
    WetchnFactory.global()
    await WetchnFactory.runGlobal(async () => {
        const uuid1 = await getUuidGlobal()
        const uuid2 = await getUuidGlobal()

        expect(uuid1).toBe(uuid2)
    }, mockFetcher)
})
