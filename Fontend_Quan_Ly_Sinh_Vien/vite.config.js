import { defineConfig } from 'vite'

// React plugin removed to avoid ESM/require issue
// Fast refresh still works with standard JSX transform
export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
})
