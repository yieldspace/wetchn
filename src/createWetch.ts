import {AsyncLocalStorage} from "node:async_hooks";
import {WetchnStorage} from "./storage";
import {WetchnFactory} from "./factory";
import {etch} from "./etch";

type CreateWetchnConfig = {
    als?: AsyncLocalStorage<WetchnStorage>
}

export function createWetch(config?: CreateWetchnConfig) {
    const factory = !config?.als ? WetchnFactory.create() : new WetchnFactory(config.als)
    return {
        factory,
        wetch: factory.wetch(),
        wache: factory.wache(),
        run: factory.run,
        etch: etch(factory),
        setFetcher: factory.setFetcher
    }
}
