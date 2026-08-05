import { useState, type FormEvent } from 'react'
import { useApp } from '@/store/AppContext'
import { Svg } from '@/icons'

interface CustomerPickerProps {
  companyId: string | null
  currentName: string
  onPick: (customer: { name: string; address: string; phone: string; cr: string; email: string }) => void
  compact?: boolean
}

export function CustomerPicker({ companyId, currentName, onPick, compact = false }: CustomerPickerProps) {
  const { state } = useApp()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const saved = state.customers.filter((c) => c.companyId === companyId)

  const matches = saved.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const chosen = currentName ? saved.find((c) => c.name === currentName) : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const found = matches[0]
    if (found) {
      onPick(found)
      setOpen(false)
      setQuery('')
    }
  }

  if (saved.length === 0) return null

  return (
    <div className={compact ? '' : 'relative'}>
      {chosen ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] text-xs font-semibold">
            <Svg name="users" className="w-3.5 h-3.5" />
            {chosen.name}
          </span>
          <button
            type="button"
            onClick={() => { onPick({ name: '', address: '', phone: '', cr: '', email: '' }); setOpen(false) }}
            className="text-xs text-[var(--color-text3)] hover:text-red transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
        >
          <Svg name="users" className="w-3.5 h-3.5" />
          {open ? 'Close saved list' : 'Pick a saved customer'}
        </button>
      )}

      {open && !chosen && (
        <div className={`z-20 ${compact ? 'mt-1' : 'absolute right-0 top-full mt-2 w-72'} surface p-2 shadow-[var(--shadow-pop)]`}>
          <form onSubmit={handleSubmit} className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text3)]">
              <Svg name="search" className="w-3.5 h-3.5" />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-xs outline-none focus:border-[var(--color-primary)]"
            />
          </form>
          <ul className="max-h-52 overflow-y-auto mt-1 space-y-0.5">
            {matches.length === 0 && (
              <li className="text-xs text-[var(--color-text3)] px-2 py-1.5">No matches</li>
            )}
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => { onPick({ name: c.name, address: c.address, phone: c.phone, cr: c.cr, email: c.email }); setOpen(false); setQuery('') }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[var(--color-primary-bg)] transition-colors cursor-pointer"
                >
                  <div className="text-xs font-medium text-[var(--color-text)]">{c.name}{c.phone && <span className="text-[var(--color-text3)] font-normal"> &middot; {c.phone}</span>}</div>
                  {c.email && <div className="text-[10px] text-[var(--color-text3)] truncate">{c.email}</div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}