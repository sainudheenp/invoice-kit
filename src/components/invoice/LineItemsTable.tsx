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
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-input-bg)]">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text2)] px-3 py-2.5 w-[40%]">Description</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text2)] px-3 py-2.5 w-[10%]">Qty</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text2)] px-3 py-2.5 w-[15%]">Rate</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text2)] px-3 py-2.5 w-[15%]">Tax %</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text2)] px-3 py-2.5 w-[15%]">Total</th>
              <th className="px-2 py-2.5 w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const taxAmt = item.amount * ((item.taxRate || 0) / 100)
              const lineTotal = item.amount + taxAmt
              const hasTax = (item.taxRate || 0) > 0
              return (
                <tr key={idx} className="border-t border-[var(--color-border)] hover:bg-[var(--color-input-bg)]/60 transition-colors group">
                  <td className="px-3 py-2">
                    <input
                      value={item.desc}
                      onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text3)]/60"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.qty || ''}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      className="w-full bg-transparent text-sm text-right tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step={1 / Math.pow(10, dp)}
                      value={item.price || ''}
                      onChange={(e) => updateItem(idx, 'price', e.target.value)}
                      className="w-full bg-transparent text-sm text-right tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate || ''}
                        onChange={(e) => updateItem(idx, 'taxRate', e.target.value)}
                        className="w-14 bg-transparent text-sm text-right tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                      {hasTax && (
                        <span className="text-[10px] text-[var(--color-text3)] tabular-nums whitespace-nowrap">
                          {taxAmt.toFixed(dp)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums">
                    {lineTotal.toFixed(dp)}
                  </td>
                  <td className="px-2 py-2">
                    {items.length > 1 && (
                      <button
                        onClick={() => {
                          const next = items.filter((_, i) => i !== idx)
                          onChange(next)
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text3)] opacity-0 group-hover:opacity-100 hover:text-red hover:bg-[var(--color-red-bg)] transition-all cursor-pointer"
                        title="Remove item"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
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
