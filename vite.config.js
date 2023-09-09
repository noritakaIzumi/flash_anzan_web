import {defineConfig} from "vite";
import * as path from "path";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
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
