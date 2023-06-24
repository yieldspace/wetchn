import {AsyncLocalStorage} from "node:async_hooks";
import {WetchFactory} from "./factory";
import {etch} from "./etch";
import type {WetchStorage} from "./storage";
import {Fetcher} from "@cloudflare/workers-types";

export type CreateWetchConfig = {
    als?: AsyncLocalStorage<WetchStorage>
}

/**
 * create WetchFactory and utility functions.
 * @param config {CreateWetchConfig} - The config of WetchFactory.
 */
export function createWetch(config?: CreateWetchConfig) {
    const factory = !config?.als ? WetchFactory.create() : new WetchFactory(config.als)
    const wetch = factory.wetch()
    return {
        factory,
        wetch,
        wache: factory.wache(),
        run: (fn: () => Promise<void>, fetcher?: Fetcher) => {
            return factory.run(fn, fetcher)
        },
        etch: etch(factory),
        setFetcher: factory.setFetcher,
        fetcher: {
            fetch: wetch,
            connect(): Socket {
                throw new Error("UnImplemented")
            }
        } as Fetcher
    }
}
