import { defineConfig } from "vite"
import * as path from "path"
import * as fs from "fs"

const appVersion = (() => {
    const json = fs.readFileSync(path.resolve(__dirname) + "/package.json")
    const body = JSON.parse(json.toString()) as { version: string }
    return `v${body.version}`
})()

const [appName, appDescription] = (() => {
    const json = fs.readFileSync(path.resolve(__dirname) + "/src/public/manifest.json")
    const body = JSON.parse(json.toString()) as { name: string, description: string }
    return [body.name, body.description]
})()

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    root: path.resolve(__dirname, "src"),
    base: "",
    define: {
        APP_VERSION: `"${appVersion}"`,
        APP_NAME: `"${appName}"`,
        APP_DESCRIPTION: `"${appDescription}"`,
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
