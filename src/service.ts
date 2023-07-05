import {Fn} from "./util";

export abstract class WacheService {
    abstract run<T>(fn: () => Promise<T>): Promise<T>
    abstract getOrRunFunction<A extends any[], T>(fn: Fn<A, T>, args: A): T
}

export abstract class WetchService {
    getKey(info: RequestInfo, init?: RequestInit & WetchCacheConfig) {
        return makeKeyFromFetch(info, init)
    }

    abstract getResponse(key: string, config?: WetchCacheConfig): Promise<Response | null>
    abstract storeResponse(key: string, response: Response, config?: WetchCacheConfig): Promise<void>
    abstract revalidateResponse(key: string): Promise<void>

    async fetch(info: RequestInfo, init?: RequestInit & WetchCacheConfig): Promise<Response> {
        const f = init?.fetcher?.fetch ?? fetch
        if (init?.cache?.strategy === "no-store" || !["GET", "HEAD", "OPTIONS"].includes((init?.method ?? "GET").toUpperCase())) {
            return f(info, init)
        }
        const key = this.getKey(info, init)
        let response = await this.getResponse(key, {
            cache: init?.cache
        })

        if (response === null) {
            response = await f(info, init)
            await this.storeResponse(key, response)
        }

        return response
    }
}

export type WetchCacheConfig = {
    cache?: {
        revalidate?: number
        revalidateTag?: string
        strategy?: "force-cache" | "no-store"
        tag?: string
    }
}

function objectToString(obj: Record<string, unknown>) {
    return Object.entries(obj).sort(([k], [k2]) => k.localeCompare(k2)).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("&")
}

function resolveHeaders(init: HeadersInit) {
    if (Array.isArray(init)) {
        return Array.from((init as Iterable<Iterable<string>>)).map(x => {
            const [key, value] = Array.from(x) as [string, string]
            return `${key}=${value}`
        }).join("&")
    }
    if (init instanceof Headers) {
        return Array.from(init.entries()).map(([k, v]) => `${k}=${v}`).join("&")
    }
    return objectToString(init as Record<string, string>)
}

function makeKeyFromRequest(request: Request): string {
    return `${getPathUrl(request.url)}/\t${request.url}/${request.method.toUpperCase()}/${resolveHeaders(request.headers)}/${JSON.stringify(request.cf)}/`
}

function makeKeyFromFetch(info: RequestInfo, init?: RequestInit & WetchCacheConfig) {
    if (info instanceof Request) {
        return makeKeyFromRequest(info)
    }
    let key = ""
    key += `${getPathUrl(info.toString())}\t/${info.toString()}/`
    key += `${init?.method?.toUpperCase() ?? "GET"}/`
    if (!init?.headers) {
        key += "/"
    } else {
        key += `${resolveHeaders(init.headers)}/`
    }
    key += `${objectToString(init?.cache ?? {})}/`
    return key
}

function getPathUrl(urlString: string) {
    const url = new URL(urlString)
    return `${url.protocol}//${url.host}${url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`}`
}
