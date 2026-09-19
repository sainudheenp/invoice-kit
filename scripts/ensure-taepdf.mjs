#!/usr/bin/env node
/**
 * Ensure the vendored taepdf engine (file:./vendor/taepdf) is present.
 *
 * The engine ships as a `file:` dependency; its `dist/` is a build artifact that
 * can go missing (fresh restore that drops build dirs, cache cleanup, …). When
 * that happens `npm run build` / `npm run dev` would fail with
 * "Failed to resolve import taepdf". This script self-heals:
 *
 *   1. dist present            → done
 *   2. committed tarball found → extract it (offline, no rebuild needed)
 *   3. engine source present   → npm install + node scripts/build.mjs
 *   4. otherwise               → clear error
 *
 * Run automatically via `predev` and inside `npm run build`.
 */

import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const vendor = path.join(root, 'vendor', 'taepdf')
const distIndex = path.join(vendor, 'dist', 'index.js')
const tgz = path.join(root, 'vendor', 'taepdf-2.4.3.tgz')
const buildScript = path.join(vendor, 'scripts', 'build.mjs')

function fail(msg) {
  console.error(`[taepdf] ${msg}`)
  process.exit(1)
}

if (existsSync(distIndex)) {
  console.log('[taepdf] OK — vendor/taepdf/dist present.')
  process.exit(0)
}

console.log('[taepdf] vendor/taepdf/dist missing — restoring …')
mkdirSync(vendor, { recursive: true })

// 2) Extract the committed tarball (layout: package/* → vendor/taepdf/*)
if (existsSync(tgz)) {
  execFileSync('tar', ['-xzf', tgz, '-C', vendor], { stdio: 'inherit' })
  const pkgDir = path.join(vendor, 'package')
  if (existsSync(pkgDir)) {
    for (const name of readdirSync(pkgDir)) {
      renameSync(path.join(pkgDir, name), path.join(vendor, name))
    }
    rmSync(pkgDir, { recursive: true, force: true })
  }
  if (existsSync(distIndex)) {
    console.log('[taepdf] OK — restored from vendor/taepdf-2.4.3.tgz.')
    process.exit(0)
  }
  console.warn('[taepdf] tarball extracted but dist/index.js still missing — falling back to source build.')
}

// 3) Build from the engine source (needs network for esbuild/typescript)
if (existsSync(buildScript)) {
  console.log('[taepdf] building engine from vendor/taepdf source …')
  try {
    execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: vendor, stdio: 'inherit' })
    execFileSync('node', ['scripts/build.mjs'], { cwd: vendor, stdio: 'inherit' })
  } catch (e) {
    fail(`source build failed. Fix manually: cd vendor/taepdf && npm install && node scripts/build.mjs (${e.message})`)
  }
  if (existsSync(distIndex)) {
    console.log('[taepdf] OK — engine rebuilt from source.')
    process.exit(0)
  }
}

fail('could not restore vendor/taepdf. Re-clone the repo or re-run: cd vendor/taepdf && npm install && node scripts/build.mjs')
