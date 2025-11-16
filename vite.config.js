import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Fix for proper routing in production
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['date-fns', 'clsx']
        }
      }
    }
  },

  // Development server configuration
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
    allowedHosts: true,
  },

  // Preview server configuration
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
    host: '0.0.0.0',
    strictPort: false,
  },

  // Resolve configuration for better imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },

  // CSS configuration - move Tailwind to separate file
  css: {
    devSourcemap: true
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'chart.js',
      'react-chartjs-2',
      'date-fns',
      'lucide-react'
    ]
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})