import type { LineItem } from '@/types/invoice'
import { useApp } from '@/store/AppContext'

interface Props {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  dp: number
}

export function LineItemsTable({ items, onChange, dp }: Props) {
  const { state } = useApp()
  const coId = state.activeId
  const activeProducts = state.products.filter((p) => p.companyId === coId)

  const updateItem = (idx: number, field: keyof LineItem, value: string) => {
    const next = items.map((item, i) => {
      if (i !== idx) return item
      if (field === 'desc') return { ...item, desc: value }
      const num = Math.max(0, parseFloat(value) || 0)
      const updated = { ...item, [field]: num }
      if (field === 'qty' || field === 'price') {
        updated.amount = parseFloat((updated.qty * updated.price).toFixed(dp))
      }
      return updated
    })
    onChange(next)
  }

  const addRow = () => {
    onChange([...items, { desc: '', qty: 1, price: 0, amount: 0, taxRate: 0 }])
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const taxAmt = item.amount * ((item.taxRate || 0) / 100)
        const lineTotal = item.amount + taxAmt
        const hasTax = (item.taxRate || 0) > 0
        return (
          <div
            key={idx}
            className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary-border)] transition-colors group"
          >
            <div className="flex-1 min-w-[140px]">
              <input
                value={item.desc}
                onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                placeholder="Item description"
              />
            </div>
            <div className="w-16">
              <input
                type="number"
                min="0"
                step="1"
                value={item.qty || ''}
                onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Qty"
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                min="0"
                step={1 / Math.pow(10, dp)}
                value={item.price || ''}
                onChange={(e) => updateItem(idx, 'price', e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Rate"
              />
            </div>
            <div className="w-20">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={item.taxRate || ''}
                  onChange={(e) => updateItem(idx, 'taxRate', e.target.value)}
                  className="w-14 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                {hasTax && (
                  <span className="text-[10px] text-[var(--color-text3)] tabular-nums whitespace-nowrap">
                    {taxAmt.toFixed(dp)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-20 text-right text-sm font-semibold tabular-nums text-[var(--color-text)]">
              {lineTotal.toFixed(dp)}
            </div>
            {items.length > 1 && (
              <button
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx)
                  onChange(next)
                }}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text3)] hover:text-red hover:bg-[var(--color-red-bg)] cursor-pointer transition-colors"
                title="Remove item"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )
      })}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={addRow}
          className="flex-1 min-w-[140px] py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-text3)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] transition-colors cursor-pointer"
        >
          + Add Item
        </button>
        {activeProducts.length > 0 && (
          <select
            onChange={(e) => {
              const found = activeProducts.find((p) => p.id === e.target.value)
              if (found) {
                const last = items[items.length - 1]
                if (last && !last.desc.trim() && last.price === 0) {
                  const next = [...items]
                  next[items.length - 1] = {
                    desc: found.name + (found.desc ? ` - ${found.desc}` : ''),
                    qty: 1,
                    price: found.price,
                    amount: found.price,
                    taxRate: 0,
                  }
                  onChange(next)
                } else {
                  onChange([...items, {
                    desc: found.name + (found.desc ? ` - ${found.desc}` : ''),
                    qty: 1,
                    price: found.price,
                    amount: found.price,
                    taxRate: 0,
                  }])
                }
              }
              e.target.value = ''
            }}
            className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-text)] outline-none cursor-pointer"
          >
            <option value="">+ Saved Product</option>
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.price.toFixed(dp)})</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
