export function esc(s: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return s.replace(/[&<>"']/g, (c) => map[c])
}

export function safeImgSrc(src: string): string {
  if (!src) return ''
  if (src.startsWith('data:image/')) return src
  if (src.startsWith('https://') || src.startsWith('http://')) return src
  return ''
}
