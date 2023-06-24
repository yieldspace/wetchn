import { expect, test } from "vitest";
import {WetchFactory} from "./factory"
import {mockFetcher, testGetUuid} from "./test_utils/mock";


test("test basic wetch", async () => {
    const factory = WetchFactory.create()
    const wetch = factory.wetch(mockFetcher)
    await factory.run(async () => {
        const uuid1 = await testGetUuid(wetch)
        const uuid2 = await testGetUuid(wetch)

        expect(uuid1).toBe(uuid2)
    })
});

test("test basic wache", async () => {
    const factory = WetchFactory.create()
    const cachedFn = factory.wache()(() => {
        return crypto.randomUUID()
    })

    await factory.run(async () => {
        expect(cachedFn()).toBe(cachedFn())
    })
})

test("test wache with arguments", async () => {
    const factory = WetchFactory.create()
    const cachedFn = factory.wache()((a: string) => {
        return crypto.randomUUID() + a
    })

    await factory.run(async () => {
        expect(cachedFn("1")).toBe(cachedFn("1"))
        expect(cachedFn("2")).not.toBe(cachedFn("1"))
        expect(cachedFn("2")).toBe(cachedFn("2"))
    })
})
