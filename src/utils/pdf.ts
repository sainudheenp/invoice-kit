import pdf from 'taepdf'

const PDF_FONT_FACES = `
<style>
@font-face { font-family:'Helvetica'; src:url('/fonts/arimo-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Helvetica'; src:url('/fonts/arimo-latin-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
@font-face { font-family:'Helvetica'; src:url('/fonts/arimo-latin-400-italic.woff2') format('woff2'); font-weight:400; font-style:italic; }
@font-face { font-family:'Helvetica Neue'; src:url('/fonts/arimo-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Helvetica Neue'; src:url('/fonts/arimo-latin-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
@font-face { font-family:'Helvetica Neue'; src:url('/fonts/arimo-latin-400-italic.woff2') format('woff2'); font-weight:400; font-style:italic; }
@font-face { font-family:'Arial'; src:url('/fonts/arimo-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Arial'; src:url('/fonts/arimo-latin-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
@font-face { font-family:'Arial'; src:url('/fonts/arimo-latin-400-italic.woff2') format('woff2'); font-weight:400; font-style:italic; }
@font-face { font-family:'Georgia'; src:url('/fonts/tinos-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Georgia'; src:url('/fonts/tinos-latin-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
@font-face { font-family:'Georgia'; src:url('/fonts/tinos-latin-400-italic.woff2') format('woff2'); font-weight:400; font-style:italic; }
@font-face { font-family:'Times New Roman'; src:url('/fonts/tinos-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Times New Roman'; src:url('/fonts/tinos-latin-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
@font-face { font-family:'Palatino Linotype'; src:url('/fonts/tinos-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Courier New'; src:url('/fonts/cousine-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Courier New'; src:url('/fonts/cousine-latin-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
@font-face { font-family:'Courier'; src:url('/fonts/cousine-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Courier'; src:url('/fonts/cousine-latin-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
@font-face { font-family:'Lucida Sans Typewriter'; src:url('/fonts/cousine-latin-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Noto Sans Arabic'; src:url('/fonts/noto-sans-arabic-arabic-400-normal.woff2') format('woff2'); font-weight:400; font-style:normal; }
@font-face { font-family:'Noto Sans Arabic'; src:url('/fonts/noto-sans-arabic-arabic-700-normal.woff2') format('woff2'); font-weight:700; font-style:normal; }
</style>
`

function withPdfFonts(html: string): string {
  const i = html.indexOf('<head>')
  if (i !== -1) return html.slice(0, i + 6) + PDF_FONT_FACES + html.slice(i + 6)
  return PDF_FONT_FACES + html
}

export async function htmlToPDF(html: string, filename: string): Promise<void> {
  await pdf.warmup()
  await pdf.download(withPdfFonts(html), 'A4', filename + '.pdf')
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
  const a = document.createElement('a'); a.href = url; a.download = filename + '.txt'
  a.click(); URL.revokeObjectURL(url)
}
