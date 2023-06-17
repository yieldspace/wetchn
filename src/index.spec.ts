import { expect, test } from "vitest";
import {createWetchn} from "./index";
import {mockFetcher, testGetUuid} from "./test_utils/mock";

const {wetch, factory} = createWetchn()


test("basic wetch", async () => {
    factory.setFetcher(mockFetcher)
    await factory.run(async () => {
        const uuid1 = await testGetUuid(wetch)
        const uuid2 = await testGetUuid(wetch)

        expect(uuid1).toBe(uuid2)
    })
});
