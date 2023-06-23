import { expect, test } from "vitest";
import {createWetch} from "./index";
import {mockFetcher, testGetUuid} from "./test_utils/mock";

test("test basic createWetch", async () => {
    const {wetch, factory} = createWetch()

    factory.setFetcher(mockFetcher)
    await factory.run(async () => {
        const uuid1 = await testGetUuid(wetch)
        const uuid2 = await testGetUuid(wetch)

        expect(uuid1).toBe(uuid2)
    })
});
