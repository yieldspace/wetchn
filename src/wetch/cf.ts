import {WetchService} from "../service";

/**
 * The Wetch Service that uses fetch's cf properties (not implemented)
 */
export class CFWetchService extends WetchService {
    static create() {
        return new CFWetchService()
    }

    async getResponse(): Promise<Response | null> {
        return null
    }

    async storeResponse(): Promise<void> {}

    revalidateResponse(key: string): Promise<void> {
        return Promise.resolve(undefined);
    }
}
