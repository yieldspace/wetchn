# fetchn
fetchn - Fetchication is a library that provides AsyncLocalStorage based cache for Cloudflare Workers.

⚠️This library is work in progress, and don't work as expected or not improved.

## ⚠️Warning: This Library is using nodejs_compat compatibility flag

You need to enable nodejs_compat flag on your wrangler.toml or wrangler command.
See also: [Cloudflare Docs](https://developers.cloudflare.com/workers/platform/compatibility-dates/#nodejs-compatibility-flag)

```toml
compatibility_flags = [ "nodejs_compat" ]
```

# Features

## Fetch cache like Next.js

This library provides cache system like Next.js fetch function.

https://nextjs.org/docs/app/building-your-application/data-fetching/caching

See [Example](#example).

## Function Cache like React cache

This library also provides function cache like React cache.

https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md

See [Example](#example).

# TODO

- [ ] Fetch cache
    - [ ] Perfectly designed 
    - [x] Function
    - [x] Base system by AsyncLocalStorage
    - [ ] Cache by name
    - [ ] Load cache by name
    - [ ] Write document
- [ ] Function cache
    - [ ] Perfectly designed
    - [ ] Function
    - [x] Base system by AsyncLocalStorage
    - [ ] Caching
    - [ ] Write document
- [ ] CI/CD
- [ ] Document

# Example

This is proposal. issue is welcome.

```typescript
import {FetchnFactory} from "fetchn"

const factory = FetchnFactory.create()
const factory2 = FetchnFactory.create()
const fetchn = factory.fetchn()
const fetchn2 = factory2.fetchn()

const cachedFn = factory.cachen(async () => {
    return crypto.randomUUID()
})

export default {
    fetch: taste(factory)(async (req) => {
        const resp = await fetchn("https://example.com")
        const resp2 = await fetchn("https://example.com") // same as resp

        await factory2.run(async () => {
            const resp3 = await fetchn2("https://example.com") // not same as resp, resp2
            const resp4 = await fetchn2("https://example.com") // same as resp3
        })
        
        const uid1 = cachedFn()
        const uid2 = cachedFn() // same as uid1

        return new Response("abc")
    })
}
```
