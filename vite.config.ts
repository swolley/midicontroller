import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    optimizeDeps: {
        // vue-dndrop must not be pre-bundled: its Vue 3 build uses top-level `h` from 'vue';
        // pre-bundling rewrites it to Vue 2-style render(createElement), which breaks in Vue 3.
        exclude: ["vue-dndrop"],
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    base: "/",
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name]-ts${Date.now()}.js`,
                chunkFileNames: `assets/[name]-ts${Date.now()}.js`,
                assetFileNames: `assets/[name]-ts${Date.now()}.[ext]`,
            },
        },
        sourcemap: process.env.NODE_ENV !== "production",
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
});
