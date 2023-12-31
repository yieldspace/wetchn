# wetchn
wetchn - Worker-Fetchication is a library that provides AsyncLocalStorage based cache for Cloudflare Workers.

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

- [ ] Fetch remove duplicate
    - [ ] Perfectly designed 
    - [x] Function
    - [x] Base system by AsyncLocalStorage
    - [x] Cache by name
    - [x] Load cache by name
    - [ ] Write document
- [ ] Function cache
    - [ ] Perfectly designed
    - [x] Function
    - [x] Base system by AsyncLocalStorage
    - [x] Caching
    - [ ] Write document
- [ ] CI/CD
- [ ] Document
- [ ] Fetch cache and revalidate system
  - [ ] use cache
  - [ ] use kv


# Example

This is proposal. issue is welcome.

```typescript
import {createWetch, createWache} from "wetchn"
import {KvWetchService} from "wetchn/wetch"
import AsyncLocalStorageWacheService from "wetchn/wache"

const {wetch, etch} = createWetch(KvWetchService.create())
const {wache} = createWache(AsyncLocalStorageWacheService.create())

const cachedFn = wache(() => {
    return crypto.randomUUID()
})

export default etch({
  async fetch(req) {
    const resp = await wetch("https://example.com")
    const resp2 = await wetch("https://example.com") // same as resp and no fetch call until calling revalidatePath

    const uid1 = cachedFn()
    const uid2 = cachedFn() // same as uid1 per a request

    return new Response("abc")
  }
})
```
