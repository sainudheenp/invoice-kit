import type { LineItem } from '@/types/invoice'

interface LineItemEditorProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  dp: number
  layout?: 'table' | 'card'
  showTax?: boolean
}

export function LineItemEditor({ items, onChange, dp, layout = 'table', showTax = true }: LineItemEditorProps) {
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

  const cols = showTax ? 5 : 4

  if (layout === 'card') {
    return (
      <div>
        <div className="space-y-2">
          {items.map((item, idx) => {
            const taxAmt = showTax ? item.amount * ((item.taxRate || 0) / 100) : 0
            const lineTotal = showTax ? item.amount + taxAmt : item.amount
            return (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-input-border)]">
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
                  className="w-16 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Qty"
                />
                <input
                  type="number"
                  min="0"
                  step={1 / Math.pow(10, dp)}
                  value={item.price || ''}
                  onChange={(e) => updateItem(idx, 'price', e.target.value)}
                  className="w-24 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Price"
                />
                {showTax && (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.taxRate || ''}
                    onChange={(e) => updateItem(idx, 'taxRate', e.target.value)}
                    className="w-16 px-2 py-2 rounded-lg border border-[var(--color-input-border)] bg-white dark:bg-[#3a3a3a] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Tax%"
                  />
                )}
                <div className="w-24 text-right text-sm font-semibold text-[var(--color-text)] tabular-nums">
                  {lineTotal.toFixed(dp)}
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
        <button
          onClick={addRow}
          className="w-full mt-3 py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-text3)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] cursor-pointer transition-colors"
        >
          + Add Item
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[var(--color-border)]">
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text2)] w-[40%]">Description</th>
              <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text2)] w-[10%]">Qty</th>
              <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text2)] w-[15%]">Rate</th>
              {showTax && <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text2)] w-[18%]">Tax %</th>}
              <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text2)] w-[17%]">Total</th>
              <th className="pb-2 w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const taxAmt = showTax ? item.amount * ((item.taxRate || 0) / 100) : 0
              const lineTotal = showTax ? item.amount + taxAmt : item.amount
              const hasTax = showTax && (item.taxRate || 0) > 0
              return (
                <tr key={idx} className="border-b border-[var(--color-border)]/40 group">
                  <td className="py-2 pr-3">
                    <input
                      value={item.desc}
                      onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text3)]/50"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.qty || ''}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      className="w-full bg-transparent text-sm text-right tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="0"
                      step={1 / Math.pow(10, dp)}
                      value={item.price || ''}
                      onChange={(e) => updateItem(idx, 'price', e.target.value)}
                      className="w-full bg-transparent text-sm text-right tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  {showTax && (
                    <td className="py-2 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.taxRate || ''}
                          onChange={(e) => updateItem(idx, 'taxRate', e.target.value)}
                          className="w-12 bg-transparent text-sm text-right tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                        />
                        {hasTax && (
                          <span className="text-[11px] text-[var(--color-text3)] tabular-nums whitespace-nowrap">
                            % ({taxAmt.toFixed(dp)})
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="py-2 pl-2 text-right text-sm font-medium tabular-nums">
                    {lineTotal.toFixed(dp)}
                  </td>
                  <td className="py-2 pl-1">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeRow(idx)}
                        className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text3)] opacity-0 group-hover:opacity-100 hover:text-red hover:bg-red/10 transition-all cursor-pointer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        className="w-full mt-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text3)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
      >
        + Add Row
      </button>
    </div>
  )
}
