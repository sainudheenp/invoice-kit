export function dp(subPer: number): number {
  if (!subPer || subPer <= 0) return 2
  if (subPer === 1) return 0
  const raw = Math.log10(subPer)
  if (!isFinite(raw)) return 2
  // Round to nearest integer and clamp 0..6 (covers 1..1_000_000)
  const n = Math.round(raw)
  return Math.max(0, Math.min(6, n))
}

export function fmtAmount(amount: number, decimals: number): string {
  const d = Math.max(0, Math.min(6, Math.round(decimals)))
  const safe = isFinite(amount) ? amount : 0
  return safe.toFixed(d)
}

export function invStatus(d: { paid: boolean }): { lbl: string; cls: string } {
  if (d.paid) return { lbl: 'Paid', cls: 'green' }
  return { lbl: 'Unpaid', cls: 'amber' }
}
