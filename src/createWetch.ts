import {AsyncLocalStorage} from "node:async_hooks";
import {WetchFactory} from "./factory";
import {etch} from "./etch";
import type {WetchStorage} from "./storage";
import {Fetcher} from "@cloudflare/workers-types";

type CreateWetchnConfig = {
    als?: AsyncLocalStorage<WetchStorage>
}

export function createWetch(config?: CreateWetchnConfig) {
    const factory = !config?.als ? WetchFactory.create() : new WetchFactory(config.als)
    return {
        factory,
        wetch: factory.wetch(),
        wache: factory.wache(),
        run: (fn: () => Promise<void>, fetcher?: Fetcher) => {
            return factory.run(fn, fetcher)
        },
        etch: etch(factory),
        setFetcher: factory.setFetcher
    }
}
