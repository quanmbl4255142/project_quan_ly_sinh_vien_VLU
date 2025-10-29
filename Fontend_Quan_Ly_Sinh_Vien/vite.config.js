import { defineConfig } from 'vite'

// React plugin removed to avoid ESM/require issue
// Fast refresh still works with standard JSX transform
export default defineConfig({
  server: {
    port: 5173
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
