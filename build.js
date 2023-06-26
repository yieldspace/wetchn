import {build} from "esbuild";
import fs from "fs/promises"
import pkg from "./package.json" assert { type: "json" }

const entryFile = 'src/index.ts'
const shared = {
    bundle: true,
    entryPoints: [entryFile],
    external: Object.keys(pkg.dependencies ?? {}),
    logLevel: 'info',
    minify: true,
    sourcemap: false,
    platform: "node",
    target: "es2022",
    tsconfig: "tsconfig.json",
    jsx: "automatic",
}

await build({
    ...shared,
    format: 'esm',
    outfile: './dist/index.mjs',
})

const esm = await fs.readFile('./dist/index.mjs')
await fs.writeFile("./dist/index.mjs", esm.toString().replaceAll("async_hooks", "node:async_hooks"))

await build({
    ...shared,
    format: 'cjs',
    outfile: './dist/index.cjs.js',
})

const cjs = await fs.readFile('./dist/index.cjs.js')
await fs.writeFile("./dist/index.cjs.js", cjs.toString().replaceAll("async_hooks", "node:async_hooks"))
