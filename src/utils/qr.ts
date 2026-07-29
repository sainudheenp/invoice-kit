import qrcode from 'qrcode-generator'

export function generateQrDataURL(text: string, cellSize = 4, margin = 0): string {
  if (!text) return ''
  try {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    return qr.createTableTag(cellSize, margin)
  } catch {
    return ''
  }
}