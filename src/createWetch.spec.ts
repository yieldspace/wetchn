import { expect, test } from "vitest";
import {createWetch} from "./createWetch";
import {KvWetchService} from "./wetch";
import {mockFetcher} from "./test_utils/mock";
import {createWache} from "./createWache";
import AsyncLocalStorageWacheService from "./wache";
const describe = setupMiniflareIsolatedStorage();

declare global {
    const TEST_NAMESPACE: KVNamespace
    const TEST_NAMESPACE2: KVNamespace
}

describe("test createWetch", () => {
    test("test basic wetch with kv store", async () => {
        const {wetch} = createWetch(KvWetchService.create(TEST_NAMESPACE))
        const resp = await wetch("https://dummy-url", {fetcher: mockFetcher})
        const resp2 = await wetch("https://dummy-url", {fetcher: mockFetcher})
        expect(await resp.json()).toStrictEqual(await resp2.json())
        expect(resp.status).toBe(resp2.status)
        // Header is saved as HeadersInit, so it's different
        // expect(resp.headers).toBe(resp2.headers)
    })

    test("test revalidateUrl", async () => {
        const {wetch, revalidateUrl} = createWetch(KvWetchService.create(TEST_NAMESPACE))
        const resp = await wetch("https://dummy-url", {fetcher: mockFetcher})
        const resp2 = await wetch("https://dummy-url", {fetcher: mockFetcher})
        expect(await resp.clone().json()).toStrictEqual(await resp2.json())
        await revalidateUrl("https://dummy-url/")
        const resp3 = await wetch("https://dummy-url", {fetcher: mockFetcher})
        expect(await resp.json()).not.toStrictEqual(await resp3.json())
    })

    test("test wetch with wache", async () => {
        const {wache, run} = createWache(AsyncLocalStorageWacheService.create())
        const {wetch, revalidateUrl} = createWetch({
            service: KvWetchService.create(TEST_NAMESPACE2),
            wache
        })
        await run(async () => {
            const resp = await wetch("https://dummy-url", {fetcher: mockFetcher})
            // await revalidateUrl("https://dummy-url/") TODO: not running with removing this
            const resp2 = await wetch("https://dummy-url", {fetcher: mockFetcher})
            expect(await resp.clone().json()).toStrictEqual(await resp2.json())
        })
    })
})
