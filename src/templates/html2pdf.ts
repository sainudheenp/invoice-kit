import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const A4_W = 794
const A4_H = 1123

export function watermarkHTML(html: string, text: string): string {
  if (!text) return html
  const style = `position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;z-index:9999;`
  const wm = `<div style="${style}"><div style="font-size:48px;color:rgba(0,0,0,0.06);transform:rotate(-30deg);font-weight:bold;white-space:pre-wrap;text-align:center;user-select:none;">${text}</div></div>`
  return html + wm
}

export async function htmlToPDF(html: string, filename: string): Promise<void> {
  const pageEl = document.createElement('div')
  pageEl.style.cssText = `position:fixed;top:-9999px;left:0;width:${A4_W}px;background:#fff;`
  pageEl.innerHTML = html
  document.body.appendChild(pageEl)
  await waitForImages(pageEl)
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = 210; const pdfH = 297
    const totalH = pageEl.scrollHeight
    const pageCount = Math.max(1, Math.ceil(totalH / A4_H))
    for (let i = 0; i < pageCount; i++) {
      pageEl.style.marginTop = `${-i * A4_H}px`
      const canvas = await html2canvas(pageEl, { scale: 2, useCORS: true, allowTaint: true, logging: false })
      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
    }
    pdf.save(filename + '.pdf')
  } finally { document.body.removeChild(pageEl) }
}

export async function htmlToPDFBlob(html: string): Promise<Blob> {
  const pageEl = document.createElement('div')
  pageEl.style.cssText = `position:fixed;top:-9999px;left:0;width:${A4_W}px;background:#fff;`
  pageEl.innerHTML = html
  document.body.appendChild(pageEl)
  await waitForImages(pageEl)
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = 210; const pdfH = 297
    const totalH = pageEl.scrollHeight
    const pageCount = Math.max(1, Math.ceil(totalH / A4_H))
    for (let i = 0; i < pageCount; i++) {
      pageEl.style.marginTop = `${-i * A4_H}px`
      const canvas = await html2canvas(pageEl, { scale: 2, useCORS: true, allowTaint: true, logging: false })
      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
    }
    return pdf.output('blob')
  } finally { document.body.removeChild(pageEl) }
}

function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = container.querySelectorAll('img')
  if (imgs.length === 0) return Promise.resolve()
  return Promise.all(Array.from(imgs).map((img) =>
    new Promise<void>((resolve) => {
      if (img.complete) resolve()
      else { img.onload = () => resolve(); img.onerror = () => resolve() }
    })
  )).then(() => {})
}
