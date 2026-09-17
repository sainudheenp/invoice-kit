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
      try {
        let { width, height } = img
        if (!width || !height) {
          reject(new Error('Invalid image dimensions'))
          return
        }
        const ratio = Math.min(maxW / width, maxH / height, 1)
        const newW = Math.max(1, Math.round(width * ratio))
        const newH = Math.max(1, Math.round(height * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = newW
        canvas.height = newH
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // Canvas not supported (jsdom / privacy mode) — return original
          resolve(dataUrl)
          return
        }
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, newW, newH)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Failed to process image'))
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    // Guard against huge data URLs that could OOM
    if (dataUrl.length > 5 * 1024 * 1024) {
      reject(new Error('Image too large (max 5MB)'))
      return
    }
    img.src = dataUrl
  })
}
