export function mailtoLink(opts: {
  to?: string
  subject?: string
  body?: string
}): string {
  const parts: string[] = []
  if (opts.subject) parts.push(`subject=${encodeURIComponent(opts.subject)}`)
  if (opts.body) parts.push(`body=${encodeURIComponent(opts.body)}`)
  const qs = parts.join('&')
  const to = (opts.to || '').trim()
  return `mailto:${encodeURIComponent(to)}${qs ? '?' + qs : ''}`
}

export function sendDocumentEmail(opts: {
  to: string
  docType: string
  docNo: string
  companyName: string
  grandTotal: string
}): void {
  if (!opts.to || !opts.to.trim()) return
  // Cap mailto URL length — most clients reject > ~2000 chars
  const MAX_MAILTO = 1900
  const subject = `${opts.docType} ${opts.docNo} from ${opts.companyName}`
  let body = `Dear Customer,\n\nPlease find attached ${opts.docType.toLowerCase()} ${opts.docNo} for ${opts.grandTotal}.\n\nBest regards,\n${opts.companyName}`
  let link = mailtoLink({ to: opts.to, subject, body })
  if (link.length > MAX_MAILTO) {
    // Truncate body to fit
    const overhead = mailtoLink({ to: opts.to, subject, body: '' }).length
    const avail = Math.max(0, MAX_MAILTO - overhead - 30)
    body = body.slice(0, avail) + '...'
    link = mailtoLink({ to: opts.to, subject, body })
  }
  window.location.href = link
}
