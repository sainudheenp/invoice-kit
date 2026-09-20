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
  const fontCss = faces.map(f => `@font-face { font-family:'${f.family}'; src:url('${FONTS_DIR}/${f.file}') format('woff2'); font-weight:${f.weight}; font-style:${f.style}; }`).join('\n')
  const css = `\n<style>\n${fontCss}\n${LAYOUT_CSS}\n</style>\n`
  const i = html.indexOf('<head>')
  return i !== -1 ? html.slice(0, i + 6) + css + html.slice(i + 6) : css + html
}

interface PagedDocument {
  html: string
  printHtml: string
  header?: string
  footer?: string
}

function cssRuleValue(css: string, selector: string, property: string, fallback: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`[^{}]*${escapedSelector}\\b[^{}]*\\{([^{}]*)\\}`, 'gi')
  let match: RegExpExecArray | null
  while ((match = re.exec(css)) !== null) {
    const value = match[1].match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'i'))
    if (value) return value[1].trim()
  }
  return fallback
}

function cssBoxPadding(css: string): { top: string; right: string; bottom: string; left: string } {
  const shorthand = cssRuleValue(css, 'body', 'padding', '0px').split(/\s+/).filter(Boolean)
  const values = shorthand.length === 1
    ? [shorthand[0], shorthand[0], shorthand[0], shorthand[0]]
    : shorthand.length === 2
      ? [shorthand[0], shorthand[1], shorthand[0], shorthand[1]]
      : shorthand.length === 3
        ? [shorthand[0], shorthand[1], shorthand[2], shorthand[1]]
        : [shorthand[0] || '0px', shorthand[1] || '0px', shorthand[2] || '0px', shorthand[3] || '0px']
  return { top: values[0], right: values[1], bottom: values[2], left: values[3] }
}

function chromeDocument(styles: string, fragment: string, overrides: string): string {
  return `<!DOCTYPE html><html><head>${styles}<style>${overrides}</style></head><body>${fragment}</body></html>`
}

/**
 * Move the document header/footer into taepdf's page chrome bands. Normal-flow
 * headers only render on page one and fixed footers can cover the last table
 * rows, so keeping them in the main content flow causes both pagination bugs.
 */
export function preparePagedDocument(html: string): PagedDocument {
  if (typeof DOMParser === 'undefined') return { html, printHtml: html }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const bodyChildren = Array.from(doc.body.children)
  const headerElement = bodyChildren.find((el) => el.classList.contains('header'))
  const headerNodes = headerElement
    ? bodyChildren.filter((el) => el === headerElement || el.classList.contains('top-border') || el.classList.contains('top-db'))
    : bodyChildren.filter((el) => el.classList.contains('top-black') || el.classList.contains('brand-area'))
  const footerElement = bodyChildren.find((el) => el.classList.contains('footer'))

  if (!headerNodes.length && !footerElement) return { html, printHtml: html }

  const styles = Array.from(doc.head.querySelectorAll('style')).map((style) => style.outerHTML).join('\n')
  const headerFragment = headerNodes.map((el) => el.outerHTML).join('\n')
  const footerFragment = footerElement?.outerHTML || ''
  const footerLeft = cssRuleValue(styles, '.footer', 'left', '0px')
  const footerRight = cssRuleValue(styles, '.footer', 'right', '0px')
  const bodyPadding = cssBoxPadding(styles)

  for (const el of headerNodes) el.remove()
  footerElement?.remove()

  // The extracted header and footer now occupy dedicated page bands. Keep the
  // template's horizontal padding, but don't apply its old top/bottom padding
  // a second time inside the content area.
  const contentStyle = doc.createElement('style')
  contentStyle.textContent = `
    body { padding-top:0 !important; padding-bottom:0 !important; }
    body > .border-frame, body > .vintage-border, body > .vintage-border-inner, body > .sidebar { display:none !important; }
  `
  doc.head.appendChild(contentStyle)

  const header = headerFragment
    ? chromeDocument(styles, headerFragment, 'body { padding-bottom:0 !important; }')
    : undefined
  const footer = footerFragment
    ? chromeDocument(
      styles,
      footerFragment,
      `
        body { padding:0 !important; }
        .footer {
          position:static !important;
          top:auto !important;
          right:auto !important;
          bottom:auto !important;
          left:auto !important;
          width:auto !important;
          margin-left:${footerLeft} !important;
          margin-right:${footerRight} !important;
        }
      `,
    )
    : undefined

  const mainHtml = '<!DOCTYPE html>' + doc.documentElement.outerHTML
  const printStyle = doc.createElement('style')
  printStyle.textContent = `
    [data-pdf-print-header] {
      position:fixed !important;
      top:0 !important;
      left:0 !important;
      right:0 !important;
      z-index:1000 !important;
    }
    [data-pdf-print-footer] {
      position:fixed !important;
      bottom:0 !important;
      left:0 !important;
      right:0 !important;
      z-index:1000 !important;
    }
    [data-pdf-print-footer] .footer {
      position:static !important;
      top:auto !important;
      right:auto !important;
      bottom:auto !important;
      left:auto !important;
      width:auto !important;
      margin-left:${footerLeft} !important;
      margin-right:${footerRight} !important;
    }
  `
  doc.head.appendChild(printStyle)
  if (headerFragment) {
    const headerWrapper = doc.createElement('div')
    headerWrapper.setAttribute('data-pdf-print-header', '')
    headerWrapper.style.paddingTop = bodyPadding.top
    headerWrapper.style.paddingLeft = bodyPadding.left
    headerWrapper.style.paddingRight = bodyPadding.right
    headerWrapper.innerHTML = headerFragment
    doc.body.prepend(headerWrapper)
  }
  if (footerFragment) {
    const footerWrapper = doc.createElement('div')
    footerWrapper.setAttribute('data-pdf-print-footer', '')
    footerWrapper.innerHTML = footerFragment
    doc.body.appendChild(footerWrapper)
  }

  return {
    html: mainHtml,
    printHtml: '<!DOCTYPE html>' + doc.documentElement.outerHTML,
    header,
    footer,
  }
}

export function safePdfName(name: string | null | undefined, fallback = 'document'): string {
  const cleaned = (name ?? '')
    .normalize('NFKC')
    .replace(/[/\\]+/g, '-')
    .replace(/[<>:"|?*]+/g, '')
    // eslint-disable-next-line no-control-regex -- intentional sanitization of control chars in filenames
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
        fetch(`${FONTS_DIR}/${f}`).catch(() => {})
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
    fetch(`${FONTS_DIR}/${f}`).catch(() => {})
  ))

  onProgress?.({ phase: 'engine', detail: 'Preparing PDF engine' })
  await ensureWarm()

  onProgress?.({ phase: 'rendering', detail: 'Rendering pages' })
  const paged = preparePagedDocument(fontHtml)
  await pdf.download(
    paged.html,
    'A4',
    safePdfName(filename) + '.pdf',
    undefined,
    {
      header: paged.header ? () => paged.header || '' : undefined,
      footer: paged.footer ? () => paged.footer || '' : undefined,
    },
  )

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
  const paged = preparePagedDocument(withPdfFonts(html))
  iframe.srcdoc = paged.printHtml
  iframe.onload = () => {
    const printDoc = iframe.contentDocument
    const printHeader = printDoc?.querySelector<HTMLElement>('[data-pdf-print-header]')
    const printFooter = printDoc?.querySelector<HTMLElement>('[data-pdf-print-footer]')
    if (printDoc?.body) {
      // Reserve exactly the measured fixed bands so long tables never run
      // underneath the repeated header or footer in the browser print path.
      if (printHeader) printDoc.body.style.setProperty('padding-top', `${printHeader.getBoundingClientRect().height}px`, 'important')
      if (printFooter) printDoc.body.style.setProperty('padding-bottom', `${printFooter.getBoundingClientRect().height}px`, 'important')
    }
    try {
      iframe.contentWindow?.print()
    } catch {}
    setTimeout(() => {
      try { document.body.removeChild(iframe) } catch {}
    }, 1000)
  }
  // Fallback cleanup if onload never fires
  setTimeout(() => {
    if (iframe.parentNode) {
      try { document.body.removeChild(iframe) } catch {}
    }
  }, 5000)
}

export function downloadText(html: string, filename: string): void {
  const div = document.createElement('div')
  div.innerHTML = html
  const cleaned = (div.textContent || '').replace(/\s+/g, ' ').trim()
  const blob = new Blob([cleaned], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = safePdfName(filename) + '.txt'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
    try { a.remove() } catch {}
  }, 100)
}
