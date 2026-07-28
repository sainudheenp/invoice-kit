const SVG_RE = /^data:image\/svg\+xml/

export const IMAGE_MAX_SIZES: Record<string, { w: number; h: number }> = {
  logo: { w: 400, h: 400 },
  seal: { w: 600, h: 600 },
  signature: { w: 800, h: 300 },
}

export function resizeImage(dataUrl: string, maxW: number, maxH: number): Promise<string> {
  if (SVG_RE.test(dataUrl)) return Promise.resolve(dataUrl)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= maxW && height <= maxH) {
        resolve(dataUrl)
        return
      }
      const ratio = Math.min(maxW / width, maxH / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
