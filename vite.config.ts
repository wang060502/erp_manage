import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  base: '/admin/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 目标 API 服务器地址
        changeOrigin: true, // 是否改变源
        rewrite: (path) => path.replace(/^\/api/, ''), // 路径重写
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.accept && req.headers.accept.includes('html')) {
              console.log('Skipping proxy for browser request.')
              res.writeHead(302, { Location: '/admin/index.html' })
              res.end()
            }
          })
        },
      },
    },
  },
})
