import {Fetcher} from "@cloudflare/workers-types";

export const mockFetcher: Fetcher = {
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

export const testGetUuid = async (wetch: typeof fetch) => {
    const response = await wetch("https://mock-url/")
    const {uuid} = await response.json<{uuid: string}>()
    return uuid
}
