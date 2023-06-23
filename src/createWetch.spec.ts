import { expect, test } from "vitest";
import {createWetch} from "./index";
import {mockFetcher, testGetUuid} from "./test_utils/mock";

test("test basic createWetch", async () => {
    const {wetch, factory, run} = createWetch()

    factory.setFetcher(mockFetcher)
    await run(async () => {
        const uuid1 = await testGetUuid(wetch)
        const uuid2 = await testGetUuid(wetch)

        expect(uuid1).toBe(uuid2)
    })
});

test("test wache by createWetch", async () => {
    const {run, wache} = createWetch()

    const cachedFn = wache(() => {
        return crypto.randomUUID()
    })

    await run(async () => {
        expect(cachedFn()).toBe(cachedFn())
    })
})
