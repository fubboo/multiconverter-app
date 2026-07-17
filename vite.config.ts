import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Vite's default target (baseline ≈ Safari 16) leaves older iPhones (iOS 13–15)
    // with a blank screen. Downlevel syntax so the app runs on iOS 13+.
    target: ['es2019', 'safari13', 'chrome80', 'firefox78', 'edge88'],
    rollupOptions: {
      output: {
        // Split heavy deps into cacheable vendor chunks so the first paint
        // ships less JS (Core Web Vitals / SEO).
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
