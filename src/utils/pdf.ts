import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const A4_W = 794
const A4_H = 1123

export async function capturePDF(html: string, filename: string): Promise<void> {
  const pageEl = document.createElement('div')
  pageEl.style.cssText = `position:fixed;top:-9999px;left:0;width:${A4_W}px;height:${A4_H}px;overflow:hidden;background:#fff;`

  const content = document.createElement('div')
  content.style.cssText = `width:${A4_W}px;background:#fff;min-height:0!important;`
  content.innerHTML = html
  pageEl.appendChild(content)
  document.body.appendChild(pageEl)

  await waitForImages(content)

  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = 210
    const pdfH = 297

    const totalH = content.scrollHeight
    const pageCount = Math.max(1, Math.ceil(totalH / A4_H))

    for (let i = 0; i < pageCount; i++) {
      content.style.marginTop = `${-i * A4_H}px`

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
    }

    pdf.save(filename + '.pdf')
  } catch (err) {
    throw err
  } finally {
    document.body.removeChild(pageEl)
  }
}

export async function printHTML(html: string): Promise<void> {
  const area = document.getElementById('printArea') || createPrintArea()
  area.innerHTML = html
  area.style.display = 'block'
  await waitForImages(area)
  window.print()
}

export function downloadText(html: string, filename: string): void {
  const div = document.createElement('div')
  div.innerHTML = html
  const text = div.textContent || ''
  const cleaned = text.replace(/\s+/g, ' ').trim()
  const blob = new Blob([cleaned], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename + '.txt'
  a.click()
  URL.revokeObjectURL(url)
}

function createPrintArea(): HTMLElement {
  const el = document.createElement('div')
  el.id = 'printArea'
  el.className = 'print-only'
  document.body.appendChild(el)
  return el
}

function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = container.querySelectorAll('img')
  if (imgs.length === 0) return Promise.resolve()
  const promises = Array.from(imgs).map((img) =>
    new Promise<void>((resolve) => {
      if (img.complete) resolve()
      else { img.onload = () => resolve(); img.onerror = () => resolve() }
    })
  )
  return Promise.all(promises).then(() => {})
}
