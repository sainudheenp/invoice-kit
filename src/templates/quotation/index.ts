export { QuotationClassic } from './Classic'

import type { QuotTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { genericDoc } from '../shared'

export function QuotationModern(d: QuotTemplateData) { return genericDoc(d, 'Quotation', `${esc(d.no)} | ${d.dt}${d.validDt ? ' | Valid: ' + d.validDt : ''}`, `${quotTerms(d)}`) }
export function QuotationCompact(d: QuotTemplateData) { return genericDoc(d, 'Quotation', `${esc(d.no)} | ${d.dt}${d.validDt ? ' | Valid: ' + d.validDt : ''}`, `${quotTerms(d)}`) }
export function QuotationMinimal(d: QuotTemplateData) { return genericDoc(d, 'Quotation', `${esc(d.no)} | ${d.dt}${d.validDt ? ' | Valid: ' + d.validDt : ''}`, `${quotTerms(d)}`) }
export function QuotationElegant(d: QuotTemplateData) { return genericDoc(d, 'Quotation', `${esc(d.no)} | ${d.dt}${d.validDt ? ' | Valid: ' + d.validDt : ''}`, `${quotTerms(d)}`) }
export function QuotationBold(d: QuotTemplateData) { return genericDoc(d, 'Quotation', `${esc(d.no)} | ${d.dt}${d.validDt ? ' | Valid: ' + d.validDt : ''}`, `${quotTerms(d)}`) }
export function QuotationProfessional(d: QuotTemplateData) { return genericDoc(d, 'Quotation', `${esc(d.no)} | ${d.dt}${d.validDt ? ' | Valid: ' + d.validDt : ''}`, `${quotTerms(d)}`) }

function quotTerms(d: QuotTemplateData): string {
  const c = d.comp
  let html = ''
  if (d.terms) html += `<div style="font-size:12px"><strong>Terms:</strong> ${esc(d.terms)}</div>`
  if (c.invTerms) html += `<div style="font-size:12px"><strong>Terms:</strong> ${esc(c.invTerms)}</div>`
  return html
}
