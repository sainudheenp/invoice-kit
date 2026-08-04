import qrcode from 'qrcode-generator'

export function generateQrDataURL(text: string, cellSize = 3, margin = 0): string {
  if (!text) return ''
  try {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    return qr.createSvgTag(cellSize, margin)
  } catch {
    return ''
  }
}