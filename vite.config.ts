import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'esaLoader',
      fileName: 'esa-loader',
    },
    rollupOptions: {
      external: ['astro', '@astrojs/markdown-remark'],
    }
  },
})
