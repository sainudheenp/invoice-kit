import initEngine, {
  register_font,
  register_font_raw,
  register_font_ttc,
  get_compressed_range,
  decompress_brotli,
  read_font_meta,
  measure_string_width,
  list_registered_fonts,
} from './tae-engine/pkg/tae_pdf.js'

export {
  initEngine,
  measure_string_width,
  list_registered_fonts,
}


export const PAGE_A4     = { width: 595.28, height: 841.89 } as const
export const PAGE_A5     = { width: 419.53, height: 595.28 } as const
export const PAGE_LETTER = { width: 612.00, height: 792.00 } as const


export type ManifestEntry = { path: string; name: string; ttcIndex?: number }

const _fetchCache  = new Map<string, Promise<Uint8Array>>()
const _woff2Cache  = new Map<string, Promise<{ bytes: Uint8Array; decompressed: Uint8Array }>>()

let _wasmReady: Promise<void> | null = null
const _ensureWasm = (): Promise<void> => {
  if (!_wasmReady) _wasmReady = initEngine().then(() => undefined)
  return _wasmReady
}

function _fetchFont(path: string): Promise<Uint8Array> {
  if (!_fetchCache.has(path)) {
    const p = fetch(path).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch font ${path}: ${r.status}`)
      return r.arrayBuffer().then(b => new Uint8Array(b))
    })
    p.catch(() => _fetchCache.delete(path))
    _fetchCache.set(path, p)
  }
  return _fetchCache.get(path)!
}

// Decompressed entirely in the WASM engine (decompress_brotli), not the
// browser's own DecompressionStream('brotli') — a real render confirmed that
// Streams-API format is missing in Brave on Windows ("Failed to construct
// 'DecompressionStream': Unsupported compression format: 'brotli'"), which
// silently failed every font's registration and left the whole exported PDF
// text-less (the live preview stayed visually correct throughout, since it
// never touches font registration at all — it relies on the browser's own
// already-loaded font). Routing this through the engine removes the
// dependency on any browser's Streams-API support entirely.
function _decompressWoff2(path: string, bytes: Uint8Array): Promise<{ bytes: Uint8Array; decompressed: Uint8Array }> {
  if (!_woff2Cache.has(path)) {
    const p = (async () => {
      const { start, length } = get_compressed_range(bytes) as { start: number; length: number }
      const decompressed = decompress_brotli(bytes.slice(start, start + length)) as Uint8Array
      return { bytes, decompressed }
    })()
    p.catch(() => _woff2Cache.delete(path))
    _woff2Cache.set(path, p)
  }
  return _woff2Cache.get(path)!
}

function _isRawFont(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false
  const sig = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0
  return sig === 0x00010000 || sig === 0x4F54544F || sig === 0x74727565
}

export async function loadAndRegisterFont(entry: ManifestEntry): Promise<void> {
  await _ensureWasm()
  const bytes = await _fetchFont(entry.path)

  const sig = bytes.length >= 4
    ? (((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0)
    : 0
  if (sig === 0x74746366) { // 'ttcf' collection
    register_font_ttc(entry.name, bytes, entry.ttcIndex ?? 0)
    return
  }
  if (_isRawFont(bytes)) {
    register_font_raw(entry.name, bytes)
    return
  }

  const { bytes: woff2Bytes, decompressed } = await _decompressWoff2(entry.path, bytes)
  const index = entry.ttcIndex ?? 0
  const meta = read_font_meta(woff2Bytes, decompressed, index) as { style: string; weight: number; isVariable: boolean }
  const weight = meta.isVariable ? 0 : meta.weight
  register_font(entry.name, meta.style, weight, 0, woff2Bytes, decompressed, index)
}



export function triggerDownload(bytes: Uint8Array, fileName: string): void {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type: isIOS ? 'application/octet-stream' : 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// \w is ASCII-only in JS regex — a plain [^\w-] strip silently deleted every
// non-Latin character rather than just filesystem-unsafe ones, emptying out
// e.g. a CJK-only name entirely (confirmed: safeName('田中太郎') === '').
// \p{L}/\p{N}/\p{M} (letter/number/combining-mark, any script) keep real
// name characters — including NFD-decomposed accents, which are their own
// \p{M} codepoint, not part of \p{L} — while still stripping path
// separators, quotes, and other filesystem-unsafe punctuation.
export const safeName = (s: string): string =>
  s.trim().replace(/\s+/g, '_').replace(/[^\p{L}\p{N}\p{M}_-]/gu, '')
