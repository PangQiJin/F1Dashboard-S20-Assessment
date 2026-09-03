import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],

  // GitHub Pages hosts this project under /F1Dashboard/.
  // This ensures generated CSS, JavaScript and asset paths
  // point to the correct location after deployment.
  base: '/F1Dashboard/',
})