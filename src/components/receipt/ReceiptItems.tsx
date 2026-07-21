import type { LineItem } from '@/types/invoice'
import { useApp } from '@/store/AppContext'

interface Props {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  dp: number
}

export function ReceiptItems({ items, onChange, dp }: Props) {
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

  const removeRow = (idx: number) => {
    if (items.length <= 1) return
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const taxAmt = item.amount * ((item.taxRate || 0) / 100)
          return (
            <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-input-border)]">
              <span className="text-xs text-[var(--color-text3)] font-medium w-5 shrink-0">{idx + 1}</span>
              <input
                value={item.desc}
                onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                placeholder="Item description"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={item.qty || ''}
                onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                className="w-16 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                placeholder="Qty"
              />
              <input
                type="number"
                min="0"
                step={1 / Math.pow(10, dp)}
                value={item.price || ''}
                onChange={(e) => updateItem(idx, 'price', e.target.value)}
                className="w-24 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                placeholder="Price"
              />
              <div className="w-24 text-right text-sm font-semibold text-[var(--color-text)] tabular-nums">
                {item.amount.toFixed(dp)}
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={item.taxRate || 0}
                onChange={(e) => updateItem(idx, 'taxRate', e.target.value)}
                className="w-16 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                placeholder="Tax%"
              />
              <div className="w-20 text-right text-xs text-[var(--color-text2)] tabular-nums">
                {(item.taxRate || 0) > 0 ? taxAmt.toFixed(dp) : '-'}
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => removeRow(idx)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text3)] hover:text-red hover:bg-[var(--color-red-bg)] cursor-pointer transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={addRow}
          className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-text3)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] cursor-pointer transition-colors"
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
            className="px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-text)] outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
          >
            <option value="">+ Add Saved Product</option>
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.price.toFixed(dp)})</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
