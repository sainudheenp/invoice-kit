import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resizeImage, IMAGE_MAX_SIZES, JPEG_QUALITY } from '@/utils/image'

describe('JPEG_QUALITY', () => {
  it('is 0.75', () => {
    expect(JPEG_QUALITY).toBe(0.75)
  })
})

describe('IMAGE_MAX_SIZES', () => {
  it('has correct dimensions', () => {
    expect(IMAGE_MAX_SIZES.logo).toEqual({ w: 300, h: 300 })
    expect(IMAGE_MAX_SIZES.seal).toEqual({ w: 400, h: 400 })
    expect(IMAGE_MAX_SIZES.signature).toEqual({ w: 500, h: 200 })
  })
})

describe('SVG passthrough', () => {
  it('returns SVG data URLs as-is', async () => {
    const svg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3N2Zz4='
    const result = await resizeImage(svg, 300, 300)
    expect(result).toBe(svg)
  })
})

describe('resizeImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllTimers()
  })

  function createMockImage(w: number, h: number) {
    let _src = ''
    const instance = {
      width: w,
      height: h,
      onload: null as (() => void) | null,
      onerror: null as ((e: any) => void) | null,
      get src() { return _src },
      set src(v: string) {
        _src = v
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 0)
      },
    }
    const Ctor = function() { return instance }
    return { Ctor, instance }
  }

  it('rejects on image load error', async () => {
    const { Ctor, instance } = createMockImage(0, 0)
    instance.onerror = () => {}
    vi.stubGlobal('Image', Ctor)

    const result = resizeImage('not-a-data-url', 100, 100)
    instance.onerror?.(new Error('load failed'))
    await expect(result).rejects.toThrow('Failed to load image')

    vi.unstubAllGlobals()
  })

  it('downscales images that exceed max dimensions', async () => {
    const drawSpy = vi.fn()
    const mockCtx = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: '' as string,
      drawImage: drawSpy,
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as any)

    const toDataURLSpy = vi.fn(() => 'data:image/jpeg;base64,ZmFrZQ==')
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(toDataURLSpy)

    const { Ctor, instance } = createMockImage(800, 600)
    vi.stubGlobal('Image', Ctor)

    const result = await resizeImage('data:image/png;base64,abc', 400, 300)

    expect(mockCtx.imageSmoothingEnabled).toBe(true)
    expect(mockCtx.imageSmoothingQuality).toBe('high')
    expect(drawSpy).toHaveBeenCalledWith(instance, 0, 0, 400, 300)
    expect(toDataURLSpy).toHaveBeenCalledWith('image/jpeg', JPEG_QUALITY)
    expect(result).toBe('data:image/jpeg;base64,ZmFrZQ==')

    vi.unstubAllGlobals()
  })

  it('does not upscale images smaller than max dimensions', async () => {
    const drawSpy = vi.fn()
    const mockCtx = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: '' as string,
      drawImage: drawSpy,
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as any)

    const toDataURLSpy = vi.fn(() => 'data:image/jpeg;base64,ZmFrZQ==')
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(toDataURLSpy)

    const { Ctor, instance } = createMockImage(100, 100)
    vi.stubGlobal('Image', Ctor)

    await resizeImage('data:image/png;base64,abc', 400, 300)

    expect(drawSpy).toHaveBeenCalledWith(instance, 0, 0, 100, 100)

    vi.unstubAllGlobals()
  })
})
