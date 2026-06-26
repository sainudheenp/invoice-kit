export function dp(subPer: number): number {
  return Math.log10(subPer)
}

export function fmtAmount(amount: number, decimals: number): string {
  return amount.toFixed(decimals)
}

export function invStatus(d: { paid: boolean }): { lbl: string; cls: string } {
  if (d.paid) return { lbl: 'Paid', cls: 'green' }
  return { lbl: 'Unpaid', cls: 'amber' }
}
