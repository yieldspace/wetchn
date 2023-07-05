export type Fn<A extends any[], T> = (...args: A) => T
export type Env = Record<string, unknown>
