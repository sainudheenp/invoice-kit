export function esc(s: unknown): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  const str = String(s ?? '')
  return str.replace(/[&<>"']/g, (c) => map[c])
}

export function safeImgSrc(src: string): string {
  if (!src) return ''
  if (src.startsWith('data:image/')) return src
  if (src.startsWith('https://')) {
    if (src.length > 8192) return ''
    return src
  }
  return ''
}
