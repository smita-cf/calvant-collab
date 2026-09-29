import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],

  esbuild: {
    include: /src\/.*\.[jt]sx?$/,  // ← allows JSX in .js files
    exclude: [],
  },

  define: {
    'process.env': {}
  },

  server: {
    port: 3000,
    open: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 3000
  }
})