type Fn<A extends any[], T> = (...args: A) => T

export type WacheConfig = {
    revalidate?: number
    customId?: any
}

type Primitive = string | number | boolean | null | symbol | void
// eslint-disable-next-line @typescript-eslint/ban-types
type Objective = Function | object

enum LeafState {
    UnExecuted,
    Failed,
    Executed,
}

class FunctionCacheLeaf {
    // TODO: I inspired React cache, but It's very similar...
    private pMap: Map<Primitive, FunctionCacheLeaf> | null = null
    private oMap: WeakMap<Objective, FunctionCacheLeaf> | null = null
    private state = LeafState.UnExecuted
    private error: any = undefined
    private result: any = undefined

    nextPrimitive(value: Primitive) {
        if (this.pMap === null) {
            this.pMap = new Map<Primitive, FunctionCacheLeaf>()
        }
        let leaf = this.pMap.get(value)
        if (typeof leaf === "undefined") {
            leaf = new FunctionCacheLeaf()
            this.pMap.set(value, leaf)
        }
        return leaf
    }

    nextObjective(value: Objective) {
        if (this.oMap === null) {
            this.oMap = new WeakMap<Objective, FunctionCacheLeaf>()
        }
        let leaf = this.oMap.get(value)
        if (typeof leaf === "undefined") {
            leaf = new FunctionCacheLeaf()
            this.oMap.set(value, leaf)
        }
        return leaf
    }

    run<A extends any[], T>(fn: Fn<A, T>, args: A) {
        if (this.state === LeafState.Executed) {
            return this.result
        }
        if (this.state === LeafState.Failed) {
            throw this.error
        }
        try {
            this.result = fn(...args)
            this.state = LeafState.Executed
            // // This is monkey patch, so it should be removed
            // if (this.result instanceof Response) {
            //     this.result = new StoredResponse(this.result)
            // }
            return this.result
        } catch (e) {
            this.error = e
            this.state = LeafState.Failed
            throw e
        }
    }
}

class FunctionCacheStorage {
    private readonly resultLeaf: FunctionCacheLeaf
    constructor(private config?: WacheConfig) {
        this.resultLeaf = new FunctionCacheLeaf()
    }

    resolveLeaf<A extends any[]>(args: A) {
        if (typeof this.config?.customId !== "undefined") {
            args = [this.config.customId] as A
        }

        let leaf = this.resultLeaf
        for (let i = 0; i < args.length; i++) {
            const arg = args[i]
            if (typeof arg === "function" || (typeof arg === "object" && arg !== null)) {
                leaf = leaf.nextObjective(arg)
            } else {
                leaf = leaf.nextPrimitive(arg)
            }
        }
        return leaf
    }
}

export class WetchStorage {
    private storages: WeakMap<any, FunctionCacheStorage>

    constructor() {
        this.storages = new WeakMap<any, FunctionCacheStorage>()
    }

    getOrRegisterCacheStorage<A extends any[], T>(fn: Fn<A, T>, config?: WacheConfig) {
        let cache = this.storages.get(fn)
        if (typeof cache === "undefined") {
            cache = new FunctionCacheStorage(config)
            this.storages.set(fn, cache)
        }
        return cache
    }
}
