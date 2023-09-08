import { fileURLToPath, URL } from 'url';

import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

import { execSync } from 'child_process';

const commitHash = execSync('git describe --always').toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    visualizer() as PluginOption,
    VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      injectRegister: null,
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{html,js,css,woff2,ico,svg,png,jpeg}  '],
        maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
      },
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    minify: false,
    sourcemap: true,
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  }
})
