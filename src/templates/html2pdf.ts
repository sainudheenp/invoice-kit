type PdfMakeModule = typeof import('pdfmake/build/pdfmake').default

let pdfMakeReady: Promise<PdfMakeModule> | null = null

async function getPdfMake(): Promise<PdfMakeModule> {
  if (!pdfMakeReady) {
    pdfMakeReady = (async () => {
      const [mod, vfs] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ])
      ;(mod.default as any).addVirtualFileSystem(vfs.default as any)
      return mod.default
    })()
  }
  return pdfMakeReady
}

export function watermarkHTML(html: string, text: string): string {
  if (!text) return html
  return html + `<div style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;z-index:9999;"><div style="font-size:48px;color:rgba(0,0,0,0.06);transform:rotate(-30deg);font-weight:bold;white-space:pre-wrap;text-align:center;user-select:none;">${text}</div></div>`
}

function getStyle(el: Element, prop: string): string {
  const s = (el as HTMLElement).style
  if (!s) return ''
  const val = s.getPropertyValue(prop) || (s as any)[prop]
  return typeof val === 'string' ? val.trim() : ''
}

function pxToPt(px: string): number | null {
  const m = px.match(/^(\d+(?:\.\d+)?)\s*px$/)
  return m ? Math.round(parseFloat(m[1]) * 0.75) : null
}

function parseColor(c: string): string | null {
  if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return null
  return c
}

function buildContent(el: Node): any {
  if (el.nodeType === 3) {
    const text = el.textContent || ''
    const trimmed = text.replace(/\s+/g, ' ')
    if (!trimmed) return null
    return { text: trimmed }
  }

  if (el.nodeType !== 1) return null
  const e = el as Element
  const tag = e.nodeName.toLowerCase()

  if (tag === 'style' || tag === 'head' || tag === 'meta' || tag === 'html') return null
  if (tag === 'br') return { text: '\n' }

  const children: any[] = []
  for (const child of e.childNodes) {
    const c = buildContent(child)
    if (c) {
      if (Array.isArray(c)) children.push(...c)
      else children.push(c)
    }
  }

  if (tag === 'table') {
    const rows: any[][] = []
    const bodyTrs = e.querySelector('tbody')?.children || e.children
    for (const tr of bodyTrs) {
      if (tr.nodeName.toLowerCase() !== 'tr') continue
      const cells: any[] = []
      for (const td of tr.children) {
        if (td.nodeName.toLowerCase() !== 'td' && td.nodeName.toLowerCase() !== 'th') continue
        const cellChildren: any[] = []
        for (const child of td.childNodes) {
          const c = buildContent(child)
          if (c) cellChildren.push(c)
        }
        const cell: any = { text: cellChildren.length === 1 ? cellChildren[0].text : cellChildren }
        const bg = parseColor(getStyle(td, 'background-color') || getStyle(td, 'background'))
        if (bg) cell.fillColor = bg
        const align = getStyle(td, 'text-align')
        if (align) cell.alignment = align
        const color = parseColor(getStyle(td, 'color'))
        if (color) cell.color = color
        const fs = pxToPt(getStyle(td, 'font-size'))
        if (fs) cell.fontSize = fs
        if (getStyle(td, 'font-weight') === 'bold' || td.nodeName.toLowerCase() === 'th') cell.bold = true
        cells.push(cell)
      }
      if (cells.length > 0) rows.push(cells)
    }

    const widths = e.getAttribute('width')
    const tbl: any = { table: { body: rows } }
    if (!widths || widths === '100%') {
      tbl.table.widths = rows[0]?.map(() => '*') || []
    }
    return tbl
  }

  if (tag === 'img') {
    const src = e.getAttribute('src')
    if (!src) return null
    const w = pxToPt(getStyle(e, 'width') || e.getAttribute('width') || '')
    const h = pxToPt(getStyle(e, 'height') || e.getAttribute('height') || '')
    const img: any = { image: src }
    if (w) img.width = w
    if (h) img.height = h
    if (e.getAttribute('alt')) img.alt = e.getAttribute('alt')
    return img
  }

  if (tag === 'hr') return { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }] }

  const result: any = {}
  let textStack: string[] = []

  for (const c of children) {
    if (c.text !== undefined && typeof c.text === 'string' && !c.bold && !c.italics && !c.color && !c.fontSize) {
      textStack.push(c.text)
    } else {
      if (textStack.length > 0) {
        children.splice(children.indexOf(c) - textStack.length, textStack.length, { text: textStack.join(' ') })
        textStack = []
      }
    }
  }

  const finalChildren = children.filter(Boolean)
  const isTextNode = finalChildren.every((c: any) => c.text !== undefined && typeof c.text === 'string')
  if (finalChildren.length === 1 && finalChildren[0].text !== undefined) {
    const f = finalChildren[0]
    result.text = f.text
    const color = parseColor(getStyle(e, 'color'))
    if (color) result.color = color
    const fs = pxToPt(getStyle(e, 'font-size'))
    if (fs) result.fontSize = fs
    const bold = getStyle(e, 'font-weight') === 'bold'
    if (bold) result.bold = true
    const italic = getStyle(e, 'font-style') === 'italic'
    if (italic) result.italics = true
    const align = getStyle(e, 'text-align')
    if (align) result.alignment = align
    const bg = parseColor(getStyle(e, 'background-color'))
    if (bg) result.background = bg
    const deco = getStyle(e, 'text-decoration')
    if (deco?.includes('underline')) result.decoration = 'underline'
  } else if (isTextNode) {
    result.text = finalChildren.map((c: any) => c.text).join(' ')
    const color = parseColor(getStyle(e, 'color'))
    if (color) result.color = color
  } else {
    result.stack = finalChildren
  }

  return result
}

function htmlToDocDef(html: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body
  const content: any[] = []

  for (const child of body.children) {
    if (child.nodeName.toLowerCase() === 'style') continue
    const c = buildContent(child)
    if (c) content.push(c)
  }

  return {
    content,
    defaultStyle: { font: 'Roboto', fontSize: 9 },
    pageSize: 'A4' as const,
    pageMargins: [36, 36, 36, 36] as [number, number, number, number],
  }
}

export async function htmlToPDF(html: string, filename: string): Promise<void> {
  const [pm, def] = await Promise.all([getPdfMake(), htmlToDocDef(html)])
  ;(pm as any).createPdf(def).download(filename + '.pdf')
}

export async function htmlToPDFBlob(html: string): Promise<Blob> {
  const [pm, def] = await Promise.all([getPdfMake(), htmlToDocDef(html)])
  return new Promise((resolve) => {
    ;(pm as any).createPdf(def).getBlob((blob: Blob) => resolve(blob))
  })
}
