import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import { execSync } from 'child_process'

let commitCount = '00'
try {
  commitCount = execSync('git rev-list --count HEAD').toString().trim()
} catch (e) {
}
process.env.VITE_APP_VERSION = '1.' + String(commitCount).padStart(2, '0')

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({ include: ['buffer', 'stream', 'zlib', 'util'] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // --- PDF ENGINE (taepdf) SAFETY: do not remove ---------------------------
  // taepdf loads its Rust/WASM binary via `new URL('taetype_bg.wasm',
  // import.meta.url)`. If Vite pre-bundles taepdf, that URL breaks and the WASM
  // 404s, so `pdf.render` throws "Cannot read properties of undefined (reading
  // 'list_registered_fonts')" and Download PDF silently fails.
  //   - optimizeDeps.exclude: keep taepdf out of the dep optimizer (dev).
  //   - assetsInclude: let Vite emit the .wasm as an asset (build).
  // See src/utils/pdf.ts for the full rationale.
  optimizeDeps: {
    exclude: ['taepdf'],
  },
  assetsInclude: ['**/*.wasm'],
})
