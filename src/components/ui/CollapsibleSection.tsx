import { useState, type ReactNode } from 'react'
import { Svg } from '@/icons'

interface CollapsibleSectionProps {
  title: ReactNode
  right?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  alwaysOpen?: boolean
}

export function CollapsibleSection({
  title,
  right,
  children,
  defaultOpen = true,
  alwaysOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const isOpen = alwaysOpen || open

  return (
    <div className="surface">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3">
        <div className="text-sm font-semibold flex items-center gap-2 min-w-0">
          {title}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {right}
          {!alwaysOpen && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Collapse' : 'Expand'}
              className="p-1 rounded-md hover:bg-[var(--color-input-bg)] cursor-pointer transition-transform"
            >
              <span className={`inline-flex items-center transition-transform ${isOpen ? '' : 'rotate-180'}`}>
                <Svg name="chevron" className="w-4 h-4" />
              </span>
            </button>
          )}
        </div>
      </div>
      {isOpen && <div className="p-6">
        {children}
      </div>}
    </div>
  )
}