import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { execSync } from 'child_process'

let commitCount = '00'
try {
  commitCount = execSync('git rev-list --count HEAD').toString().trim()
} catch (e) {
  // Fallback if git is not initialized or not found in env
}
process.env.VITE_APP_VERSION = '1.' + String(commitCount).padStart(2, '0')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
