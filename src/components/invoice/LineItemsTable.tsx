import type { LineItem } from '@/types/invoice'

interface Props {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  dp: number
}

export function LineItemsTable({ items, onChange, dp }: Props) {
  const updateItem = (idx: number, field: keyof LineItem, value: string) => {
    const next = items.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: field === 'desc' ? value : parseFloat(value) || 0 }
      if (field !== 'desc') {
        const q = field === 'qty' ? parseFloat(value) || 0 : item.qty
        const p = field === 'price' ? parseFloat(value) || 0 : item.price
        updated.amount = parseFloat((q * p).toFixed(dp))
      }
      return updated
    })
    onChange(next)
  }

  const addRow = () => {
    onChange([...items, { desc: '', qty: 1, price: 0, amount: 0 }])
  }

  const removeRow = () => {
    if (items.length <= 1) return
    onChange(items.slice(0, -1))
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text2)] text-xs">
              <th className="py-2 px-2 text-left w-8">#</th>
              <th className="py-2 px-2 text-left">Description</th>
              <th className="py-2 px-2 text-right w-20">Qty</th>
              <th className="py-2 px-2 text-right w-28">Price</th>
              <th className="py-2 px-2 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-[var(--color-border)]/50">
                <td className="py-1.5 px-2 text-[var(--color-text3)] text-xs">{idx + 1}</td>
                <td className="py-1.5 px-2">
                  <input
                    value={item.desc}
                    onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                    placeholder="Item description"
                  />
                </td>
                <td className="py-1.5 px-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.qty}
                    onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                  />
                </td>
                <td className="py-1.5 px-2">
                  <input
                    type="number"
                    min="0"
                    step={1 / Math.pow(10, dp)}
                    value={item.price}
                    onChange={(e) => updateItem(idx, 'price', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm text-right outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                  />
                </td>
                <td className="py-1.5 px-2 text-right font-medium">
                  {item.amount.toFixed(dp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={addRow} className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-input-bg)] cursor-pointer transition-colors">
          + Add Row
        </button>
        {items.length > 1 && (
          <button onClick={removeRow} className="text-xs px-3 py-1.5 rounded-full border border-red/30 text-red hover:bg-red-bg cursor-pointer transition-colors">
            - Remove
          </button>
        )}
      </div>
    </div>
  )
}
