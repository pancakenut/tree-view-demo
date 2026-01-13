import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    AutoImport({
      imports: [
        'react',
        "react-router-dom",
        {
          'valtio': ['useSnapshot', 'proxy', 'snapshot', 'subscribe']
        }
      ],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
  },
  server: {
    proxy: {
      '/dify-api': {
        target: 'http://172.18.83.142:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dify-api/, '/v1'),
      },
    },
  },
})
