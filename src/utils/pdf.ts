import pdf from 'taepdf'

/**
 * PDF DOWNLOAD — SAFETY NOTES (read before changing)
 * --------------------------------------------------
 * The "Download PDF" feature produces a real, vector, text-selectable PDF fully
 * client-side (no backend) via `taepdf` (Rust/WASM). Three things MUST stay in
 * place or the feature silently breaks:
 *
 *   1. WASM must load. `vite.config.ts` has `optimizeDeps.exclude: ['taepdf']`
 *      and `assetsInclude: ['**\/*.wasm']`. Removing either makes the WASM 404 in
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

const FONTS_DIR = '/fonts'

// Single source of truth for embedded fonts. Each entry maps a font-family name
// used inside the templates to the woff2 file that provides its glyphs.
// Keep in sync with public/fonts/ and scripts/sync-fonts.mjs.
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
  // Arabic fallback (currency symbols like ع.ع and Arabic text). taepdf falls
  // back to any registered font for glyphs the primary font lacks.
  { family: 'Noto Sans Arabic', file: 'noto-sans-arabic-arabic-400-normal.woff2', weight: 400, style: 'normal' },
  { family: 'Noto Sans Arabic', file: 'noto-sans-arabic-arabic-700-normal.woff2', weight: 700, style: 'normal' },
]

// The unique set of font files that must exist in public/fonts/.
export const REQUIRED_FONT_FILES: readonly string[] = Array.from(new Set(FONT_FACES.map((f) => f.file)))

const PDF_FONT_FACES = `\n<style>\n${FONT_FACES.map(
  (f) => `@font-face { font-family:'${f.family}'; src:url('${FONTS_DIR}/${f.file}') format('woff2'); font-weight:${f.weight}; font-style:${f.style}; }`,
).join('\n')}\n</style>\n`

function withPdfFonts(html: string): string {
  const i = html.indexOf('<head>')
  if (i !== -1) return html.slice(0, i + 6) + PDF_FONT_FACES + html.slice(i + 6)
  return PDF_FONT_FACES + html
}

/**
 * Make a safe download filename. Strips path separators and characters that are
 * illegal or awkward in filenames, collapses whitespace, and bounds the length.
 * Always returns a non-empty base name (no extension).
 */
export function safePdfName(name: string | null | undefined, fallback = 'document'): string {
  const cleaned = (name ?? '')
    .normalize('NFKC')
    .replace(/[/\\]+/g, '-')
    .replace(/[<>:"|?*]+/g, '')
    .replace(/\p{Cc}+/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .slice(0, 120)
    .trim()
  return cleaned || fallback
}

// Warm up the WASM engine once and reuse the same promise.
let warmupPromise: Promise<void> | null = null
function ensureWarm(): Promise<void> {
  if (!warmupPromise) {
    warmupPromise = pdf.warmup().catch((e) => {
      // Reset so a later attempt can retry a transient failure.
      warmupPromise = null
      throw e
    })
  }
  return warmupPromise
}

/**
 * Generate and download a vector PDF from template HTML.
 * Throws if the engine fails so the caller can fall back to print.
 */
export async function htmlToPDF(html: string, filename: string): Promise<void> {
  if (!html || !html.trim()) throw new Error('Cannot generate PDF from empty content.')
  await ensureWarm()
  await pdf.download(withPdfFonts(html), 'A4', safePdfName(filename) + '.pdf')
}

export function printHTML(html: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;height:1123px;border:none;overflow:hidden;'
  document.body.appendChild(iframe)
  iframe.srcdoc = html
  iframe.onload = () => {
    const doc = iframe.contentDocument
    if (doc) {
      const style = doc.createElement('style')
      style.textContent = `
        html, body { margin:0; background:#fff; }
        @media print {
          @page { margin:0; size:A4; }
          table { break-inside:auto; }
          tr { break-inside:avoid; }
          thead { display:table-header-group; }
          .header, .rules, .notes, .terms, .sig-area, .amount-box,
          .amount-block, .det-grid, .footer, .words, .info-row { break-inside:avoid; }
        }
      `
      doc.head.appendChild(style)
    }
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
