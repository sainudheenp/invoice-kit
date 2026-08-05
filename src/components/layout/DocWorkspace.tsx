import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Svg } from '@/icons'

interface DocWorkspaceProps {
  title: string
  subtitle: string
  badge?: ReactNode
  previewHtml: string
  panel: ReactNode
  children: ReactNode
}

const TEMPLATE_WIDTH = 794
const TEMPLATE_HEIGHT = 1123

export function DocWorkspace({
  title,
  subtitle,
  badge,
  previewHtml,
  panel,
  children,
}: DocWorkspaceProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / TEMPLATE_WIDTH))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="page-enter grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:h-[calc(100dvh-6rem)] lg:min-h-[520px]">
      {/* Left column: header + scrollable form */}
      <div className="min-w-0 flex flex-col">
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-[var(--color-text2)] mt-0.5">{subtitle}</p>
          </div>
          {badge}
        </header>
        <div className="min-h-0 lg:overflow-y-auto lg:pr-2 lg:-mr-2 space-y-4 lg:space-y-5">
          {children}
        </div>
      </div>

      {/* Right column: fixed preview + action panel */}
      <div className="hidden lg:flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-white/80 rounded-t-2xl">
          <Svg name="file" className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm font-semibold text-[var(--color-text3)]">Live Preview</span>
        </div>
        <div className="surface overflow-hidden min-h-0 flex-1">
          <div ref={previewRef} className="h-full overflow-auto bg-white">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="Document preview"
                className="border-none bg-white pointer-events-none"
                style={{
                  width: TEMPLATE_WIDTH,
                  height: TEMPLATE_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-sm text-[var(--color-text3)]">
                Fill in the details to see the live preview
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {panel}
        </div>
      </div>

      {/* Mobile: preview + panel below the form */}
      <div className="lg:hidden space-y-4">
        <div className="surface overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--color-border)] flex items-center gap-2">
            <Svg name="file" className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-semibold text-[var(--color-text3)]">Preview</span>
          </div>
          <div className="overflow-auto bg-white">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="Document preview"
                className="w-full border-none"
                style={{ height: 420 }}
              />
            ) : (
              <div className="p-8 text-sm text-[var(--color-text3)]">Fill in the details</div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {panel}
        </div>
      </div>
    </div>
  )
}