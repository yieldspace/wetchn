import {WetchCacheConfig, WetchService} from "../service";

export type KvCacheData = {
    headers?: HeadersInit
    cf?: any
    status: number
}

export type KvCacheMetadata = {
    expiresAt?: number
}

export class KvWetchService extends WetchService {
    constructor(private kv: KVNamespace) {
        super();
    }

    static create(kv: KVNamespace): KvWetchService {
        return new KvWetchService(kv)
    }

    async getResponse(key: string, config?: WetchCacheConfig): Promise<Response | null> {
        const data = await this.kv.getWithMetadata<KvCacheData, KvCacheMetadata>(key, "json")
        if (data.value === null) return null
        // expire less than 60s revalidate
        if (data.metadata?.expiresAt && Date.now() < data.metadata.expiresAt) {
            return null
        }
        const body = await this.kv.get(`${key}/body`, "arrayBuffer")
        if (body === null) return null

        return new Response(body, {
            status: data.value.status,
            headers: data.value.headers,
            cf: data.value.cf,
        })
    }

    async storeResponse(key: string, response: Response, config?: WetchCacheConfig): Promise<void> {
        await Promise.all([
            this.kv.put(key, JSON.stringify({
                headers: response.headers,
                cf: response.cf,
                status: response.status,
            } as KvCacheData), {
                expirationTtl: config?.cache?.revalidate,
                metadata: config
            }),
            this.kv.put(`${key}/body`, await response.clone().arrayBuffer(), {
                expirationTtl: !config?.cache?.revalidate ? undefined : (
                    config.cache.revalidate < 60 ? 60 : config.cache.revalidate
                ),
                metadata: {
                    expiresAt: !config?.cache?.revalidate ? undefined : (Date.now() + config.cache.revalidate * 1000)
                } as KvCacheMetadata
            })
        ])
    }

    async revalidateResponse(key: string) {
        const result = await this.kv.list<KvCacheMetadata>({
            prefix: `${key}\t`
        })
        for (const k of result.keys) {
            await this.kv.delete(k.name)
        }
    }
}
