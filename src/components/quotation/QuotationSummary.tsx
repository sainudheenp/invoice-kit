import type { ReactNode } from 'react'

interface Props {
  subtotal: number
  totalTax: number
  discount: number
  grand: number
  words: string
  dp: number
  curSymbol: string
  children?: ReactNode
}

export function QuotationSummary({ subtotal, totalTax, discount, grand, words, dp, curSymbol, children }: Props) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm p-5 lg:sticky lg:top-4 space-y-4">
      <h3 className="text-sm font-semibold">Total Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text2)]">Subtotal</span>
          <span>{curSymbol}{subtotal.toFixed(dp)}</span>
        </div>
        {totalTax > 0 && (
          <div className="flex justify-between">
            <span>Total Tax</span>
            <span>{curSymbol}{totalTax.toFixed(dp)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-red">
            <span>Discount</span>
            <span>-{curSymbol}{discount.toFixed(dp)}</span>
          </div>
        )}
        <div className="border-t border-[var(--color-border)] my-2" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{curSymbol}{grand.toFixed(dp)}</span>
        </div>
        {words && (
          <div className="text-xs text-[var(--color-text3)] italic pt-2 border-t border-[var(--color-border)]">
            {words}
          </div>
        )}
      </div>
      {children && <div className="border-t border-[var(--color-border)]" />}
      {children}
    </div>
  )
}
