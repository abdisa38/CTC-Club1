import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }

          if (id.includes('react-router')) {
            return 'vendor-router';
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          if (id.includes('framer-motion') || id.includes('/motion/')) {
            return 'vendor-motion';
          }

          if (
            id.includes('recharts') ||
            id.includes('/d3-') ||
            id.includes('victory-vendor') ||
            id.includes('/lodash/')
          ) {
            return 'vendor-charts';
          }

          if (id.includes('axios')) {
            return 'vendor-network';
          }

          if (
            id.includes('@radix-ui') ||
            id.includes('sonner') ||
            id.includes('class-variance-authority') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge')
          ) {
            return 'vendor-ui';
          }

          return;
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
