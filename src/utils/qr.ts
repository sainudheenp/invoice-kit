import qrcode from 'qrcode-generator'

function createQrSvgDataURL(text: string, cellSize: number, margin: number): { dataUrl: string; size: number } | null {
  if (!text) return null
  if (text.length > 1000) text = text.slice(0, 1000)
  const safeCell = Math.max(1, Math.min(10, Math.round(cellSize)))
  const safeMargin = Math.max(0, Math.min(10, Math.round(margin)))
  try {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    const modCount = qr.getModuleCount()
    const size = modCount * safeCell + safeMargin * 2 * safeCell
    // qrcode-generator's createDataURL() returns a GIF. The browser displays it,
    // but taepdf only supports PNG, JPEG, and SVG images. SVG keeps the QR sharp
    // in both print and downloaded vector PDFs.
    const svg = qr.createSvgTag(safeCell, safeMargin)
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    return { dataUrl, size }
  } catch {
    return null
  }
}

export function generateQrDataURL(text: string, cellSize = 3, margin = 0): string {
  const qr = createQrSvgDataURL(text, cellSize, margin)
  if (!qr) return ''
  return `<img src="${qr.dataUrl}" style="width:${qr.size}px;height:${qr.size}px;display:block;" alt="QR Code"/>`
}
