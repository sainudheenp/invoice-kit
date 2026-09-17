import { useState, useRef, useEffect, useCallback } from 'react'
import { useUI } from '@/store/UIContext'
import { Card, Button } from '@/components/ui'
import { Svg } from '@/icons'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Set worker src for pdfjs-dist (hybrid worker, off main thread)
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorkerUrl
}

type Tool = 'select' | 'text' | 'whiteout' | 'image'

interface Whiteout {
  id: string
  page: number
  x: number // 0-1 relative from top-left
  y: number
  w: number
  h: number
}

interface TextBox {
  id: string
  page: number
  x: number
  y: number
  w: number
  h: number
  text: string
  fontSize: number
  color: string
  bold: boolean
  family: 'Helvetica' | 'Times' | 'Courier'
}

interface ImageBox {
  id: string
  page: number
  x: number
  y: number
  w: number
  h: number
  src: string // dataURL for preview
  bytes: Uint8Array
  mime: string
}

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = ((bigint >> 16) & 255) / 255
  const g = ((bigint >> 8) & 255) / 255
  const b = (bigint & 255) / 255
  return rgb(r, g, b)
}

export default function PdfEditor() {
  const { showToast } = useUI()
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null)
  const [numPages, setNumPages] = useState(0)
  const [fileName, setFileName] = useState('')
  const [tool, setTool] = useState<Tool>('select')
  const [whiteouts, setWhiteouts] = useState<Whiteout[]>([])
  const [texts, setTexts] = useState<TextBox[]>([])
  const [images, setImages] = useState<ImageBox[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number; page: number } | null>(null)
  const [currentDrawRect, setCurrentDrawRect] = useState<Whiteout | null>(null)
  const [zoom, setZoom] = useState(1)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pendingImageRef = useRef<{ bytes: Uint8Array; src: string; mime: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [history, setHistory] = useState<{ whiteouts: Whiteout[]; texts: TextBox[]; images: ImageBox[] }[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)

  const pushHistory = useCallback((w: Whiteout[], t: TextBox[], im: ImageBox[]) => {
    const snapshot = { whiteouts: w, texts: t, images: im }
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIdx + 1)
      const next = [...sliced, snapshot]
      if (next.length > 50) next.shift()
      return next
    })
    setHistoryIdx((i) => {
      const next = i + 1
      return next > 49 ? 49 : next
    })
  }, [historyIdx])

  const undo = () => {
    if (historyIdx <= 0) return
    const prev = history[historyIdx - 1]
    if (!prev) return
    setWhiteouts(prev.whiteouts)
    setTexts(prev.texts)
    setImages(prev.images)
    setHistoryIdx((i) => i - 1)
  }
  const redo = () => {
    if (historyIdx >= history.length - 1) return
    const next = history[historyIdx + 1]
    if (!next) return
    setWhiteouts(next.whiteouts)
    setTexts(next.texts)
    setImages(next.images)
    setHistoryIdx((i) => i + 1)
  }

  // Save initial history when annotations change? Use effect to push on change? We'll push explicitly after each operation
  const saveHistory = (w = whiteouts, t = texts, im = images) => pushHistory(w, t, im)

  const loadPdf = async (bytes: Uint8Array, name: string) => {
    try {
      const loadingTask = (pdfjsLib as any).getDocument({ data: bytes.slice(0) })
      const doc = await loadingTask.promise
      setPdfDocProxy(doc)
      setNumPages(doc.numPages)
      setPdfBytes(bytes)
      setFileName(name)
      setWhiteouts([])
      setTexts([])
      setImages([])
      setHistory([])
      setHistoryIdx(-1)
      // push initial empty history
      setTimeout(() => pushHistory([], [], []), 0)
      showToast(`Loaded ${doc.numPages} page${doc.numPages > 1 ? 's' : ''}`)
    } catch (e: any) {
      console.error(e)
      showToast('Failed to load PDF: ' + (e?.message || 'unknown'), 'err')
    }
  }

  const handleFile = async (file: File) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please upload a PDF file.', 'err')
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast('PDF too large (max 25MB).', 'err')
      return
    }
    const buf = await file.arrayBuffer()
    await loadPdf(new Uint8Array(buf), file.name)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  // Text editing helpers
  const addTextAt = (page: number, x: number, y: number) => {
    const id = uid()
    const tb: TextBox = {
      id,
      page,
      x: Math.max(0, x - 0.12),
      y: Math.max(0, y - 0.02),
      w: 0.24,
      h: 0.04,
      text: 'Edit me',
      fontSize: 14,
      color: '#111827',
      bold: false,
      family: 'Helvetica',
    }
    const next = [...texts, tb]
    setTexts(next)
    setSelectedId(id)
    saveHistory(whiteouts, next, images)
  }

  const updateText = (id: string, patch: Partial<TextBox>) => {
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const deleteSelected = () => {
    if (!selectedId) return
    const wNext = whiteouts.filter((w) => w.id !== selectedId)
    const tNext = texts.filter((t) => t.id !== selectedId)
    const iNext = images.filter((im) => im.id !== selectedId)
    const changed = wNext.length !== whiteouts.length || tNext.length !== texts.length || iNext.length !== images.length
    if (changed) {
      setWhiteouts(wNext)
      setTexts(tNext)
      setImages(iNext)
      setSelectedId(null)
      saveHistory(wNext, tNext, iNext)
    }
  }

  // Handle keyboard delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        const active = document.activeElement?.tagName
        if (active === 'INPUT' || active === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable) return
        deleteSelected()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, historyIdx, history])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image too large (max 5MB)', 'err')
      return
    }
    const buf = await file.arrayBuffer()
    const bytes = new Uint8Array(buf)
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      pendingImageRef.current = { bytes, src, mime: file.type || 'image/png' }
      setTool('image')
      showToast('Click on page to place image')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handlePageClick = (pageIdx: number, relX: number, relY: number) => {
    if (tool === 'text') {
      addTextAt(pageIdx, relX, relY)
    } else if (tool === 'image' && pendingImageRef.current) {
      const p = pendingImageRef.current
      const id = uid()
      const im: ImageBox = {
        id,
        page: pageIdx,
        x: Math.max(0, relX - 0.1),
        y: Math.max(0, relY - 0.08),
        w: 0.2,
        h: 0.15,
        src: p.src,
        bytes: p.bytes,
        mime: p.mime,
      }
      const next = [...images, im]
      setImages(next)
      setSelectedId(id)
      saveHistory(whiteouts, texts, next)
      pendingImageRef.current = null
      setTool('select')
    }
  }

  // Whiteout drag handling per page
  const handleWhiteoutStart = (pageIdx: number, relX: number, relY: number) => {
    if (tool !== 'whiteout') return
    setIsDrawing(true)
    setDrawStart({ x: relX, y: relY, page: pageIdx })
    setCurrentDrawRect({ id: 'draft', page: pageIdx, x: relX, y: relY, w: 0, h: 0 })
  }
  const handleWhiteoutMove = (pageIdx: number, relX: number, relY: number) => {
    if (!isDrawing || !drawStart || drawStart.page !== pageIdx) return
    const x = Math.min(drawStart.x, relX)
    const y = Math.min(drawStart.y, relY)
    const w = Math.abs(relX - drawStart.x)
    const h = Math.abs(relY - drawStart.y)
    setCurrentDrawRect({ id: 'draft', page: pageIdx, x, y, w, h })
  }
  const handleWhiteoutEnd = () => {
    if (!isDrawing || !currentDrawRect) {
      setIsDrawing(false)
      setDrawStart(null)
      setCurrentDrawRect(null)
      return
    }
    if (currentDrawRect.w < 0.01 || currentDrawRect.h < 0.005) {
      setIsDrawing(false)
      setDrawStart(null)
      setCurrentDrawRect(null)
      return
    }
    const id = uid()
    const next = [...whiteouts, { ...currentDrawRect, id }]
    setWhiteouts(next)
    saveHistory(next, texts, images)
    setIsDrawing(false)
    setDrawStart(null)
    setCurrentDrawRect(null)
  }

  const handleDownload = async () => {
    if (!pdfBytes) {
      showToast('No PDF loaded', 'err')
      return
    }
    setSaving(true)
    try {
      // Use pdf-lib to edit - offload via setTimeout to keep UI responsive (hybrid worker vibe)
      await new Promise((r) => setTimeout(r, 50))
      const pdfDoc = await PDFDocument.load(pdfBytes.slice(0))
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const times = await pdfDoc.embedFont(StandardFonts.TimesRoman)
      const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
      const courier = await pdfDoc.embedFont(StandardFonts.Courier)
      const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold)

      const fontMap: Record<string, any> = {
        Helvetica: helvetica,
        'Helvetica-Bold': helveticaBold,
        Times: times,
        'Times-Bold': timesBold,
        Courier: courier,
        'Courier-Bold': courierBold,
      }

      for (let p = 0; p < pdfDoc.getPageCount(); p++) {
        const page = pdfDoc.getPage(p)
        const { width, height } = page.getSize()
        // Whiteouts first (cover)
        for (const w of whiteouts.filter((w) => w.page === p)) {
          page.drawRectangle({
            x: w.x * width,
            y: height - (w.y * height) - (w.h * height),
            width: w.w * width,
            height: w.h * height,
            color: rgb(1, 1, 1),
            borderWidth: 0,
          })
        }
        // Texts
        for (const t of texts.filter((t) => t.page === p)) {
          const key = t.bold ? `${t.family}-Bold` : t.family
          const font = fontMap[key] || helvetica
          // pdf-lib fontSize is in points; our relative fontSize is absolute points, scale with page width?
          // Use t.fontSize as points, but adjust for zoom? Keep as is.
          // Draw multi-line support: split by \n
          const lines = t.text.split('\n')
          const lineHeight = t.fontSize * 1.2
          lines.forEach((line, idx) => {
            page.drawText(line, {
              x: t.x * width,
              y: height - (t.y * height) - (t.fontSize + idx * lineHeight),
              size: t.fontSize,
              font,
              color: hexToRgb(t.color),
              lineHeight: lineHeight,
            })
          })
        }
        // Images
        for (const im of images.filter((im) => im.page === p)) {
          try {
            let embedded: any
            if (im.mime.includes('png')) {
              embedded = await pdfDoc.embedPng(im.bytes)
            } else if (im.mime.includes('jpg') || im.mime.includes('jpeg')) {
              embedded = await pdfDoc.embedJpg(im.bytes)
            } else {
              // try png then jpg
              try {
                embedded = await pdfDoc.embedPng(im.bytes)
              } catch {
                embedded = await pdfDoc.embedJpg(im.bytes)
              }
            }
            if (embedded) {
              page.drawImage(embedded, {
                x: im.x * width,
                y: height - (im.y * height) - (im.h * height),
                width: im.w * width,
                height: im.h * height,
              })
            }
          } catch (e) {
            console.warn('image embed failed', e)
          }
        }
      }

      const outBytes = await pdfDoc.save()
      const blob = new Blob([outBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const base = fileName ? fileName.replace(/\.pdf$/i, '') : 'edited'
      a.download = `${base}-edited.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        a.remove()
      }, 100)
      showToast('PDF downloaded')
    } catch (e: any) {
      console.error(e)
      showToast('Failed to export: ' + (e?.message || 'unknown'), 'err')
    } finally {
      setSaving(false)
    }
  }

  const clearAll = () => {
    if (!confirm('Clear all edits?')) return
    setWhiteouts([])
    setTexts([])
    setImages([])
    saveHistory([], [], [])
  }

  const selectedText = texts.find((t) => t.id === selectedId)
  const hasPdf = !!pdfDocProxy

  return (
    <div className="page-enter flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center text-sm">
              <Svg name="file" className="w-4 h-4" />
            </span>
            PDF Editor
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)]">Sejda-like</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text2)] mt-1">Upload any PDF → Text, Whiteout, Images. 100% in-browser. No upload to server.</p>
        </div>
        {hasPdf && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-input-bg)] border border-[var(--color-border)] font-medium">
              {fileName} • {numPages} page{numPages > 1 ? 's' : ''}
            </span>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Change PDF
            </Button>
          </div>
        )}
      </header>

      {!hasPdf ? (
        <Card className="overflow-hidden">
          <div
            onDragOver={(e) => {
              e.preventDefault()
            }}
            onDrop={handleDrop}
            className="p-6 sm:p-10 flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-bg)] flex items-center justify-center">
              <Svg name="file" className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Drop PDF here or click to upload</h2>
              <p className="text-xs sm:text-sm text-[var(--color-text2)] mt-1 max-w-md mx-auto">
                Works exactly like Sejda: edit existing text (whiteout + retype), add new text anywhere, whiteout sensitive data, add images / signatures. Max 25MB, all processing stays in your browser (hybrid worker).
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Button onClick={() => fileInputRef.current?.click()} className="px-6">
                Upload PDF
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  // Create a blank PDF sample for demo
                  const doc = await PDFDocument.create()
                  const page = doc.addPage([595, 842])
                  const helv = await doc.embedFont(StandardFonts.Helvetica)
                  page.drawText('Sample PDF — try the editor!', { x: 50, y: 770, size: 18, font: helv })
                  page.drawText('This is a demo PDF generated in-browser.', { x: 50, y: 740, size: 11, font: helv, color: rgb(0.4, 0.4, 0.4) })
                  page.drawText('• Use Whiteout to hide this line → then add new text.', { x: 50, y: 710, size: 10, font: helv })
                  page.drawText('• Click Text tool, then click anywhere to add text.', { x: 50, y: 690, size: 10, font: helv })
                  const bytes = await doc.save()
                  await loadPdf(bytes as any, 'sample.pdf')
                }}
              >
                Try sample PDF
              </Button>
            </div>
            <p className="text-[11px] text-[var(--color-text3)] mt-2">PDFs never leave your device. Download only — nothing saved.</p>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          <div className="px-4 sm:px-6 py-4 bg-[var(--color-input-bg)]/50 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                <Svg name="edit" className="w-4 h-4" />
              </span>
              <div>
                <div className="font-semibold">Edit text</div>
                <div className="text-[var(--color-text3)]">Whiteout old text + type new. Click any area with Text tool.</div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                <span className="w-3 h-3 bg-white border border-[var(--color-border)] rounded-sm block" />
              </span>
              <div>
                <div className="font-semibold">Whiteout</div>
                <div className="text-[var(--color-text3)]">Drag to cover sensitive info. Export is true white, not just overlay.</div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                <Svg name="box" className="w-4 h-4" />
              </span>
              <div>
                <div className="font-semibold">Images & more</div>
                <div className="text-[var(--color-text3)]">Add signature / logo / stamps anywhere.</div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Toolbar */}
          <div className="sticky top-0 z-10 bg-[var(--color-page-bg)]/80 backdrop-blur-sm -mx-3 px-3 sm:mx-0 sm:px-0 py-2">
            <Card className="p-2 sm:p-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'select', label: 'Select', icon: 'edit', desc: 'Select & delete' },
                    { id: 'text', label: 'Text', icon: 'file', desc: 'Click to add text' },
                    { id: 'whiteout', label: 'Whiteout', icon: 'trash', desc: 'Drag to hide' },
                    { id: 'image', label: 'Image', icon: 'box', desc: 'Place image' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTool(t.id as Tool)}
                      className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        tool === t.id
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                          : 'bg-[var(--color-card)] border-[var(--color-border)] hover:bg-[var(--color-input-bg)]'
                      }`}
                      title={t.desc}
                    >
                      <Svg name={t.icon as any} className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-[var(--color-border)] mx-1 hidden sm:block" />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-input-bg)] cursor-pointer flex items-center gap-1.5"
                  >
                    <Svg name="edit" className="w-3.5 h-3.5" /> Upload Image
                  </button>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)]">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
                      className="px-2.5 py-2 hover:bg-[var(--color-input-bg)] cursor-pointer text-xs font-bold"
                    >
                      −
                    </button>
                    <span className="px-2 text-xs font-medium min-w-[52px] text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(1))))}
                      className="px-2.5 py-2 hover:bg-[var(--color-input-bg)] cursor-pointer text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                  <Button size="sm" variant="outline" onClick={undo} disabled={historyIdx <= 0} className="text-xs">
                    Undo
                  </Button>
                  <Button size="sm" variant="outline" onClick={redo} disabled={historyIdx >= history.length - 1} className="text-xs">
                    Redo
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearAll} className="text-xs hidden sm:inline-flex">
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleDownload} disabled={saving} className="text-xs px-4">
                    {saving ? 'Saving…' : 'Download PDF'}
                  </Button>
                </div>
              </div>
              {/* Hint */}
              <div className="mt-2 text-[11px] text-[var(--color-text3)] flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <b className="text-[var(--color-text2)]">Tip:</b> To edit existing text, use <b>Whiteout</b> to cover it, then <b>Text</b> to retype (true Sejda workflow).
                </span>
                {tool === 'image' && pendingImageRef.current && (
                  <span className="text-[var(--color-primary)] font-medium animate-pulse">Image ready → click on page to place</span>
                )}
                {selectedId && <span className="hidden sm:inline">Selected → Delete / Backspace to remove, drag to move (select tool)</span>}
              </div>
            </Card>
          </div>

          {/* Properties for selected text */}
          {selectedText && (
            <Card className="p-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-[11px] font-medium text-[var(--color-text2)]">Text</label>
                  <textarea
                    value={selectedText.text}
                    onChange={(e) => updateText(selectedText.id, { text: e.target.value })}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-text2)]">Size</label>
                  <input
                    type="number"
                    min={6}
                    max={72}
                    value={selectedText.fontSize}
                    onChange={(e) => updateText(selectedText.id, { fontSize: Math.max(6, Math.min(72, parseFloat(e.target.value) || 14)) })}
                    className="w-20 mt-1 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-text2)]">Color</label>
                  <input
                    type="color"
                    value={selectedText.color}
                    onChange={(e) => updateText(selectedText.id, { color: e.target.value })}
                    className="w-10 h-9 mt-1 rounded-lg border border-[var(--color-input-border)] cursor-pointer p-1 bg-[var(--color-card)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-text2)]">Style</label>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => updateText(selectedText.id, { bold: !selectedText.bold })}
                      className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${selectedText.bold ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-card)] border-[var(--color-border)]'}`}
                    >
                      B
                    </button>
                    <select
                      value={selectedText.family}
                      onChange={(e) => updateText(selectedText.id, { family: e.target.value as any })}
                      className="px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-xs"
                    >
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times">Times</option>
                      <option value="Courier">Courier</option>
                    </select>
                  </div>
                </div>
                <Button size="sm" variant="danger" onClick={deleteSelected} className="ml-auto">
                  Delete
                </Button>
              </div>
            </Card>
          )}

          {/* PDF Pages */}
          <div ref={containerRef} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
            {Array.from({ length: numPages }, (_, idx) => (
              <PdfPage
                key={idx}
                pageIndex={idx}
                pdfDocProxy={pdfDocProxy}
                zoom={zoom}
                whiteouts={whiteouts.filter((w) => w.page === idx)}
                texts={texts.filter((t) => t.page === idx)}
                images={images.filter((im) => im.page === idx)}
                currentDrawRect={currentDrawRect?.page === idx ? currentDrawRect : null}
                tool={tool}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onPageClick={handlePageClick}
                onWhiteoutStart={handleWhiteoutStart}
                onWhiteoutMove={handleWhiteoutMove}
                onWhiteoutEnd={handleWhiteoutEnd}
                onTextUpdate={updateText}
                onTextMove={(id, x, y) => updateText(id, { x, y })}
                onImageMove={(id, x, y) => setImages((prev) => prev.map((im) => (im.id === id ? { ...im, x, y } : im)))}
                onDelete={deleteSelected}
                onEditNativeText={(page, x, y, w, h, str, fontSize) => {
                  // Sejda-like: whiteout the native text and place editable box
                  const wb: Whiteout = { id: uid(), page, x: Math.max(0, x - 0.002), y: Math.max(0, y - 0.002), w: Math.min(1, w + 0.004), h: Math.min(1, h + 0.004) }
                  const tb: TextBox = {
                    id: uid(),
                    page,
                    x,
                    y,
                    w,
                    h: Math.max(h, 0.03),
                    text: str,
                    fontSize: Math.max(8, Math.min(24, Math.round(fontSize))),
                    color: '#111827',
                    bold: false,
                    family: 'Helvetica',
                  }
                  const wNext = [...whiteouts, wb]
                  const tNext = [...texts, tb]
                  setWhiteouts(wNext)
                  setTexts(tNext)
                  setSelectedId(tb.id)
                  saveHistory(wNext, tNext, images)
                }}
              />
            ))}
          </div>

          <div className="flex justify-center gap-2 pt-4">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload another PDF
            </Button>
            <Button onClick={handleDownload} disabled={saving}>
              {saving ? 'Generating…' : 'Download edited PDF'}
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </>
      )}
    </div>
  )
}

function PdfPage({
  pageIndex,
  pdfDocProxy,
  zoom,
  whiteouts,
  texts,
  images,
  currentDrawRect,
  tool,
  selectedId,
  onSelect,
  onPageClick,
  onWhiteoutStart,
  onWhiteoutMove,
  onWhiteoutEnd,
  onTextUpdate,
  onTextMove,
  onImageMove,
  onDelete,
  onEditNativeText,
}: {
  pageIndex: number
  pdfDocProxy: any
  zoom: number
  whiteouts: Whiteout[]
  texts: TextBox[]
  images: ImageBox[]
  currentDrawRect: Whiteout | null
  tool: Tool
  selectedId: string | null
  onSelect: (id: string | null) => void
  onPageClick: (page: number, x: number, y: number) => void
  onWhiteoutStart: (page: number, x: number, y: number) => void
  onWhiteoutMove: (page: number, x: number, y: number) => void
  onWhiteoutEnd: () => void
  onTextUpdate: (id: string, patch: Partial<TextBox>) => void
  onTextMove: (id: string, x: number, y: number) => void
  onImageMove: (id: string, x: number, y: number) => void
  onDelete: () => void
  onEditNativeText: (page: number, x: number, y: number, w: number, h: number, text: string, fontSize: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<any>(null)
  const [rendered, setRendered] = useState(false)
  const [isInView, setIsInView] = useState(pageIndex < 2) // eager for first 2 pages
  const renderTaskRef = useRef<any>(null)
  const pageProxyRef = useRef<any>(null)
  const [nativeTexts, setNativeTexts] = useState<Array<{ id: string; x: number; y: number; w: number; h: number; str: string; fontSize: number }>>([])

  // Lazy: only render when in viewport (hybrid idle)
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setIsInView(true)
      },
      { rootMargin: '600px 0px', threshold: 0.01 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Render pdf page to canvas - debounced & cancellable
  useEffect(() => {
    if (!isInView) return
    let cancelled = false
    let timeoutId: number | undefined

    const doRender = async () => {
      if (!pdfDocProxy || !canvasRef.current || !containerRef.current) return
      // cancel previous task
      try { renderTaskRef.current?.cancel() } catch {}
      setRendered(false)
      try {
        const page = pageProxyRef.current || (await pdfDocProxy.getPage(pageIndex + 1))
        pageProxyRef.current = page
        const containerWidth = containerRef.current.clientWidth || 700
        const unscaled = page.getViewport({ scale: 1 })
        // Cap DPR to avoid huge canvas on retina + zoom 2
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        const scale = (containerWidth * zoom) / unscaled.width
        const vp = page.getViewport({ scale: scale * dpr })
        setViewport({ width: vp.width / dpr, height: vp.height / dpr, raw: vp })
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D
        if (!ctx) return
        // Use dpr for crisp but not too large
        canvas.width = vp.width
        canvas.height = vp.height
        canvas.style.width = '100%'
        canvas.style.height = 'auto'
        // Fill white to avoid transparency flash
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const task = page.render({ canvasContext: ctx, viewport: vp })
        renderTaskRef.current = task
        await task.promise
        if (!cancelled) setRendered(true)
        // Extract native text for editability (select tool)
        try {
          const textContent = await page.getTextContent()
          const items: Array<{ id: string; x: number; y: number; w: number; h: number; str: string; fontSize: number }> = []
          // @ts-ignore pdfjs Util
          const Util = (pdfjsLib as any).Util
          for (let i = 0; i < textContent.items.length; i++) {
            const item: any = textContent.items[i]
            if (!item.str || !item.str.trim()) continue
            const tx = Util.transform(vp.transform, item.transform)
            // font size from transform
            const fontSize = Math.hypot(item.transform[0], item.transform[1])
            // width/height from item (pdf.js provides width, height scaled)
            const w = (item.width * vp.scale) || (item.str.length * fontSize * 0.6 * vp.scale / fontSize) // fallback
            // item.height may be undefined, use fontSize
            const h = (item.height ? item.height * vp.scale : fontSize * vp.scale / fontSize * 1) // normalize
            // tx is bottom-left in viewport coords (origin bottom-left for pdf, but viewport transform already maps to canvas coords with origin top-left? Actually viewport y is top-down)
            // In pdf.js, viewport.transform maps PDF to canvas with y flipped. So tx[5] is already canvas y from top? Let's check.
            // We'll compute relative
            // tx[4], tx[5] are canvas coords for baseline. For relative top-left, we need to adjust.
            // Use viewport to convert: we already used Util.transform which gives canvas coords.
            const canvasX = tx[4]
            const canvasY = tx[5]
            // Estimate bbox: x = canvasX, y = canvasY - h (since y is baseline)
            const relX = canvasX / vp.width
            const relY = (canvasY - h) / vp.height
            // Clamp and filter tiny
            if (w < 1 || h < 1) continue
            items.push({
              id: `nt_${pageIndex}_${i}`,
              x: Math.max(0, Math.min(1, relX)),
              y: Math.max(0, Math.min(1, relY)),
              w: Math.max(0.01, Math.min(1, w / vp.width)),
              h: Math.max(0.01, Math.min(1, h / vp.height)),
              str: item.str,
              fontSize: Math.max(6, Math.min(36, (fontSize * vp.scale) / (vp.scale) )), // keep pdf points approx
            })
          }
          if (!cancelled) setNativeTexts(items)
        } catch (e) {
          // ignore text extraction failure (scanned pdf)
        }
        // reduce memory
        try { page.cleanup() } catch {}
      } catch (e: any) {
        if (e?.name !== 'RenderingCancelledException' && !cancelled) {
          console.warn('render failed', e)
          setRendered(true)
        }
      }
    }

    // Debounce zoom/resize: 80ms
    timeoutId = window.setTimeout(doRender, 80)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      try { renderTaskRef.current?.cancel() } catch {}
    }
  }, [pdfDocProxy, pageIndex, zoom, isInView])

  // Fast resize without full re-render using CSS only if zoom unchanged? We still need re-render for quality, but debounce covers

  const getRel = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect()
    const clientX = (e as React.TouchEvent).touches?.[0]?.clientX ?? (e as React.MouseEvent).clientX
    const clientY = (e as React.TouchEvent).touches?.[0]?.clientY ?? (e as React.MouseEvent).clientY
    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
  }

  const handlePointerDown = (e: React.MouseEvent) => {
    const { x, y } = getRel(e)
    if (tool === 'whiteout') {
      onWhiteoutStart(pageIndex, x, y)
    } else if (tool === 'text' || tool === 'image') {
      // handled on click
    }
  }
  const handlePointerMove = (e: React.MouseEvent) => {
    if (tool === 'whiteout') {
      const { x, y } = getRel(e)
      onWhiteoutMove(pageIndex, x, y)
    }
  }
  const handlePointerUp = () => {
    if (tool === 'whiteout') onWhiteoutEnd()
  }
  const handleClick = (e: React.MouseEvent) => {
    // Avoid click after drag
    const { x, y } = getRel(e)
    if (tool === 'text' || tool === 'image') {
      onPageClick(pageIndex, x, y)
    } else if (tool === 'select') {
      // click on empty area deselect
      if ((e.target as HTMLElement).closest('[data-annotation]') == null) {
        onSelect(null)
      }
    }
  }

  return (
    <div ref={wrapperRef} className="bg-[var(--color-card)] rounded-xl sm:rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between bg-[var(--color-input-bg)]/50 border-b border-[var(--color-border)] text-xs">
        <span className="font-medium">Page {pageIndex + 1}</span>
        <span className="text-[var(--color-text3)] hidden sm:inline">{rendered && viewport ? `${Math.round(viewport.width)} × ${Math.round(viewport.height)} px` : 'loading…'}</span>
      </div>
      <div
        ref={containerRef}
        className={`relative bg-white select-none min-h-[280px] sm:min-h-[400px] ${tool === 'whiteout' ? 'cursor-crosshair' : tool === 'text' ? 'cursor-text' : 'cursor-default'}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onClick={handleClick}
        onTouchStart={(e) => handlePointerDown(e as any)}
        onTouchMove={(e) => handlePointerMove(e as any)}
        onTouchEnd={handlePointerUp}
      >
        <canvas ref={canvasRef} className="block w-full h-auto" />
        {/* Native text layer - clickable for edit, only in select mode */}
        {tool === 'select' && rendered && nativeTexts.length > 0 && (
          <div className="absolute inset-0">
            {nativeTexts.map((nt) => (
              <div
                key={nt.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onEditNativeText(pageIndex, nt.x, nt.y, nt.w, nt.h, nt.str, nt.fontSize)
                }}
                className="absolute group cursor-text hover:bg-[var(--color-primary)]/10 border border-transparent hover:border-[var(--color-primary)]/30 rounded-[2px] transition-colors"
                style={{
                  left: `${nt.x * 100}%`,
                  top: `${nt.y * 100}%`,
                  width: `${nt.w * 100}%`,
                  height: `${nt.h * 100}%`,
                }}
                title={`Click to edit: "${nt.str.slice(0, 40)}"`}
              >
                <span className="absolute -top-4 left-0 hidden group-hover:block text-[9px] px-1 py-0.5 rounded bg-black/75 text-white whitespace-nowrap pointer-events-none">
                  Edit
                </span>
              </div>
            ))}
          </div>
        )}
        {/* Whiteouts */}
        {whiteouts.map((w) => (
          <div
            key={w.id}
            data-annotation="whiteout"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(w.id)
            }}
            className={`absolute bg-white ${selectedId === w.id ? 'ring-2 ring-[var(--color-primary)]/30' : ''} cursor-pointer`}
            style={{
              left: `${w.x * 100}%`,
              top: `${w.y * 100}%`,
              width: `${w.w * 100}%`,
              height: `${w.h * 100}%`,
            }}
            title="Whiteout — click to select, Delete to remove"
          />
        ))}
        {currentDrawRect && (
          <div
            className="absolute bg-white/90 border-2 border-dashed border-[var(--color-primary)] pointer-events-none"
            style={{
              left: `${currentDrawRect.x * 100}%`,
              top: `${currentDrawRect.y * 100}%`,
              width: `${currentDrawRect.w * 100}%`,
              height: `${currentDrawRect.h * 100}%`,
            }}
          />
        )}
        {/* Texts */}
        {texts.map((tbox) => (
          <TextOverlay
            key={tbox.id}
            box={tbox}
            selected={selectedId === tbox.id}
            onSelect={() => onSelect(tbox.id)}
            onUpdate={onTextUpdate}
            onMove={onTextMove}
            onDelete={onDelete}
          />
        ))}
        {/* Images */}
        {images.map((im) => (
          <div
            key={im.id}
            data-annotation="image"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(im.id)
            }}
            className={`absolute group cursor-move touch-none ${selectedId === im.id ? 'ring-2 ring-[var(--color-primary)]' : ''}`}
            style={{
              left: `${im.x * 100}%`,
              top: `${im.y * 100}%`,
              width: `${im.w * 100}%`,
              height: `${im.h * 100}%`,
            }}
            draggable={false}
            onMouseDown={(e) => {
              e.stopPropagation()
              const startX = e.clientX
              const startY = e.clientY
              const origX = im.x
              const origY = im.y
              const rect = containerRef.current!.getBoundingClientRect()
              const onMove = (ev: MouseEvent) => {
                const dx = (ev.clientX - startX) / rect.width
                const dy = (ev.clientY - startY) / rect.height
                onImageMove(im.id, Math.max(0, Math.min(1 - im.w, origX + dx)), Math.max(0, Math.min(1 - im.h, origY + dy)))
              }
              const onUp = () => {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          >
            <img src={im.src} alt="" className="w-full h-full object-contain bg-white pointer-events-none select-none" draggable={false} />
            {selectedId === im.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(im.id)
                  onDelete()
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red text-white flex items-center justify-center text-xs shadow-md cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {!rendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div className="text-xs text-[var(--color-text3)] flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              Rendering page…
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TextOverlay({
  box,
  selected,
  onSelect,
  onUpdate,
  onMove,
  onDelete,
}: {
  box: TextBox
  selected: boolean
  onSelect: () => void
  onUpdate: (id: string, patch: Partial<TextBox>) => void
  onMove: (id: string, x: number, y: number) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Drag handling
  const handleDragStart = (e: React.MouseEvent) => {
    if (editing) return
    e.stopPropagation()
    onSelect()
    const startX = e.clientX
    const startY = e.clientY
    const origX = box.x
    const origY = box.y
    const container = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect()
    const onMoveDrag = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / container.width
      const dy = (ev.clientY - startY) / container.height
      onMove(box.id, Math.max(0, Math.min(1 - box.w, origX + dx)), Math.max(0, Math.min(1 - box.h, origY + dy)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMoveDrag)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMoveDrag)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      data-annotation="text"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
        setTimeout(() => ref.current?.focus(), 50)
      }}
      onMouseDown={handleDragStart}
      className={`absolute group flex items-start ${selected ? 'ring-1 ring-[var(--color-primary)]' : 'hover:ring-1 hover:ring-gray-300'} cursor-move`}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.w * 100}%`,
        minHeight: `${box.h * 100}%`,
      }}
    >
      <div
        ref={ref}
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={(e) => {
          setEditing(false)
          const newText = (e.target as HTMLElement).innerText || ''
          if (newText !== box.text) onUpdate(box.id, { text: newText })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            ;(e.target as HTMLElement).blur()
          }
          if (e.key === 'Escape') {
            setEditing(false)
          }
          e.stopPropagation()
        }}
        className={`w-full min-h-[1.2em] px-1 py-0.5 outline-none whitespace-pre-wrap break-words ${editing ? 'bg-white border border-[var(--color-primary)] rounded' : 'bg-transparent'}`}
        style={{
          fontSize: `${box.fontSize}px`,
          color: box.color,
          fontFamily: box.family === 'Helvetica' ? 'Helvetica, Arial, sans-serif' : box.family === 'Times' ? 'Times New Roman, serif' : 'Courier New, monospace',
          fontWeight: box.bold ? 700 : 400,
          lineHeight: 1.2,
        }}
      >
        {box.text}
      </div>
      {selected && !editing && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red text-white flex items-center justify-center text-[10px] shadow cursor-pointer"
          >
            ✕
          </button>
          <span className="absolute -bottom-4 left-0 text-[9px] px-1 py-0.5 rounded bg-black/70 text-white whitespace-nowrap pointer-events-none">Double-click to edit • Drag to move</span>
        </>
      )}
    </div>
  )
}
