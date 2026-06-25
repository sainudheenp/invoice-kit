import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export async function capturePDF(html: string, filename: string): Promise<void> {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;min-height:1123px;background:#fff;overflow:hidden;'
  container.innerHTML = html
  document.body.appendChild(container)

  await waitForImages(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    })
    document.body.removeChild(container)

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = 210
    const pdfH = 297
    const imgW = pdfW
    const imgH = (canvas.height / canvas.width) * pdfW

    let heightLeft = imgH
    let position = 0
    let page = 0

    while (heightLeft > 0) {
      page++
      if (page > 1) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH, undefined, 'FAST')
      heightLeft -= pdfH
      position -= pdfH
    }

    pdf.save(filename + '.pdf')
  } catch (err) {
    document.body.removeChild(container)
    throw err
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
