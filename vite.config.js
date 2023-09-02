import {defineConfig} from "vite";

const path = require('path')

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    root: path.resolve(__dirname, 'src'),
    build: {
        outDir: '../dist',
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        }
    },
    css: {
        devSourcemap: true,
    },
    server: {
        port: 8080,
        watch: {
            usePolling: false,
        }
    }
})
