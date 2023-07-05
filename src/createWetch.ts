import type {Wache} from "./createWache";
import {WetchCacheConfig, WetchService} from "./service";
import {StoredResponse} from "./response";
import {CFWetchService} from "./wetch";

export type Wetch = (input: RequestInfo<unknown, CfProperties<unknown>>, init?: RequestInit<RequestInitCfProperties> & WetchCacheConfig) => Promise<Response>

export type CreateWetch = {
    wetch: Wetch
    revalidateUrl: (url: string) => Promise<void>
}

export type CreateWetchConfig = {
    wache?: Wache
    service?: WetchService
}

/**
 * create WetchFactory and utility functions.
 */
export function createWetch(configOrService?: CreateWetchConfig | WetchService): CreateWetch {
    let config: CreateWetchConfig
    if (configOrService instanceof WetchService) {
        config = {
            service: configOrService
        }
    } else {
        config = configOrService ?? {}
    }

    const service = config?.service ?? CFWetchService.create()

    const wetch: Wetch = typeof config?.wache === "undefined" ? async (init, info) => {
        return await service.fetch(init, info)
    } : async (info, init) => {
        const cachedWetch = config.wache!(async (service: WetchService, info: RequestInfo, init?: RequestInit) => {
            return new StoredResponse(await service.fetch(info, init))
        })
        return cachedWetch(service, info, init)
    }
    const revalidateUrl = async (url: string) => {
        await service.revalidateResponse(url.endsWith("/") ? url : `${url}/`)
    }

    return {
        wetch,
        revalidateUrl,
    }
}
