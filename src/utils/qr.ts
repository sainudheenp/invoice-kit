import qrcode from 'qrcode-generator'

export function generateQrDataURL(text: string, cellSize = 3, margin = 0): string {
  if (!text) return ''
  if (text.length > 1000) text = text.slice(0, 1000)
  const safeCell = Math.max(1, Math.min(10, Math.round(cellSize)))
  const safeMargin = Math.max(0, Math.min(10, Math.round(margin)))
  try {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    const modCount = qr.getModuleCount()
    const totalSize = modCount * safeCell + safeMargin * 2 * safeCell
    const dataUrl = qr.createDataURL(safeCell, safeMargin)
    return `<img src="${dataUrl}" style="width:${totalSize}px;height:${totalSize}px;display:block;" alt="QR Code"/>`
  } catch {
    return ''
  }
}

/** Returns pure PNG data URL (no HTML wrapper) for programmatic use */
export function generateQrPngDataURL(text: string, cellSize = 3, margin = 0): string {
  if (!text) return ''
  if (text.length > 1000) text = text.slice(0, 1000)
  const safeCell = Math.max(1, Math.min(10, Math.round(cellSize)))
  const safeMargin = Math.max(0, Math.min(10, Math.round(margin)))
  try {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    return qr.createDataURL(safeCell, safeMargin)
  } catch {
    return ''
  }
}