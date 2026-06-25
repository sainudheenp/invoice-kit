interface Props {
  amount: number
  words: string
  dp: number
  curSymbol: string
}

export function ReceiptSummary({ amount, words, dp, curSymbol }: Props) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm p-5 sticky top-4">
      <h3 className="text-sm font-semibold mb-4">Receipt Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text2)]">Amount</span>
          <span>{curSymbol}{amount.toFixed(dp)}</span>
        </div>
        <div className="border-t border-[var(--color-border)] my-2" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{curSymbol}{amount.toFixed(dp)}</span>
        </div>
        {words && (
          <div className="text-xs text-[var(--color-text3)] italic pt-2 border-t border-[var(--color-border)]">
            {words}
          </div>
        )}
      </div>
    </div>
  )
}
