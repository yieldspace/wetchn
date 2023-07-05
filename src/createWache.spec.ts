import { expect, test } from "vitest";
import {createWache} from "./createWache";
import AsyncLocalStorageWacheService from "./wache";

test("test no args create wache with als storage", async () => {
    const {wache, run} = createWache(AsyncLocalStorageWacheService.create())
    const fn = wache(() => {
        return crypto.randomUUID()
    })
    await run(async () => {
        expect(fn()).toBe(fn())
    })
})
