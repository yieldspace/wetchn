/// <reference types="@cloudflare/workers-types" />
import type {HeadersInit, RequestInfo, RequestInit} from "@cloudflare/workers-types"

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
    return Object.entries(init as Record<string, string>).map(([key, value]) => {
        return `${key}=${value}`
    }).join("&")
}

function makeKeyFromRequest(request: Request): string {
    return `${request.method.toUpperCase()}/${request.url}/${resolveHeaders(request.headers)}/${JSON.stringify(request.cf)}/`
}

export function makeKeyFromFetch(info: RequestInfo, init?: RequestInit) {
    let key = `${init?.method?.toUpperCase() ?? "GET"}/`
    if (typeof info === "string") {
        key += `${info}/`
    } else {
        if (info instanceof Request) {
            return makeKeyFromRequest(info)
        }
        key += `${info.toString()}/`
    }
    if (!init?.headers) {
        key += "/"
    } else {
        key += `${resolveHeaders(init.headers)}/`
    }
    return key
}
