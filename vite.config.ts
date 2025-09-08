import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-farcaster-sdk',
      writeBundle() {
        try {
          copyFileSync(
            join(__dirname, 'public', 'farcaster-sdk.js'),
            join(__dirname, 'dist', 'farcaster-sdk.js')
          )
          console.log('✅ farcaster-sdk.js copied to dist')
        } catch (error) {
          console.error('❌ Failed to copy farcaster-sdk.js:', error)
        }
      }
    }
  ],
  publicDir: 'public',
  server: {
    host: true, // Allow external connections
    port: 5173,
    allowedHosts: [
      '1181e984e5cc.ngrok-free.app',
      'e3383d339754.ngrok-free.app',
      'f27afbb38011.ngrok-free.app',
      'localhost',
      '.ngrok-free.app' // Allow all ngrok subdomains
    ],
    hmr: {
      overlay: false // Remove HMR warnings from overlay
    },
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  }
})
