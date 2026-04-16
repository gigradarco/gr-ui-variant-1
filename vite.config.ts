import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const backend = 'http://127.0.0.1:8787'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/trpc': backend,
      '/api/geocode': backend,
      '/api/auth': backend,
      '/api/profile': backend,
      '/health': backend,
    },
  },
})
