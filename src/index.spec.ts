import { expect, test } from "vitest";
import {WetchnFactory} from "./index"

const factory = WetchnFactory.create()
const wetch = factory.wetch()

const getUuid = async () => {
    const response = await wetch("https://httpbin.org/uuid")
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
