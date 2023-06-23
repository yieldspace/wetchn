import {AsyncLocalStorage} from "node:async_hooks";
import {WetchFactory} from "./factory";
import {etch} from "./etch";
import type {WetchStorage} from "./storage";

type CreateWetchnConfig = {
    als?: AsyncLocalStorage<WetchStorage>
}

export function createWetch(config?: CreateWetchnConfig) {
    const factory = !config?.als ? WetchFactory.create() : new WetchFactory(config.als)
    return {
        factory,
        wetch: factory.wetch(),
        wache: factory.wache(),
        run: factory.run,
        etch: etch(factory),
        setFetcher: factory.setFetcher
    }
}
