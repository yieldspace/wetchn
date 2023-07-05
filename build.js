import {build} from "esbuild";
import fs from "fs/promises"

const rewriteNodeImport = async (filename) => {
    const esm = await fs.readFile(filename)
    await fs.writeFile(filename, esm.toString()
        .replaceAll("async_hooks", "node:async_hooks")
    )
}

const shared = {
    bundle: true,
    entryPoints: [
        "src/index.ts",
        "src/wache/index.ts",
        "src/wetch/index.ts",
    ],
    logLevel: 'info',
    minify: true,
    sourcemap: false,
    platform: "node",
    target: "es2022",
    tsconfig: "tsconfig.json",
    jsx: "automatic",
    outdir: "./dist"
}

await build({
    ...shared,
    format: 'esm',
    outExtension: {
        ".js": ".mjs"
    }
})

await build({
    ...shared,
    format: 'cjs',
    outExtension: {
        ".js": ".cjs.js"
    }
})

await rewriteNodeImport('./dist/wache/index.cjs.js')
await rewriteNodeImport('./dist/wache/index.mjs')
