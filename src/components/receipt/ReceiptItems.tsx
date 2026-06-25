import type { LineItem } from '@/types/invoice'

interface Props {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  dp: number
}

export function ReceiptItems({ items, onChange, dp }: Props) {
  const updateItem = (idx: number, field: keyof LineItem, value: string) => {
    const next = items.map((item, i) => {
      if (i !== idx) return item
      const num = field === 'desc' ? 0 : Math.max(0, parseFloat(value) || 0)
      const updated = { ...item, [field]: field === 'desc' ? value : num }
      if (field !== 'desc') {
        const q = field === 'qty' ? num : item.qty
        const p = field === 'price' ? num : item.price
        updated.amount = parseFloat((q * p).toFixed(dp))
      }
      return updated
    })
    onChange(next)
  }

  const addRow = () => {
    onChange([...items, { desc: '', qty: 1, price: 0, amount: 0 }])
  }

  const removeRow = (idx: number) => {
    if (items.length <= 1) return
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((item, idx) => (
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
            {items.length > 1 && (
              <button
                onClick={() => removeRow(idx)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text3)] hover:text-red hover:bg-[var(--color-red-bg)] cursor-pointer transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addRow}
        className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-text3)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] cursor-pointer transition-colors"
      >
        + Add Item
      </button>
    </div>
  )
}
