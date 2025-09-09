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
          
          copyFileSync(
             join(__dirname, 'public', 'farcaster-eth-provider-fix.js'),
             join(__dirname, 'dist', 'farcaster-eth-provider-fix.js')
           )
           console.log('✅ farcaster-eth-provider-fix.js copied to dist')
           
           copyFileSync(
             join(__dirname, 'public', 'farcaster-sdk-fallback.js'),
             join(__dirname, 'dist', 'farcaster-sdk-fallback.js')
           )
           console.log('✅ farcaster-sdk-fallback.js copied to dist')
        } catch (error) {
          console.error('❌ Failed to copy files:', error)
        }
      }
    }
  ],
  publicDir: 'public',
  server: {
    host: true, // Allow external connections
    port: 5173,
    hmr: {
      overlay: false // Remove HMR warnings from overlay
    }
  }
})
