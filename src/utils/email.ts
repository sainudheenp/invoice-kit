export function mailtoLink(opts: {
  to?: string
  subject?: string
  body?: string
}): string {
  const params = new URLSearchParams()
  if (opts.subject) params.set('subject', opts.subject)
  if (opts.body) params.set('body', opts.body)
  const qs = params.toString()
  return `mailto:${opts.to || ''}${qs ? '?' + qs : ''}`
}

export function sendDocumentEmail(opts: {
  to: string
  docType: string
  docNo: string
  companyName: string
  grandTotal: string
}): void {
  const subject = `${opts.docType} ${opts.docNo} from ${opts.companyName}`
  const body = `Dear Customer,\n\nPlease find attached ${opts.docType.toLowerCase()} ${opts.docNo} for ${opts.grandTotal}.\n\nBest regards,\n${opts.companyName}`
  const link = mailtoLink({ to: opts.to, subject, body })
  window.open(link, '_blank')
}
