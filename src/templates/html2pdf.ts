export function watermarkHTML(html: string, text: string): string {
  if (!text) return html
  const s = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;z-index:9999;'
  const w = `<div style="${s}"><div style="font-size:48px;color:rgba(0,0,0,0.06);transform:rotate(-30deg);font-weight:bold;white-space:pre-wrap;text-align:center;">${text}</div></div>`
  return html + w
}

function waitForImgs(container: HTMLElement): Promise<void> {
  const imgs = container.querySelectorAll('img')
  if (imgs.length === 0) return Promise.resolve()
  return Promise.all(Array.from(imgs).map((img) =>
    new Promise<void>((r) => {
      if ((img as HTMLImageElement).complete) r()
      else { img.onload = () => r(); img.onerror = () => r() }
    })
  )).then(() => {})
}

async function renderToPages(html: string): Promise<Blob> {
  const { default: html2canvas } = await import('html2canvas')
  const { default: jsPDF } = await import('jspdf')

  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;background:#fff;'
  wrap.innerHTML = html
  document.body.appendChild(wrap)

  await waitForImgs(wrap)

  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const canvas = await html2canvas(wrap, { scale: 3, useCORS: true, allowTaint: true, logging: false })
    const pageH = 1123 * 3
    const pageCount = Math.max(1, Math.ceil(canvas.height / pageH))

    for (let i = 0; i < pageCount; i++) {
      if (i > 0) pdf.addPage()
      const pg = document.createElement('canvas')
      pg.width = 794 * 3
      pg.height = pageH
      const ctx = pg.getContext('2d')!
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, pg.width, pg.height)
      const srcY = i * pageH
      const srcH = Math.min(pageH, canvas.height - srcY)
      if (srcH > 0) ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, pg.width, srcH)
      pdf.addImage(pg.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
    }
    return pdf.output('blob')
  } finally {
    document.body.removeChild(wrap)
  }
}

export async function htmlToPDF(html: string, filename: string): Promise<void> {
  const blob = await renderToPages(html)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename + '.pdf'
  a.click()
  URL.revokeObjectURL(url)
}

export async function htmlToPDFBlob(html: string): Promise<Blob> {
  return renderToPages(html)
}
