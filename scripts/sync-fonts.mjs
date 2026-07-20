#!/usr/bin/env node
/**
 * Sync / verify the PDF fonts in public/fonts/.
 *
 * The "Download PDF" feature (src/utils/pdf.ts) embeds these woff2 files into the
 * generated PDF. If any file is missing, taepdf SILENTLY renders tofu boxes.
 * This script is the reproducible source of those files.
 *
 *   node scripts/sync-fonts.mjs           -> copy fonts from @fontsource -> public/fonts
 *   node scripts/sync-fonts.mjs --check   -> verify all required fonts exist (CI); exit 1 if not
 *
 * The REQUIRED list below MUST match FONT_FACES in src/utils/pdf.ts.
 */
import { existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'fonts')

// file name in public/fonts  ->  @fontsource package + source file
const REQUIRED = [
  { file: 'arimo-latin-400-normal.woff2', pkg: '@fontsource/arimo' },
  { file: 'arimo-latin-700-normal.woff2', pkg: '@fontsource/arimo' },
  { file: 'arimo-latin-400-italic.woff2', pkg: '@fontsource/arimo' },
  { file: 'tinos-latin-400-normal.woff2', pkg: '@fontsource/tinos' },
  { file: 'tinos-latin-700-normal.woff2', pkg: '@fontsource/tinos' },
  { file: 'tinos-latin-400-italic.woff2', pkg: '@fontsource/tinos' },
  { file: 'cousine-latin-400-normal.woff2', pkg: '@fontsource/cousine' },
  { file: 'cousine-latin-700-normal.woff2', pkg: '@fontsource/cousine' },
  { file: 'noto-sans-arabic-arabic-400-normal.woff2', pkg: '@fontsource/noto-sans-arabic' },
  { file: 'noto-sans-arabic-arabic-700-normal.woff2', pkg: '@fontsource/noto-sans-arabic' },
]

const check = process.argv.includes('--check')

if (check) {
  const missing = REQUIRED.filter(({ file }) => {
    const p = join(outDir, file)
    return !existsSync(p) || statSync(p).size === 0
  })
  if (missing.length) {
    console.error('[sync-fonts] MISSING/empty PDF font files in public/fonts/:')
    for (const m of missing) console.error('  - ' + m.file)
    console.error('Run: node scripts/sync-fonts.mjs')
    process.exit(1)
  }
  console.log(`[sync-fonts] OK — all ${REQUIRED.length} PDF font files present.`)
  process.exit(0)
}

mkdirSync(outDir, { recursive: true })
let copied = 0
for (const { file, pkg } of REQUIRED) {
  const src = join(root, 'node_modules', pkg, 'files', file)
  if (!existsSync(src)) {
    console.error(`[sync-fonts] source not found: ${src}`)
    console.error(`Install it first: npm install -D ${pkg}`)
    process.exit(1)
  }
  copyFileSync(src, join(outDir, file))
  copied++
}
console.log(`[sync-fonts] Copied ${copied} font files to public/fonts/`)
