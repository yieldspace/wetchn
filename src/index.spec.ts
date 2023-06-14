import { expect, test } from "vitest";
import type {Fetcher} from "@cloudflare/workers-types"
import {WetchnFactory} from "./index"

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

test("basic wetch", async () => {
    await factory.run(async () => {
        const uuid1 = await getUuid()
        const uuid2 = await getUuid()
        expect(uuid1).toBe(uuid2)
    })
});
