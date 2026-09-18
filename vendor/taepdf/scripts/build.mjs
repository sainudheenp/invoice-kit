import { build } from 'esbuild'
import { execFileSync } from 'node:child_process'
import { chmodSync, cpSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')

rmSync(DIST, { recursive: true, force: true })
mkdirSync(DIST, { recursive: true })

const entryPoints = [
  path.join(ROOT, 'engine.ts'),
  path.join(ROOT, 'index.ts'),
  ...globSync(path.join(ROOT, 'renderer/**/*.ts')),
]
// bundle: true would normally inline the whole relative import graph into
// every entry point — externalizeRelative opts every "./"/"../" import back
// out of that, so only bare (npm) specifiers like 'fflate' actually get
// inlined. Without this, a runtime dependency's bare specifier survives
// unbundled into dist/, and a consumer loading these files directly as
// <script type="module"> (no bundler of their own) gets a browser module
// resolution error — bare specifiers aren't resolvable without one.
const externalizeRelative = {
  name: 'externalize-relative',
  setup(b) {
    b.onResolve({ filter: /^\.\.?\// }, args => ({ path: args.path, external: true }))
  },
}
await build({
  entryPoints,
  outdir:  DIST,
  outbase: ROOT,
  format:  'esm',
  target:  'es2022',
  bundle:  true,
  plugins: [externalizeRelative],
})

// cli/init.ts is a Node-only script (fs/path, no DOM/WASM) — built separately
// so `platform: 'node'` never applies to the browser-facing entry points above.
await build({
  entryPoints: [path.join(ROOT, 'cli/init.ts')],
  outdir:   DIST,
  outbase:  ROOT,
  format:   'esm',
  target:   'es2022',
  platform: 'node',
})

// esbuild preserves cli/init.ts's own leading #!/usr/bin/env node shebang
// verbatim, but not the executable bit — npx/a global bin symlink refuses
// to run the file without it.
chmodSync(path.join(DIST, 'cli/init.js'), 0o755)

// esbuild transpiles per-file and leaves any JSON import bare; Node requires
// the explicit import attribute for JSON modules (see build_pdfa.ts's own
// package.json import).
for (const file of globSync(path.join(DIST, 'renderer/**/*.js'))) {
  const src = readFileSync(file, 'utf8')
  const patched = src.replace(
    /from "([^"]*tae-engine\/pkg\/package\.json)";/g,
    'from "$1" with { type: "json" };',
  )
  if (patched !== src) writeFileSync(file, patched)
}

// tae-engine/pkg/.gitignore (wasm-pack's own "ignore everything in here by
// default" marker, overridden in THIS repo via a deliberate `git add -f`) must
// not be copied along with it — npm's packer honors a nested .gitignore even
// under an explicit "files" allow-list, which silently drops the entire wasm
// engine from the published tarball if this file rides along.
cpSync(path.join(ROOT, 'tae-engine/pkg'), path.join(DIST, 'tae-engine/pkg'), {
  recursive: true,
  filter: src => path.basename(src) !== '.gitignore',
})

execFileSync('npx', ['tsc', '-p', 'tsconfig.build.json'], { cwd: ROOT, stdio: 'inherit' })

console.log('build complete -> dist/')
