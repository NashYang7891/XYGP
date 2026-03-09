import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api.php': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/admin_api.php': { target: 'http://127.0.0.1:8080', changeOrigin: true },
    }
  }
})
