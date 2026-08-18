import pdf from 'taepdf'

/**
 * PDF DOWNLOAD — SAFETY NOTES (read before changing)
 * --------------------------------------------------
 * The "Download PDF" feature produces a real, vector, text-selectable PDF fully
 * client-side (no backend) via `taepdf` (Rust/WASM). Three things MUST stay in
 * place or the feature silently breaks:
 *
 *   1. WASM must load. `vite.config.ts` has `optimizeDeps.exclude: ['taepdf']`
 *      and `assetsInclude` glob patterns for .wasm. Removing either makes the WASM 404 in
 *      dev and `pdf.render` throws "Cannot read properties of undefined
 *      (reading 'list_registered_fonts')". Do NOT remove them.
 *
 *   2. Fonts must exist. taepdf can only embed fonts it can fetch. The template
 *      HTML uses system font names (Helvetica/Arial/Georgia/Courier) plus Arabic
 *      glyphs. We ship metric-compatible web fonts in `public/fonts/` and map the
 *      system names to them via @font-face below. If a font file is missing,
 *      taepdf SILENTLY drops that text (renders tofu boxes, no error). The list
 *      below is the single source of truth — keep it in sync with
 *      `scripts/sync-fonts.mjs` and the files in `public/fonts/`.
 *
 *   3. Never trust the caller's filename. It is sanitized before use.
 *
 * If the vector engine fails at runtime, `htmlToPDF` throws so the caller can
 * fall back to the browser print dialog (also 100% exact, no image).
 */

export type PdfPhase =
  | 'idle'
  | 'preparing'
  | 'fonts'
  | 'engine'
  | 'rendering'
  | 'downloading'
  | 'done'
  | 'error'

export interface PdfProgress {
  phase: PdfPhase
  detail?: string
}

const FONTS_DIR = '/fonts'

const LAYOUT_CSS = `
  table { break-inside:auto; }
  tr, td, th { break-inside:avoid; }
  thead { display:table-header-group; }
  .header, .rules, .notes, .terms, .sig-area, .amount-box,
  .amount-block, .det-grid, .footer, .words, .info-row { break-inside:avoid; }
  * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
`

const FONT_FACES: ReadonlyArray<{ family: string; file: string; weight: number; style: 'normal' | 'italic' }> = [
  { family: 'Helvetica', file: 'arimo-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Helvetica', file: 'arimo-latin-700-normal.woff2', weight: 700, style: 'normal' },
  { family: 'Helvetica', file: 'arimo-latin-400-italic.woff2', weight: 400, style: 'italic' },
  { family: 'Helvetica Neue', file: 'arimo-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Helvetica Neue', file: 'arimo-latin-700-normal.woff2', weight: 700, style: 'normal' },
  { family: 'Helvetica Neue', file: 'arimo-latin-400-italic.woff2', weight: 400, style: 'italic' },
  { family: 'Arial', file: 'arimo-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Arial', file: 'arimo-latin-700-normal.woff2', weight: 700, style: 'normal' },
  { family: 'Arial', file: 'arimo-latin-400-italic.woff2', weight: 400, style: 'italic' },
  { family: 'Georgia', file: 'tinos-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Georgia', file: 'tinos-latin-700-normal.woff2', weight: 700, style: 'normal' },
  { family: 'Georgia', file: 'tinos-latin-400-italic.woff2', weight: 400, style: 'italic' },
  { family: 'Times New Roman', file: 'tinos-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Times New Roman', file: 'tinos-latin-700-normal.woff2', weight: 700, style: 'normal' },
  { family: 'Palatino Linotype', file: 'tinos-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Courier New', file: 'cousine-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Courier New', file: 'cousine-latin-700-normal.woff2', weight: 700, style: 'normal' },
  { family: 'Courier', file: 'cousine-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Courier', file: 'cousine-latin-700-normal.woff2', weight: 700, style: 'normal' },
  { family: 'Lucida Sans Typewriter', file: 'cousine-latin-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Noto Sans Arabic', file: 'noto-sans-arabic-arabic-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Noto Sans Arabic', file: 'noto-sans-arabic-arabic-700-normal.woff2', weight: 700, style: 'normal' },
]

const REQUIRED_FONT_FILES: readonly string[] = Array.from(new Set(FONT_FACES.map((f) => f.file)))

function usedFontFaces(html: string) {
  const families = new Set<string>()
  const re = /font-family\s*:\s*([^;}]+)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    for (const name of m[1].split(',')) {
      const t = name.trim().replace(/['"]/g, '')
      if (!['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'math', 'system-ui', 'initial', 'inherit', 'unset'].includes(t)) {
        families.add(t)
      }
    }
  }
  const hasArabic = /[\u0600-\u06FF]/.test(html)
  return FONT_FACES.filter(f => families.has(f.family) || (f.family === 'Noto Sans Arabic' && hasArabic))
}

export function withPdfFonts(html: string): string {
  const faces = usedFontFaces(html)
  const groups = new Map<string, { file: string; weight: number; style: string; families: string[] }>()
  for (const f of faces) {
    const key = `${f.file}|${f.weight}|${f.style}`
    const entry = groups.get(key) || { file: f.file, weight: f.weight, style: f.style, families: [] as string[] }
    if (!entry.families.includes(`'${f.family}'`)) entry.families.push(`'${f.family}'`)
    groups.set(key, entry)
  }
  const fontCss = Array.from(groups.values()).map(group => {
    const familyList = group.families.join(',')
    return `@font-face { font-family:${familyList}; src:url('${FONTS_DIR}/${group.file}') format('woff2'); font-weight:${group.weight}; font-style:${group.style}; }`
  }).join('\n')
  const css = `\n<style>\n${fontCss}\n${LAYOUT_CSS}\n</style>\n`
  const i = html.indexOf('<head>')
  return i !== -1 ? html.slice(0, i + 6) + css + html.slice(i + 6) : css + html
}

export function safePdfName(name: string | null | undefined, fallback = 'document'): string {
  const cleaned = (name ?? '')
    .normalize('NFKC')
    .replace(/[/\\]+/g, '-')
    .replace(/[<>:"|?*]+/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .slice(0, 120)
    .trim()
  return cleaned || fallback
}

let warmupPromise: Promise<void> | null = null
function ensureWarm(): Promise<void> {
  if (!warmupPromise) {
    warmupPromise = pdf.warmup().catch((e) => {
      warmupPromise = null
      throw e
    })
  }
  return warmupPromise
}

let prefetchPromise: Promise<void> | null = null
function ensurePrefetched(): Promise<void> {
  if (!prefetchPromise) {
    prefetchPromise = Promise.all(
      REQUIRED_FONT_FILES.map(f =>
        fetch(`${FONTS_DIR}/${f}`, { mode: 'no-cors' }).catch(() => {})
      )
    ).then(() => {}).catch(() => {})
  }
  return prefetchPromise
}

export function prewarmPdf(): void {
  ensureWarm().catch(() => {})
}

export async function prefetchPdfFonts(): Promise<void> {
  await ensurePrefetched()
}

export async function htmlToPDFWithProgress(
  html: string,
  filename: string,
  onProgress?: (progress: PdfProgress) => void
): Promise<void> {
  if (!html || !html.trim()) throw new Error('Cannot generate PDF from empty content.')

  onProgress?.({ phase: 'preparing', detail: 'Building document structure' })

  await new Promise((r) => setTimeout(r, 60))

  onProgress?.({ phase: 'fonts', detail: 'Loading fonts' })
  const fontHtml = withPdfFonts(html)
  const faces = usedFontFaces(html)
  const uniqueFiles = Array.from(new Set(faces.map(f => f.file)))
  await Promise.all(uniqueFiles.map(f =>
    fetch(`${FONTS_DIR}/${f}`, { mode: 'no-cors' }).catch(() => {})
  ))

  onProgress?.({ phase: 'engine', detail: 'Preparing PDF engine' })
  await ensureWarm()

  onProgress?.({ phase: 'rendering', detail: 'Rendering pages' })
  await pdf.download(fontHtml, 'A4', safePdfName(filename) + '.pdf')

  onProgress?.({ phase: 'downloading', detail: 'Starting download' })
  await new Promise((r) => setTimeout(r, 80))

  onProgress?.({ phase: 'done' })
}

export async function htmlToPDF(html: string, filename: string): Promise<void> {
  await htmlToPDFWithProgress(html, filename)
}

export function printHTML(html: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;height:1123px;border:none;overflow:hidden;'
  document.body.appendChild(iframe)
  iframe.srcdoc = withPdfFonts(html)
  iframe.onload = () => {
    iframe.contentWindow!.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }
}

export function downloadText(html: string, filename: string): void {
  const div = document.createElement('div')
  div.innerHTML = html
  const cleaned = (div.textContent || '').replace(/\s+/g, ' ').trim()
  const blob = new Blob([cleaned], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = safePdfName(filename) + '.txt'
  a.click(); URL.revokeObjectURL(url)
}
