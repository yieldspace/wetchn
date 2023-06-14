import type {Response} from "@cloudflare/workers-types";

export class StoredResponse implements Response {
    private original: Response
    constructor(response: Response) {
        this.original = response
    }

    get body() {
        return this.original.clone().body
    }
    get bodyUsed() {
        return this.original.bodyUsed
    }
    get cf() {
        return this.original.cf
    }
    get headers() {
        return this.original.headers
    }
    get ok() {
        return this.original.ok
    }
    get redirected() {
        return this.original.redirected
    }
    get status() {
        return this.original.status
    }
    get statusText() {
        return this.original.statusText
    }
    get url() {
        return this.original.url
    }
    get webSocket() {
        return this.original.clone().webSocket
    }

    arrayBuffer(): Promise<ArrayBuffer> {
        return this.original.clone().arrayBuffer()
    }

    blob(): Promise<Blob> {
        return this.original.clone().blob()
    }

    clone(): StoredResponse {
        return new StoredResponse(this.original.clone())
    }

    formData(): Promise<FormData> {
        return this.original.clone().formData()
    }

    json<T>(): Promise<T> {
        return this.original.clone().json<T>()
    }

    text(): Promise<string> {
        return this.original.clone().text()
    }
}
