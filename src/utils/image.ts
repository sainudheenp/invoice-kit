const SVG_RE = /^data:image\/svg\+xml/

export const JPEG_QUALITY = 0.75

export const IMAGE_MAX_SIZES: Record<string, { w: number; h: number }> = {
  logo: { w: 300, h: 300 },
  seal: { w: 400, h: 400 },
  signature: { w: 500, h: 200 },
}

export function resizeImage(dataUrl: string, maxW: number, maxH: number): Promise<string> {
  if (SVG_RE.test(dataUrl)) return Promise.resolve(dataUrl)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const ratio = Math.min(maxW / width, maxH / height, 1)
      const newW = Math.max(1, Math.round(width * ratio))
      const newH = Math.max(1, Math.round(height * ratio))
      const canvas = document.createElement('canvas')
      canvas.width = newW
      canvas.height = newH
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, newW, newH)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
