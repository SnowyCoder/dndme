import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from "rollup-plugin-visualizer";

import { execSync } from 'child_process'

const commitHash = execSync('git describe --always').toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    visualizer(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    sourcemap: true,
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    'global.crypto': "window.crypto",
  },
})
