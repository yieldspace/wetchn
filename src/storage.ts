import type {StoredResponse} from "./response";

export class WetchnStorage {
    private responseStorage: Map<string, StoredResponse>

    constructor() {
        this.responseStorage = new Map<string, StoredResponse>
    }

    storeResponse(key: string, response: StoredResponse) {
        this.responseStorage.set(key, response)
    }

    hasResponse(key: string) {
        return this.responseStorage.has(key)
    }

    getResponse(key: string) {
        return this.responseStorage.get(key)
    }
}
