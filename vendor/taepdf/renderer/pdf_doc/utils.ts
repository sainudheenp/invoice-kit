export const _te = new TextEncoder()

export function hpf(n: number): string {
  return n.toFixed(3).replace(/\.?0+$/, '')
}

export function encodeColor(r: number, g: number, b: number, isStroke: boolean, prec = 2): string {
  const opG = isStroke ? 'G' : 'g'
  const opC = isStroke ? 'RG' : 'rg'
  const fmt = (v: number) => (v / 255).toFixed(prec).replace(/\.?0+$/, '')
  if (r === g && g === b) return `${fmt(r)} ${opG}`
  return `${fmt(r)} ${fmt(g)} ${fmt(b)} ${opC}`
}

export function toPdfName(s: string): string {
  let out = ''
  for (const c of s) {
    if (c === '#') { out += '#23'; continue }
    if (' \n\r()[]<>{}/%'.includes(c)) { out += '#' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'); continue }
    out += c
  }
  return out
}

export function pdfEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export function widthsToPdf(widths: [number, number][]): string {
  let s = '['
  for (let i = 0; i < widths.length; i++) {
    if (i > 0) s += ' '
    s += `${widths[i][0]} [${widths[i][1]}]`
  }
  return s + ']'
}

// /W2 (vertical CID widths): [w1y v1x v1y] triples per CID — same list-form
// shape as /W, three numbers per entry instead of one
export function w2ToPdf(entries: [number, number, number, number][]): string {
  let s = '['
  for (let i = 0; i < entries.length; i++) {
    if (i > 0) s += ' '
    const [cid, w1y, v1x, v1y] = entries[i]
    s += `${cid} [${w1y} ${v1x} ${v1y}]`
  }
  return s + ']'
}

export function bboxToPdf(bbox: number[]): string {
  return '[' + bbox.join(' ') + ']'
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

export function pdfDate(): string {
  const d = new Date()
  const p = (n: number, w = 2) => n.toString().padStart(w, '0')
  return `D:${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}+00'00'`
}
