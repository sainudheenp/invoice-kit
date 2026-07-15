import pdfMake from 'pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import htmlToPdfmake from 'html-to-pdfmake'

;(pdfMake as any).addVirtualFileSystem(pdfFonts)

export function watermarkHTML(html: string, text: string): string {
  if (!text) return html
  const style = `position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;z-index:9999;`
  const wm = `<div style="${style}"><div style="font-size:48px;color:rgba(0,0,0,0.06);transform:rotate(-30deg);font-weight:bold;white-space:pre-wrap;text-align:center;user-select:none;">${text}</div></div>`
  return html + wm
}

function htmlToDocDef(html: string) {
  const container = document.createElement('div')
  container.innerHTML = html
  const content = htmlToPdfmake(html, window) as any
  return {
    content: content.content || content,
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    pageMargins: [40, 40, 40, 40] as [number, number, number, number],
  }
}

export async function htmlToPDF(html: string, filename: string): Promise<void> {
  const docDef = htmlToDocDef(html)
  ;(pdfMake as any).createPdf(docDef).download(filename + '.pdf')
}

export async function htmlToPDFBlob(html: string): Promise<Blob> {
  const docDef = htmlToDocDef(html)
  return new Promise((resolve) => {
    const pdf = (pdfMake as any).createPdf(docDef)
    pdf.getBlob((blob: Blob) => resolve(blob))
  })
}
