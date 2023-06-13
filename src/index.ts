import type {fetch as workerFetch} from "@cloudflare/workers-types"
export type Fetchn = typeof workerFetch & {}

const fetchn: Fetchn = async () => {
    return new Response("ok")
}

export default fetchn
