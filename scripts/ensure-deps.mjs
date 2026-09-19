#!/usr/bin/env node
/**
 * Ensure the root node_modules is present and complete.
 *
 * Some environments (CI sandboxes, snapshot restores) periodically drop
 * node_modules. When that happens `npm run dev`/`npm run build` fail with
 * "vite: not found" / "tsc: not found". This script self-heals by running
 * `npm ci` (deterministic, uses package-lock.json) whenever the toolchain
 * is missing.
 *
 * Wired into `predev` and `build` — no manual step needed.
 */

import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const probe = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite')
const tsProbe = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')

const missing = []
if (!existsSync(probe)) missing.push('vite')
if (!existsSync(tsProbe)) missing.push('typescript')
if (missing.length === 0) process.exit(0)

console.log(`[deps] node_modules incomplete (missing: ${missing.join(', ')}) — running npm ci …`)
try {
  execFileSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: root, stdio: 'inherit' })
} catch (e) {
  console.error(`[deps] npm ci failed, falling back to npm install: ${e.message}`)
  execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: root, stdio: 'inherit' })
}

if (!existsSync(probe)) {
  console.error('[deps] ERROR: vite still missing after install. Delete node_modules and run npm ci manually.')
  process.exit(1)
}
console.log('[deps] OK — node_modules restored.')
