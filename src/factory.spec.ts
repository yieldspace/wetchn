import { expect, test } from "vitest";
import {WetchnFactory} from "./factory"
import {mockFetcher, testGetUuid} from "./test_utils/mock";

const factory = WetchnFactory.create()
const wetch = factory.wetch(mockFetcher)


test("basic wetch", async () => {
    await factory.run(async () => {
        const uuid1 = await testGetUuid(wetch)
        const uuid2 = await testGetUuid(wetch)

        expect(uuid1).toBe(uuid2)
    })
});
