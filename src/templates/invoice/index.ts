export { InvoiceClassic } from './Classic'
export { InvoiceModern } from './Modern'

import type { InvTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { genericDoc } from '../shared'

export function InvoiceCompact(d: InvTemplateData) { return genericDoc(d, 'Invoice', `${esc(d.no)} | ${d.dt}`, `${cInvTerms(d)}`) }
export function InvoiceMinimal(d: InvTemplateData) { return genericDoc(d, 'Invoice', `${esc(d.no)} | ${d.dt}`, `${cInvTerms(d)}`) }
export function InvoiceElegant(d: InvTemplateData) { return genericDoc(d, 'Invoice', `${esc(d.no)} | ${d.dt}`, `${cInvTerms(d)}`) }
export function InvoiceBold(d: InvTemplateData) { return genericDoc(d, 'Invoice', `${esc(d.no)} | ${d.dt}`, `${cInvTerms(d)}`) }
export function InvoiceProfessional(d: InvTemplateData) { return genericDoc(d, 'Invoice', `${esc(d.no)} | ${d.dt}`, `${cInvTerms(d)}`) }

function cInvTerms(d: InvTemplateData): string {
  const c = d.comp
  return c.invTerms ? `<div style="font-size:12px"><strong>Terms:</strong> ${esc(c.invTerms)}</div>` : ''
}
