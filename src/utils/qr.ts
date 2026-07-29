import qrcode from 'qrcode-generator'

export function generateQrDataURL(text: string, cellSize = 4, margin = 0): string {
  if (!text) return ''
  try {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    const modCount = qr.getModuleCount()
    const totalSize = modCount * cellSize + margin * 2 * cellSize
    const table = qr.createTableTag(cellSize, margin)
    return `<div style="width:${totalSize}px;height:${totalSize}px;overflow:hidden;line-height:0;">${table}</div>`
  } catch {
    return ''
  }
}