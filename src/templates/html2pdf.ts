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
  const pdf = new jsPDF('p', 'mm', 'a4')
  await renderToPDF(html, pdf)
  pdf.save(filename + '.pdf')
}

export async function htmlToPDFBlob(html: string): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  await renderToPDF(html, pdf)
  return pdf.output('blob')
}

async function renderToPDF(html: string, pdf: jsPDF): Promise<void> {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `position:fixed;top:-9999px;left:0;width:${A4_W}px;height:${A4_H}px;border:none;`
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument!
  doc.open()
  doc.write(html)
  doc.close()

  await waitForImages(doc.body)

  try {
    const pdfW = 210; const pdfH = 297
    const body = doc.body
    const totalH = body.scrollHeight
    const pageCount = Math.max(1, Math.ceil(totalH / A4_H))

    for (let i = 0; i < pageCount; i++) {
      body.style.marginTop = `${-i * A4_H}px`
      const canvas = await html2canvas(body, {
        scale: 2, useCORS: true, allowTaint: true, logging: false,
        width: A4_W, height: A4_H,
      })
      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
    }
  } finally {
    document.body.removeChild(iframe)
  }
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
