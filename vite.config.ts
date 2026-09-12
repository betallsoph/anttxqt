import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the libraries that never change from the app code that does, so
        // a deploy doesn't force every visitor to re-download React and Firebase,
        // and the browser can fetch these in parallel.
        //
        // @firebase/auth is deliberately NOT listed: leaving it unassigned lets
        // it land in the lazily-loaded admin chunk instead of the first load.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
            return "react";
          }
          if (/node_modules\/@firebase\/(app|firestore|component|logger|util|webchannel-wrapper)\//.test(id)) {
            return "firebase";
          }
          if (/node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//.test(id)) {
            return "motion";
          }
        },
      },
    },
  },
})
