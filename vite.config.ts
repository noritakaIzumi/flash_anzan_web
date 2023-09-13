import { defineConfig } from "vite"
import * as path from "path"
import * as fs from "fs"

const appVersion = (() => {
    const json = fs.readFileSync(path.resolve(__dirname) + "/package.json")
    const body = JSON.parse(json.toString()) as { version: string }
    return `v${body.version}`
})()

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    root: path.resolve(__dirname, "src"),
    base: "",
    define: {
        __APP_VERSION__: `"${appVersion}"`,
    },
    build: {
        outDir: "../dist",
        rollupOptions: {
            output: {
                entryFileNames: "assets/[name].[hash].js",
                chunkFileNames: "assets/[name].[hash].js",
                assetFileNames: "assets/[name].[hash].[ext]",
            },
        },
    },
    css: {
        devSourcemap: true,
    },
    server: {
        port: 8080,
        watch: {
            usePolling: false,
        },
    },
})
