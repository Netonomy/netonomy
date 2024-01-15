import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import million from "million/compiler";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    million.vite({ auto: true, mute: true }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "netonomy",
        short_name: "netonomy",
        description: "Connect, Create, Collaborate",
        theme_color: "#000",
        icons: [
          {
            src: "icons/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // build: {
  //   target: "es2022",
  // },
  // esbuild: {
  //   target: "es2022",
  // },
  // optimizeDeps: {
  //   esbuildOptions: {
  //     target: "es2022",
  //   },
  // },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    host: true,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
      usePolling: true,
    },
  },
}));
