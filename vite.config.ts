import { defineConfig, type UserConfig } from 'vite'
import { internalIpV4Sync } from 'internal-ip'
import * as path from 'path'
import * as fs from 'fs'
import { createHtmlPlugin } from 'vite-plugin-html'

const appVersion = (() => {
    const json = fs.readFileSync(path.resolve(__dirname) + '/package.json')
    const body = JSON.parse(json.toString()) as { version: string }
    return `v${body.version}`
})()

const [appName, appDescription] = (() => {
    const json = fs.readFileSync(path.resolve(__dirname) + '/src/public/manifest.json')
    const body = JSON.parse(json.toString()) as { name: string; description: string }
    return [body.name, body.description]
})()

const readmeAsHtml = fs
    .readFileSync(path.resolve(__dirname) + '/src/html/readme.html')
    .toString()
    .trim()

// noinspection JSUnusedGlobalSymbols
export default defineConfig(() => {
    const host = internalIpV4Sync()

    const config: UserConfig = {
        root: path.resolve(__dirname, 'src'),
        base: '',
        build: {
            outDir: '../dist',
            rollupOptions: {
                output: {
                    entryFileNames: 'assets/[name].[hash].js',
                    chunkFileNames: 'assets/[name].[hash].js',
                    assetFileNames: 'assets/[name].[hash].[ext]',
                },
            },
            // Tauri uses Chromium on Windows and WebKit on macOS and Linux
            target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
            // don't minify for debug builds
            minify: process.env.TAURI_DEBUG == null ? 'esbuild' : false,
            // produce sourcemaps for debug builds
            sourcemap: !(process.env.TAURI_DEBUG == null),
        },
        // to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
        // `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
        // env variables
        envPrefix: ['VITE_', 'TAURI_'],
        define: {
            APP_CONFIG_WAIT_SOUNDS_AND_FONTS_LOADED_TIMEOUT: 30000,
        },
        plugins: [
            createHtmlPlugin({
                minify: true,
                inject: {
                    data: {
                        title: appName,
                        description: appDescription,
                        versionNumber: appVersion,
                        readmeAsHtml,
                    },
                },
            }),
        ],
        css: {
            devSourcemap: true,
        },
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: true,
            hmr: {
                protocol: 'ws',
                host,
                port: 5183,
            },
            watch: {
                usePolling: false,
            },
        },
        // prevent vite from obscuring rust errors
        clearScreen: false,
    }

    return config
})
