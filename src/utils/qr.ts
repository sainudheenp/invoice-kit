import qrcode from 'qrcode-generator'

export function generateQrDataURL(text: string, cellSize = 3, margin = 0): string {
  if (!text) return ''
  try {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    const modCount = qr.getModuleCount()
    const totalSize = modCount * cellSize + margin * 2 * cellSize
    const dataUrl = qr.createDataURL(cellSize, margin)
    return `<img src="${dataUrl}" style="width:${totalSize}px;height:${totalSize}px;display:block;" alt="QR Code"/>`
  } catch {
    return ''
  }
}