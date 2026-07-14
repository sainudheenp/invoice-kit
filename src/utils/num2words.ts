import type { Currency } from '@/types/currency'

const _ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]

const _TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function _h(n: number): string {
  if (n === 0) return ''
  let s = ''
  if (n >= 100) { s += _ONES[Math.floor(n / 100)] + ' Hundred '; n %= 100 }
  if (n >= 20) { s += _TENS[Math.floor(n / 10)] + ' '; n %= 10 }
  if (n > 0) s += _ONES[n] + ' '
  return s
}

function _t(n: number): string {
  if (n === 0) return 'Zero'
  if (n < 0) return ''
  let s = ''
  const groups = [
    [1_000_000_000, 'Billion '],
    [1_000_000, 'Million '],
    [1_000, 'Thousand '],
  ] as const
  let remaining = n
  for (const [divisor, label] of groups) {
    const q = Math.floor(remaining / divisor)
    if (q > 0) { s += _h(q) + label; remaining %= divisor }
  }
  s += _h(remaining)
  return s.trim()
}

export function num2words(num: number, cur: Currency): string {
  const whole = Math.floor(num)
  const frac = Math.round((num - whole) * cur.subPer)
  const wholeW = _t(whole)
  const wholeLabel = whole === 1 ? cur.name : cur.namePl
  let result = `${wholeW} ${wholeLabel}`
  if (frac > 0) {
    const fracW = _t(frac)
    const fracLabel = frac === 1 ? cur.sub : cur.subPl
    result += ` and ${fracW} ${fracLabel}`
  }
  return result 
}
