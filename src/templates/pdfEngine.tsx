/**
 * @react-pdf/renderer — complete PDF engine.
 *
 * Generates REAL text-based PDFs (copyable, searchable, vector).
 * Each template is a React component tree rendered via @react-pdf/renderer.
 *
 * All 7 templates × Invoice / Receipt / Quotation supported.
 */
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer'
import type { InvTemplateData, RecTemplateData, QuotTemplateData } from '@/types/template'

// ─── Font Registration ────────────────────────────────────────────────────────
// Register Inter from Google Fonts (subset via CDN)
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2',
      fontWeight: 700,
    },
  ],
})

Font.registerHyphenationCallback((w) => [w])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function s(v: string | null | undefined): string {
  return v || ''
}

function hexToRgba(hex: string, alpha = 1): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}

function lightenHex(hex: string, amt = 0.9): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const n = parseInt(full, 16)
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amt)
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amt)
  const b = Math.round((n & 255) + (255 - (n & 255)) * amt)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ─── Shared sub-components ────────────────────────────────────────────────────

const PAGE_STYLE = {
  fontFamily: 'Inter',
  fontSize: 9,
  color: '#1e293b',
  backgroundColor: '#ffffff',
}

// Items table shared across all invoice / quotation templates
function ItemsTable({
  items,
  dp,
  symbol,
  headerBg,
  headerColor = '#ffffff',
  rowAlt = '#f8fafc',
  borderColor = '#e2e8f0',
}: {
  items: { desc: string; qty: number; price: number; amount: number }[]
  dp: number
  symbol: string
  headerBg: string
  headerColor?: string
  rowAlt?: string
  borderColor?: string
}) {
  const col = StyleSheet.create({
    th: {
      backgroundColor: headerBg,
      color: headerColor,
      fontSize: 8,
      fontWeight: 700,
      padding: '5 6',
    },
    td: {
      fontSize: 8.5,
      color: '#334155',
      padding: '5 6',
      borderBottom: `0.5 solid ${borderColor}`,
    },
    no: { width: 22, textAlign: 'center' },
    desc: { flex: 1 },
    qty: { width: 32, textAlign: 'right' },
    price: { width: 52, textAlign: 'right' },
    amt: { width: 52, textAlign: 'right' },
  })

  return (
    <View style={{ marginTop: 8 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', backgroundColor: headerBg }}>
        <Text style={[col.th, col.no]}>#</Text>
        <Text style={[col.th, col.desc]}>Description</Text>
        <Text style={[col.th, col.qty]}>Qty</Text>
        <Text style={[col.th, col.price]}>Unit Price</Text>
        <Text style={[col.th, col.amt]}>Amount</Text>
      </View>
      {/* Rows */}
      {items.map((item, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            backgroundColor: i % 2 === 1 ? rowAlt : '#ffffff',
          }}
          wrap={false}
        >
          <Text style={[col.td, col.no]}>{i + 1}</Text>
          <Text style={[col.td, col.desc]}>{s(item.desc)}</Text>
          <Text style={[col.td, col.qty]}>{item.qty}</Text>
          <Text style={[col.td, col.price]}>
            {symbol}
            {item.price.toFixed(dp)}
          </Text>
          <Text style={[col.td, col.amt]}>
            {symbol}
            {item.amount.toFixed(dp)}
          </Text>
        </View>
      ))}
    </View>
  )
}

// Totals block
function TotalsBlock({
  d,
  accentBg,
  accentText = '#ffffff',
  labelColor = '#64748b',
  valueColor,
}: {
  d: InvTemplateData | QuotTemplateData
  accentBg: string
  accentText?: string
  labelColor?: string
  valueColor?: string
}) {
  const vc = valueColor || accentBg
  const rows: [string, string][] = [
    ['Subtotal', `${d.cur.symbol}${d.sv}`],
  ]
  if (d.vp > 0) rows.push([`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`])
  if (d.disc > 0) rows.push(['Discount', `-${d.cur.symbol}${d.dv}`])

  return (
    <View style={{ marginTop: 10, alignSelf: 'flex-end', width: 180 }}>
      {rows.map(([label, val]) => (
        <View
          key={label}
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}
        >
          <Text style={{ fontSize: 8.5, color: labelColor }}>{label}</Text>
          <Text style={{ fontSize: 8.5, color: vc, fontWeight: 600 }}>{val}</Text>
        </View>
      ))}
      {/* Grand Total */}
      <View
        style={{
          backgroundColor: accentBg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '7 8',
          marginTop: 4,
          borderRadius: 2,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: 700, color: accentText }}>Grand Total</Text>
        <Text style={{ fontSize: 10, fontWeight: 700, color: accentText }}>
          {d.cur.symbol}
          {d.gv}
        </Text>
      </View>
      {d.gw ? (
        <Text
          style={{ fontSize: 7.5, color: '#94a3b8', fontStyle: 'italic', marginTop: 4, textAlign: 'right' }}
        >
          {d.gw}
        </Text>
      ) : null}
    </View>
  )
}

// Notes box (payment, notes, terms)
function NotesBox({
  pd,
  notes,
  terms,
  accentBg,
  borderColor,
}: {
  pd?: string
  notes?: string
  terms?: string
  accentBg: string
  borderColor: string
}) {
  const lines = [pd && `Payment: ${pd}`, notes, terms].filter(Boolean) as string[]
  if (!lines.length) return null
  return (
    <View
      style={{
        marginTop: 10,
        padding: '8 10',
        backgroundColor: lightenHex(accentBg, 0.92),
        borderLeft: `3 solid ${accentBg}`,
        borderRadius: 2,
      }}
      wrap={false}
    >
      {lines.map((line, i) => (
        <Text key={i} style={{ fontSize: 8, color: '#475569', marginTop: i > 0 ? 3 : 0 }}>
          {line}
        </Text>
      ))}
    </View>
  )
}

// Signature row
function SigRow({
  comp,
  accentBg,
}: {
  comp: { name: string; signature?: string; seal?: string }
  accentBg: string
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, alignItems: 'flex-end' }}>
      {/* Seal left */}
      <View style={{ width: 70 }}>
        {comp.seal ? (
          <Image src={comp.seal} style={{ maxWidth: 60, maxHeight: 50, objectFit: 'contain' }} />
        ) : (
          <View />
        )}
      </View>
      {/* Signature right */}
      <View style={{ alignItems: 'center', width: 120 }}>
        {comp.signature ? (
          <Image
            src={comp.signature}
            style={{ maxWidth: 100, maxHeight: 40, objectFit: 'contain', marginBottom: 3 }}
          />
        ) : null}
        <View style={{ borderTop: `1 solid ${accentBg}`, width: 120, marginBottom: 3 }} />
        <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 0.5 }}>AUTHORIZED SIGNATURE</Text>
        <Text style={{ fontSize: 8, color: accentBg, fontWeight: 700, marginTop: 2 }}>{s(comp.name)}</Text>
      </View>
    </View>
  )
}

// Footer
function Footer({
  comp,
  accentBg,
}: {
  comp: { name: string; loc?: string; tel?: string; email?: string; bankName?: string; bankAcc?: string; bankIban?: string }
  accentBg: string
}) {
  const parts = [s(comp.name), comp.loc, comp.tel, comp.email].filter(Boolean).join('  ·  ')
  const bank = comp.bankName
    ? [comp.bankName, comp.bankAcc, comp.bankIban].filter(Boolean).join('  ·  ')
    : null

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 18,
        left: 28,
        right: 28,
        borderTop: `0.5 solid ${lightenHex(accentBg, 0.6)}`,
        paddingTop: 5,
      }}
      fixed
    >
      <Text style={{ fontSize: 7, color: '#94a3b8', textAlign: 'center' }}>{parts}</Text>
      {bank ? (
        <Text style={{ fontSize: 6.5, color: '#94a3b8', textAlign: 'center', marginTop: 2 }}>{bank}</Text>
      ) : null}
    </View>
  )
}

// ─── INVOICE DOCUMENTS ────────────────────────────────────────────────────────

// ── Classic ───────────────────────────────────────────────────────────────────
function InvoiceClassicDoc({ d }: { d: InvTemplateData }) {
  const p = d.comp.pcolor || '#1f2937'
  const light = lightenHex(p, 0.92)

  return (
    <Document>
      <Page size="A4" style={{ ...PAGE_STYLE, paddingTop: 0, paddingBottom: 50, paddingHorizontal: 32 }}>
        {/* Top accent bar */}
        <View style={{ height: 5, backgroundColor: p, marginHorizontal: -32 }} />

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {d.comp.logo ? (
              <Image src={d.comp.logo} style={{ maxHeight: 40, maxWidth: 60, objectFit: 'contain' }} />
            ) : null}
            <View>
              <Text style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s(d.comp.name)}</Text>
              {d.comp.sub ? <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>{d.comp.sub}</Text> : null}
              {[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).length ? (
                <Text style={{ fontSize: 7.5, color: '#94a3b8', marginTop: 2 }}>
                  {[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join('  |  ')}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 18, fontWeight: 700, color: p, letterSpacing: 0.5 }}>TAX INVOICE</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{s(d.no)}</Text>
          </View>
        </View>

        {/* Info bar */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: light,
            padding: '10 12',
            marginTop: 14,
            borderTop: `2 solid ${p}`,
            borderBottom: `2 solid ${p}`,
          }}
        >
          <View>
            <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.8 }}>BILL TO</Text>
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s(d.cust)}</Text>
            <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 2 }}>
              {[d.addr, d.ph, d.cr, d.em].filter(Boolean).join('  |  ')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.8 }}>DATE</Text>
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s(d.dt)}</Text>
            {d.comp.vatReg ? (
              <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 2 }}>VAT: {d.comp.vatReg}</Text>
            ) : null}
          </View>
        </View>

        <ItemsTable items={d.items} dp={d.dp} symbol={d.cur.symbol} headerBg={p} rowAlt={light} borderColor={lightenHex(p, 0.7)} />
        <TotalsBlock d={d} accentBg={p} />
        <NotesBox pd={d.pd} notes={d.notes} terms={d.comp.invTerms} accentBg={p} borderColor={lightenHex(p, 0.6)} />
        <SigRow comp={d.comp} accentBg={p} />
        <Footer comp={d.comp} accentBg={p} />
      </Page>
    </Document>
  )
}

// ── Modern ────────────────────────────────────────────────────────────────────
function InvoiceModernDoc({ d }: { d: InvTemplateData }) {
  const p = d.comp.pcolor || '#D97706'
  const light = lightenHex(p, 0.92)

  return (
    <Document>
      <Page size="A4" style={{ ...PAGE_STYLE, paddingBottom: 50, paddingHorizontal: 0 }}>
        {/* Left sidebar strip */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 5,
            height: '100%',
            backgroundColor: p,
          }}
        />

        <View style={{ paddingHorizontal: 36 }}>
          {/* Header card */}
          <View
            style={{
              backgroundColor: light,
              borderRadius: 6,
              padding: '14 16',
              marginTop: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {d.comp.logo ? (
                <Image src={d.comp.logo} style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }} />
              ) : null}
              <View>
                <Text style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{s(d.comp.name)}</Text>
                {d.comp.sub ? <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>{d.comp.sub}</Text> : null}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 9, fontWeight: 700, color: p, letterSpacing: 1.5 }}>INVOICE</Text>
              <Text style={{ fontSize: 8.5, color: '#94a3b8', marginTop: 2 }}>{s(d.no)}</Text>
            </View>
          </View>

          {/* Info cards */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: light, borderRadius: 6, padding: '10 12' }}>
              <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.8 }}>BILL TO</Text>
              <Text style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>{s(d.cust)}</Text>
              <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 2 }}>
                {[d.addr, d.ph, d.cr, d.em].filter(Boolean).join('  |  ')}
              </Text>
            </View>
            <View style={{ width: 130, backgroundColor: light, borderRadius: 6, padding: '10 12' }}>
              <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.8 }}>DATE</Text>
              <Text style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>{s(d.dt)}</Text>
              {d.comp.vatReg ? (
                <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 2 }}>VAT: {d.comp.vatReg}</Text>
              ) : null}
            </View>
          </View>

          <ItemsTable items={d.items} dp={d.dp} symbol={d.cur.symbol} headerBg={p} rowAlt={light} borderColor={lightenHex(p, 0.6)} />
          <TotalsBlock d={d} accentBg={p} />
          <NotesBox pd={d.pd} notes={d.notes} terms={d.comp.invTerms} accentBg={p} borderColor={lightenHex(p, 0.5)} />
          <SigRow comp={d.comp} accentBg={p} />
        </View>
        <Footer comp={d.comp} accentBg={p} />
      </Page>
    </Document>
  )
}

// ── Professional ──────────────────────────────────────────────────────────────
function InvoiceProfessionalDoc({ d }: { d: InvTemplateData }) {
  const p = d.comp.pcolor || '#1e3a5f'
  const light = lightenHex(p, 0.92)

  return (
    <Document>
      <Page size="A4" style={{ ...PAGE_STYLE, paddingBottom: 50, paddingHorizontal: 32 }}>
        {/* Top thick bar */}
        <View style={{ height: 8, backgroundColor: p, marginHorizontal: -32, marginTop: 0 }} />

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {d.comp.logo ? (
              <Image src={d.comp.logo} style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }} />
            ) : null}
            <View>
              <Text style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', letterSpacing: 0.5 }}>
                {s(d.comp.name).toUpperCase()}
              </Text>
              {d.comp.sub ? (
                <Text style={{ fontSize: 8, color: '#475569', marginTop: 1 }}>{d.comp.sub.toUpperCase()}</Text>
              ) : null}
            </View>
          </View>
          <View style={{ borderWidth: 1, borderColor: p, padding: '6 18', alignItems: 'center' }}>
            <Text style={{ fontSize: 7, color: '#64748b', letterSpacing: 0.8 }}>INVOICE NO.</Text>
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s(d.no)}</Text>
          </View>
        </View>

        {/* Blue banner */}
        <View
          style={{
            backgroundColor: p,
            padding: '5 10',
            marginTop: 14,
          }}
        >
          <Text style={{ fontSize: 8, fontWeight: 700, color: '#ffffff', letterSpacing: 1 }}>INVOICE STATEMENT</Text>
        </View>

        {/* Info grid */}
        <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#cbd5e1', marginBottom: 12 }}>
          {[
            { label: 'BILL TO', val: s(d.cust), sub: [d.addr, d.ph, d.cr, d.em].filter(Boolean).join(' | ') },
            { label: 'DATE', val: s(d.dt), sub: '' },
            { label: 'VAT REG', val: d.comp.vatReg || 'N/A', sub: '' },
          ].map((cell, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                padding: '7 10',
                borderRight: i < 2 ? '0.5 solid #cbd5e1' : 'none',
              }}
            >
              <Text style={{ fontSize: 7, color: '#64748b', fontWeight: 600, letterSpacing: 0.8 }}>{cell.label}</Text>
              <Text style={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{cell.val}</Text>
              {cell.sub ? (
                <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>{cell.sub}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <ItemsTable items={d.items} dp={d.dp} symbol={d.cur.symbol} headerBg={p} rowAlt={light} borderColor='#cbd5e1' />
        <TotalsBlock d={d} accentBg={p} />
        <NotesBox pd={d.pd} notes={d.notes} terms={d.comp.invTerms} accentBg={p} borderColor={lightenHex(p, 0.5)} />
        <SigRow comp={d.comp} accentBg={p} />
        <Footer comp={d.comp} accentBg={p} />
      </Page>
    </Document>
  )
}

// ── Minimal ───────────────────────────────────────────────────────────────────
function InvoiceMinimalDoc({ d }: { d: InvTemplateData }) {
  const p = d.comp.pcolor || '#94a3b8'

  return (
    <Document>
      <Page size="A4" style={{ ...PAGE_STYLE, paddingBottom: 50, paddingHorizontal: 44, paddingTop: 44 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
          <View>
            {d.comp.logo ? (
              <Image src={d.comp.logo} style={{ maxHeight: 28, maxWidth: 44, objectFit: 'contain', marginBottom: 5 }} />
            ) : null}
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{s(d.comp.name)}</Text>
            {d.comp.sub ? <Text style={{ fontSize: 7.5, color: '#94a3b8', marginTop: 1 }}>{d.comp.sub}</Text> : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 8, color: '#94a3b8', letterSpacing: 2, fontWeight: 600 }}>INVOICE</Text>
            <Text style={{ fontSize: 8.5, color: '#94a3b8', marginTop: 2 }}>{s(d.no)}</Text>
          </View>
        </View>

        {/* Thin divider */}
        <View style={{ borderTop: '0.5 solid #e2e8f0', paddingTop: 14, marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}>
                BILL TO
              </Text>
              <Text style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}>{s(d.cust)}</Text>
              <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 2 }}>
                {[d.addr, d.ph, d.cr, d.em].filter(Boolean).join('  |  ')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}>
                DATE
              </Text>
              <Text style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}>{s(d.dt)}</Text>
              {d.comp.vatReg ? (
                <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 2 }}>VAT: {d.comp.vatReg}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Plain table */}
        <View style={{ marginTop: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              borderBottom: `1.5 solid ${p}`,
              paddingBottom: 4,
              marginBottom: 2,
            }}
          >
            {['#', 'Description', 'Qty', 'Unit Price', 'Amount'].map((h, i) => (
              <Text
                key={h}
                style={{
                  fontSize: 7.5,
                  color: '#94a3b8',
                  fontWeight: 600,
                  letterSpacing: 0.8,
                  flex: i === 1 ? 1 : undefined,
                  width: [18, undefined, 28, 48, 48][i],
                  textAlign: i > 1 ? 'right' : i === 0 ? 'center' : 'left',
                }}
              >
                {h}
              </Text>
            ))}
          </View>
          {d.items.map((item, i) => (
            <View
              key={i}
              style={{ flexDirection: 'row', paddingVertical: 5, borderBottom: '0.3 solid #f1f5f9' }}
              wrap={false}
            >
              <Text style={{ fontSize: 8.5, color: '#94a3b8', width: 18, textAlign: 'center' }}>{i + 1}</Text>
              <Text style={{ fontSize: 8.5, color: '#334155', flex: 1 }}>{s(item.desc)}</Text>
              <Text style={{ fontSize: 8.5, color: '#64748b', width: 28, textAlign: 'right' }}>{item.qty}</Text>
              <Text style={{ fontSize: 8.5, color: '#64748b', width: 48, textAlign: 'right' }}>
                {d.cur.symbol}{item.price.toFixed(d.dp)}
              </Text>
              <Text style={{ fontSize: 8.5, color: '#334155', fontWeight: 600, width: 48, textAlign: 'right' }}>
                {d.cur.symbol}{item.amount.toFixed(d.dp)}
              </Text>
            </View>
          ))}
        </View>

        {/* Minimal totals */}
        <View style={{ alignSelf: 'flex-end', width: 160, marginTop: 14 }}>
          {[['Subtotal', `${d.cur.symbol}${d.sv}`], ...(d.vp > 0 ? [[`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`]] : []), ...(d.disc > 0 ? [['Discount', `-${d.cur.symbol}${d.dv}`]] : [])] as [string, string][]}
          {[
            ['Subtotal', `${d.cur.symbol}${d.sv}`] as [string, string],
            ...(d.vp > 0 ? [[`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`] as [string, string]] : []),
            ...(d.disc > 0 ? [['Discount', `-${d.cur.symbol}${d.dv}`] as [string, string]] : []),
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
              <Text style={{ fontSize: 8.5, color: '#94a3b8' }}>{label}</Text>
              <Text style={{ fontSize: 8.5, color: '#64748b' }}>{val}</Text>
            </View>
          ))}
          <View style={{ borderTop: `0.8 solid ${p}`, marginTop: 5, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Grand Total</Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: p }}>{d.cur.symbol}{d.gv}</Text>
          </View>
          {d.gw ? (
            <Text style={{ fontSize: 7, color: '#94a3b8', fontStyle: 'italic', textAlign: 'right', marginTop: 4 }}>
              {d.gw}
            </Text>
          ) : null}
        </View>

        {/* Notes */}
        {(d.pd || d.notes || d.comp.invTerms) ? (
          <View style={{ marginTop: 14, borderTop: '0.5 solid #e2e8f0', paddingTop: 10 }}>
            {[d.pd && `Payment: ${d.pd}`, d.notes, d.comp.invTerms].filter(Boolean).map((line, i) => (
              <Text key={i} style={{ fontSize: 7.5, color: '#64748b', marginTop: i > 0 ? 3 : 0 }}>{line}</Text>
            ))}
          </View>
        ) : null}

        {/* Signature */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
          <View style={{ alignItems: 'center', width: 120 }}>
            {d.comp.signature ? (
              <Image src={d.comp.signature} style={{ maxWidth: 100, maxHeight: 36, objectFit: 'contain', marginBottom: 3 }} />
            ) : null}
            <View style={{ borderTop: `0.5 solid ${p}`, width: 120, marginBottom: 3 }} />
            <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 0.5 }}>AUTHORIZED SIGNATURE</Text>
          </View>
        </View>

        <Footer comp={d.comp} accentBg={p} />
      </Page>
    </Document>
  )
}

// ── Elegant ───────────────────────────────────────────────────────────────────
function InvoiceElegantDoc({ d }: { d: InvTemplateData }) {
  const p = d.comp.pcolor || '#8b6914'
  const light = lightenHex(p, 0.93)
  const warm = '#8b7d62'
  const border = '#d4c5a9'

  return (
    <Document>
      <Page
        size="A4"
        style={{
          ...PAGE_STYLE,
          fontFamily: 'Inter',
          paddingBottom: 55,
          paddingHorizontal: 36,
          paddingTop: 30,
          border: `2 solid ${p}`,
        }}
      >
        {/* Vintage inner frame */}
        <View
          style={{
            position: 'absolute',
            top: 7,
            left: 7,
            right: 7,
            bottom: 7,
            border: `0.5 solid ${border}`,
          }}
        />

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottom: `2 solid ${p}`, paddingBottom: 12, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {d.comp.logo ? (
              <Image src={d.comp.logo} style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }} />
            ) : null}
            <View>
              <Text style={{ fontSize: 17, fontWeight: 700, color: '#1a150e' }}>{s(d.comp.name)}</Text>
              {d.comp.sub ? (
                <Text style={{ fontSize: 8.5, color: warm, fontStyle: 'italic', marginTop: 1 }}>{d.comp.sub}</Text>
              ) : null}
              <Text style={{ fontSize: 7.5, color: warm, fontStyle: 'italic', marginTop: 3 }}>
                {[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join('  •  ')}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 22, color: p, fontStyle: 'italic' }}>Invoice</Text>
            <Text style={{ fontSize: 8, color: warm, fontStyle: 'italic', marginTop: 2 }}>{s(d.no)}</Text>
          </View>
        </View>

        {/* Ornament */}
        <Text style={{ textAlign: 'center', fontSize: 11, color: p, letterSpacing: 8, marginBottom: 10 }}>◆  ◆  ◆</Text>

        {/* Info box */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: light,
            border: `0.5 solid ${border}`,
            padding: '10 14',
            marginBottom: 14,
          }}
        >
          <View>
            <Text style={{ fontSize: 7, color: warm, fontWeight: 600, letterSpacing: 1 }}>BILL TO</Text>
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#1a150e', marginTop: 2 }}>{s(d.cust)}</Text>
            <Text style={{ fontSize: 7.5, color: '#6b5d4a', marginTop: 2 }}>
              {[d.addr, d.ph, d.cr, d.em].filter(Boolean).join('  •  ')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: warm, fontWeight: 600, letterSpacing: 1 }}>DATE</Text>
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#1a150e', marginTop: 2 }}>{s(d.dt)}</Text>
            {d.comp.vatReg ? (
              <Text style={{ fontSize: 7.5, color: '#6b5d4a', marginTop: 2 }}>VAT: {d.comp.vatReg}</Text>
            ) : null}
          </View>
        </View>

        {/* Table */}
        <View style={{ marginTop: 4 }}>
          <View style={{ flexDirection: 'row', borderBottom: `2 solid ${p}` }}>
            {['#', 'Description', 'Qty', 'Unit Price', 'Amount'].map((h, i) => (
              <Text
                key={h}
                style={{
                  fontSize: 7.5,
                  color: warm,
                  fontWeight: 700,
                  padding: '5 6',
                  letterSpacing: 0.8,
                  flex: i === 1 ? 1 : undefined,
                  width: [22, undefined, 32, 52, 52][i],
                  textAlign: i > 1 ? 'right' : i === 0 ? 'center' : 'left',
                }}
              >
                {h}
              </Text>
            ))}
          </View>
          {d.items.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                backgroundColor: i % 2 === 1 ? '#faf6ee' : '#ffffff',
                borderBottom: `0.3 solid ${border}`,
              }}
              wrap={false}
            >
              <Text style={{ fontSize: 8.5, color: '#2c2416', padding: '5 6', width: 22, textAlign: 'center' }}>{i + 1}</Text>
              <Text style={{ fontSize: 8.5, color: '#2c2416', padding: '5 6', flex: 1 }}>{s(item.desc)}</Text>
              <Text style={{ fontSize: 8.5, color: '#4a3f30', padding: '5 6', width: 32, textAlign: 'right' }}>{item.qty}</Text>
              <Text style={{ fontSize: 8.5, color: '#4a3f30', padding: '5 6', width: 52, textAlign: 'right' }}>
                {d.cur.symbol}{item.price.toFixed(d.dp)}
              </Text>
              <Text style={{ fontSize: 8.5, color: '#2c2416', padding: '5 6', width: 52, textAlign: 'right', fontWeight: 600 }}>
                {d.cur.symbol}{item.amount.toFixed(d.dp)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={{ alignSelf: 'flex-end', width: 180, marginTop: 12, border: `0.5 solid ${border}`, backgroundColor: light, padding: '10 12' }}>
          {[
            ['Subtotal', `${d.cur.symbol}${d.sv}`] as [string, string],
            ...(d.vp > 0 ? [[`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`] as [string, string]] : []),
            ...(d.disc > 0 ? [['Discount', `-${d.cur.symbol}${d.dv}`] as [string, string]] : []),
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
              <Text style={{ fontSize: 8.5, color: '#4a3f30' }}>{label}</Text>
              <Text style={{ fontSize: 8.5, color: '#4a3f30' }}>{val}</Text>
            </View>
          ))}
          <View style={{ borderTop: `1 solid ${p}`, marginTop: 6, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, fontWeight: 700, color: p }}>Grand Total</Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: p }}>{d.cur.symbol}{d.gv}</Text>
          </View>
        </View>
        {d.gw ? (
          <Text style={{ fontSize: 7.5, color: warm, fontStyle: 'italic', textAlign: 'right', marginTop: 5 }}>{d.gw}</Text>
        ) : null}

        <NotesBox pd={d.pd} notes={d.notes} terms={d.comp.invTerms} accentBg={p} borderColor={border} />

        {/* Sig */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
          <View style={{ alignItems: 'center', width: 130 }}>
            {d.comp.seal ? (
              <Image src={d.comp.seal} style={{ maxWidth: 50, maxHeight: 42, objectFit: 'contain', position: 'absolute', left: -70 }} />
            ) : null}
            {d.comp.signature ? (
              <Image src={d.comp.signature} style={{ maxWidth: 100, maxHeight: 36, objectFit: 'contain', marginBottom: 3 }} />
            ) : null}
            <View style={{ borderTop: `0.5 solid ${border}`, width: 130, marginBottom: 3 }} />
            <Text style={{ fontSize: 7, color: warm, fontStyle: 'italic' }}>Authorized Signature</Text>
            <Text style={{ fontSize: 8.5, fontWeight: 700, color: '#1a150e', marginTop: 2 }}>{s(d.comp.name)}</Text>
          </View>
        </View>

        {/* Elegant footer */}
        <View
          style={{
            position: 'absolute',
            bottom: 18,
            left: 36,
            right: 36,
            borderTop: `0.5 solid ${border}`,
            paddingTop: 5,
          }}
          fixed
        >
          <Text style={{ fontSize: 7.5, color: warm, fontStyle: 'italic', textAlign: 'center' }}>
            {[s(d.comp.name), d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join('  |  ')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// ── Bold ──────────────────────────────────────────────────────────────────────
function InvoiceBoldDoc({ d }: { d: InvTemplateData }) {
  const p = d.comp.pcolor || '#dc2626'

  return (
    <Document>
      <Page size="A4" style={{ ...PAGE_STYLE, paddingHorizontal: 0, paddingBottom: 0 }}>
        {/* Big black header */}
        <View style={{ backgroundColor: '#000000', padding: '20 32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', letterSpacing: 1 }}>INVOICE</Text>
            <Text style={{ fontSize: 10, color: '#999999', marginTop: 3 }}>{s(d.no)}</Text>
          </View>
          {d.comp.logo ? (
            <Image src={d.comp.logo} style={{ maxHeight: 40, maxWidth: 60, objectFit: 'contain' }} />
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 32 }}>
          {/* Brand */}
          <View style={{ paddingTop: 16, paddingBottom: 10, borderBottom: '2.5 solid #000000' }}>
            <Text style={{ fontSize: 15, fontWeight: 700, color: '#000000', letterSpacing: 0.5 }}>
              {s(d.comp.name).toUpperCase()}
            </Text>
            {d.comp.sub ? (
              <Text style={{ fontSize: 8, fontWeight: 700, color: '#666666', marginTop: 3 }}>
                {d.comp.sub.toUpperCase()}
              </Text>
            ) : null}
          </View>

          {/* Info */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottom: '2.5 solid #000000', marginBottom: 10 }}>
            <View>
              <Text style={{ fontSize: 7, color: '#666666', fontWeight: 700, letterSpacing: 1 }}>BILL TO</Text>
              <Text style={{ fontSize: 11, fontWeight: 700, color: '#000000', marginTop: 3 }}>{s(d.cust)}</Text>
              <Text style={{ fontSize: 7.5, color: '#444444', marginTop: 2 }}>
                {[d.addr, d.ph, d.cr, d.em].filter(Boolean).join('  |  ')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 7, color: '#666666', fontWeight: 700, letterSpacing: 1 }}>DATE</Text>
              <Text style={{ fontSize: 11, fontWeight: 700, color: '#000000', marginTop: 3 }}>{s(d.dt)}</Text>
              {d.comp.vatReg ? (
                <Text style={{ fontSize: 7.5, color: '#444444', marginTop: 2 }}>VAT: {d.comp.vatReg}</Text>
              ) : null}
            </View>
          </View>

          {/* Table */}
          <ItemsTable
            items={d.items}
            dp={d.dp}
            symbol={d.cur.symbol}
            headerBg='#000000'
            rowAlt='#fef2f2'
            borderColor='#000000'
          />

          {/* Bold totals */}
          <View style={{ alignSelf: 'flex-end', width: 180, marginTop: 14 }}>
            {[
              ['Subtotal', `${d.cur.symbol}${d.sv}`] as [string, string],
              ...(d.vp > 0 ? [[`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`] as [string, string]] : []),
              ...(d.disc > 0 ? [['Discount', `-${d.cur.symbol}${d.dv}`] as [string, string]] : []),
            ].map(([label, val]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '0.5 solid #dddddd' }}>
                <Text style={{ fontSize: 9, fontWeight: 700, color: '#000000' }}>{label}</Text>
                <Text style={{ fontSize: 9, fontWeight: 700, color: '#000000' }}>{val}</Text>
              </View>
            ))}
            <View style={{ borderTop: '2.5 solid #000000', paddingTop: 8, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: 700, color: p }}>Grand Total</Text>
              <Text style={{ fontSize: 15, fontWeight: 700, color: p }}>{d.cur.symbol}{d.gv}</Text>
            </View>
            {d.gw ? (
              <Text style={{ fontSize: 7.5, color: '#666666', fontStyle: 'italic', textAlign: 'right', marginTop: 4 }}>{d.gw}</Text>
            ) : null}
          </View>

          {/* Notes with left accent bar */}
          {(d.pd || d.notes || d.comp.invTerms) ? (
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <View style={{ width: 4, backgroundColor: p, marginRight: 8 }} />
              <View style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '8 10' }}>
                {[d.pd && `PAYMENT: ${d.pd}`, d.notes, d.comp.invTerms].filter(Boolean).map((line, i) => (
                  <Text key={i} style={{ fontSize: 8.5, color: '#333333', marginTop: i > 0 ? 3 : 0 }}>{line}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Sig */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, marginBottom: 16 }}>
            <View style={{ alignItems: 'center', width: 120 }}>
              {d.comp.signature ? (
                <Image src={d.comp.signature} style={{ maxWidth: 100, maxHeight: 36, objectFit: 'contain', marginBottom: 3 }} />
              ) : null}
              <View style={{ borderTop: '1.5 solid #000000', width: 120, marginBottom: 3 }} />
              <Text style={{ fontSize: 7, color: '#666666', fontWeight: 700, letterSpacing: 0.5 }}>AUTHORIZED SIGNATURE</Text>
            </View>
          </View>
        </View>

        {/* Bold black footer */}
        <View style={{ backgroundColor: '#000000', padding: '12 32' }}>
          <Text style={{ fontSize: 8, color: '#ffffff', fontWeight: 700, textAlign: 'center' }}>
            {[s(d.comp.name), d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join('  |  ')}
          </Text>
          {d.comp.bankName ? (
            <Text style={{ fontSize: 7, color: '#999999', textAlign: 'center', marginTop: 3 }}>
              {[d.comp.bankName, d.comp.bankAcc, d.comp.bankIban].filter(Boolean).join('  •  ')}
            </Text>
          ) : null}
        </View>
      </Page>
    </Document>
  )
}

// ── Beirak ────────────────────────────────────────────────────────────────────
function InvoiceBeirakDoc({ d }: { d: InvTemplateData }) {
  const p = d.comp.pcolor || '#1e3a5f'
  const light = lightenHex(p, 0.9)

  return (
    <Document>
      <Page size="A4" style={{ ...PAGE_STYLE, paddingHorizontal: 32, paddingBottom: 55, border: `2 solid ${p}` }}>
        {/* Centered header */}
        <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 14, borderBottom: `1.5 solid ${p}` }}>
          {d.comp.logo ? (
            <Image src={d.comp.logo} style={{ maxHeight: 40, maxWidth: 60, objectFit: 'contain', marginBottom: 6 }} />
          ) : null}
          <Text style={{ fontSize: 16, fontWeight: 700, color: p }}>{s(d.comp.name)}</Text>
          {d.comp.sub ? (
            <Text style={{ fontSize: 9, color: '#4b5563', marginTop: 2 }}>{d.comp.sub}</Text>
          ) : null}
          {[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).length ? (
            <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4 }}>
              {[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join('  |  ')}
            </Text>
          ) : null}
          {/* TAX INVOICE badge */}
          <View style={{ border: `1.5 solid ${p}`, paddingHorizontal: 22, paddingVertical: 4, marginTop: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: p, letterSpacing: 2 }}>TAX INVOICE</Text>
          </View>
        </View>

        {/* Info table */}
        <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 8 }}>
          {[
            { key: 'Invoice No.', val: s(d.no) },
            { key: 'Date', val: s(d.dt) },
            { key: 'Party', val: `${s(d.cust)}${d.addr ? ' — ' + d.addr : ''}${d.cr ? '  CR: ' + d.cr : ''}` },
          ].slice(0, 2).map((item, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                flexDirection: 'row',
                border: '0.5 solid #c5ced9',
              }}
            >
              <View style={{ backgroundColor: p, paddingHorizontal: 8, paddingVertical: 6, justifyContent: 'center', minWidth: 68 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: '#ffffff' }}>{item.key}</Text>
              </View>
              <View style={{ flex: 1, padding: '6 8' }}>
                <Text style={{ fontSize: 8.5, color: '#1e293b' }}>{item.val}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', border: '0.5 solid #c5ced9' }}>
            <View style={{ backgroundColor: p, paddingHorizontal: 8, paddingVertical: 6, justifyContent: 'center', minWidth: 68 }}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: '#ffffff' }}>Party</Text>
            </View>
            <View style={{ flex: 1, padding: '6 8' }}>
              <Text style={{ fontSize: 8.5, color: '#1e293b' }}>
                {s(d.cust)}{d.addr ? ` — ${d.addr}` : ''}{d.cr ? `  CR: ${d.cr}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Items table */}
        <ItemsTable items={d.items} dp={d.dp} symbol={d.cur.symbol} headerBg={p} rowAlt={light} borderColor='#c5ced9' />

        {/* Sum box */}
        <View style={{ alignSelf: 'flex-end', width: 185, marginTop: 14, border: `1.5 solid ${p}` }}>
          {[
            ['Subtotal', `${d.cur.symbol}${d.sv}`] as [string, string],
            ...(d.vp > 0 ? [[`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`] as [string, string]] : []),
            ...(d.disc > 0 ? [['Discount', `-${d.cur.symbol}${d.dv}`] as [string, string]] : []),
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '5 10', borderBottom: '0.5 solid #c5ced9' }}>
              <Text style={{ fontSize: 9, color: '#1e293b' }}>{label}</Text>
              <Text style={{ fontSize: 9, color: '#1e293b' }}>{val}</Text>
            </View>
          ))}
          <View style={{ backgroundColor: p, flexDirection: 'row', justifyContent: 'space-between', padding: '8 10' }}>
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Grand Total</Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>{d.cur.symbol}{d.gv}</Text>
          </View>
        </View>

        {d.gw ? (
          <Text style={{ fontSize: 7.5, color: '#6b7280', fontStyle: 'italic', textAlign: 'right', marginTop: 5 }}>{d.gw}</Text>
        ) : null}

        <NotesBox pd={d.pd} notes={d.notes} terms={d.comp.invTerms} accentBg={p} borderColor='#c5ced9' />

        {/* 3-col signature */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, borderTop: `1.5 solid ${p}`, paddingTop: 10 }}>
          <View>
            <Text style={{ fontSize: 7, color: '#6b7280', fontWeight: 600 }}>Prepared By</Text>
            <View style={{ borderTop: `1 solid ${p}`, marginTop: 18, paddingTop: 3, width: 100 }}>
              <Text style={{ fontSize: 9, fontWeight: 700, color: p }}>{s(d.comp.name)}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            {d.comp.signature ? (
              <Image src={d.comp.signature} style={{ maxWidth: 90, maxHeight: 32, objectFit: 'contain', marginBottom: 3 }} />
            ) : (
              <View style={{ height: 22 }} />
            )}
            <View style={{ borderTop: '0.5 solid #94a3b8', width: 100, marginBottom: 3 }} />
            <Text style={{ fontSize: 7, color: '#6b7280' }}>Authorized Signature</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: '#6b7280', fontWeight: 600 }}>Authorized By</Text>
            <View style={{ borderTop: `1 solid ${p}`, marginTop: 18, paddingTop: 3, width: 100, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 9, fontWeight: 700, color: p }}>{s(d.comp.name)}</Text>
            </View>
          </View>
        </View>

        <Footer comp={d.comp} accentBg={p} />
      </Page>
    </Document>
  )
}

// ─── Invoice document selector ────────────────────────────────────────────────
function InvoiceDocument({ d }: { d: InvTemplateData }) {
  const tpl = d.comp.invTemplate || 'classic'
  if (tpl === 'modern') return <InvoiceModernDoc d={d} />
  if (tpl === 'professional') return <InvoiceProfessionalDoc d={d} />
  if (tpl === 'minimal') return <InvoiceMinimalDoc d={d} />
  if (tpl === 'elegant') return <InvoiceElegantDoc d={d} />
  if (tpl === 'bold') return <InvoiceBoldDoc d={d} />
  if (tpl === 'beirak') return <InvoiceBeirakDoc d={d} />
  return <InvoiceClassicDoc d={d} />
}

// ─── Receipt Document ─────────────────────────────────────────────────────────
function ReceiptDocument({ d }: { d: RecTemplateData }) {
  const p = d.comp.pcolor || '#D97706'
  const alt = d.comp.acolor || '#1e293b'
  const light = lightenHex(p, 0.9)
  const tpl = d.comp.recTemplate || 'classic'

  const isBold = tpl === 'bold'
  const bgColor = isBold ? '#000000' : alt
  const headerText = '#ffffff'

  return (
    <Document>
      <Page
        size="A4"
        style={{
          ...PAGE_STYLE,
          paddingHorizontal: 32,
          paddingBottom: 55,
          border: (tpl === 'elegant' || tpl === 'beirak') ? `2 solid ${p}` : 'none',
        }}
      >
        {/* Top bar */}
        {isBold ? (
          <View style={{ backgroundColor: '#000000', margin: '-0 -32 0 -32', padding: '18 32', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>RECEIPT</Text>
              <Text style={{ fontSize: 9, color: '#999999', marginTop: 2 }}>{s(d.no)}</Text>
            </View>
            {d.comp.logo ? <Image src={d.comp.logo} style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }} /> : null}
          </View>
        ) : (
          <View style={{ height: tpl === 'professional' ? 7 : 4, backgroundColor: alt, marginHorizontal: -32 }} />
        )}

        {/* Header */}
        {!isBold && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              {d.comp.logo ? <Image src={d.comp.logo} style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }} /> : null}
              <View>
                <Text style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s(d.comp.name)}</Text>
                {d.comp.sub ? <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>{d.comp.sub}</Text> : null}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 18, fontWeight: 700, color: p }}>RECEIPT</Text>
              <Text style={{ fontSize: 8.5, color: '#64748b', marginTop: 2 }}>{s(d.no)}</Text>
              <Text style={{ fontSize: 8.5, color: '#64748b', marginTop: 1 }}>{s(d.dt)}</Text>
            </View>
          </View>
        )}

        {/* Amount box */}
        <View
          style={{
            backgroundColor: light,
            padding: '12 14',
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `4 solid ${p}`,
          }}
        >
          <View>
            <Text style={{ fontSize: 7.5, color: '#64748b', fontWeight: 600, letterSpacing: 0.8 }}>RECEIVED FROM</Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>{s(d.rf)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7.5, color: '#64748b', fontWeight: 600, letterSpacing: 0.8 }}>AMOUNT</Text>
            <Text style={{ fontSize: 20, fontWeight: 700, color: p, marginTop: 2 }}>
              {d.cur.symbol} {d.amFmt}
            </Text>
          </View>
        </View>

        {/* Words */}
        {d.ww ? (
          <Text style={{ fontSize: 8.5, color: '#475569', fontStyle: 'italic', marginTop: 8, padding: '5 14', backgroundColor: '#f8fafc' }}>
            {d.ww}
          </Text>
        ) : null}

        {/* Details */}
        <View style={{ marginTop: 14 }}>
          {[
            d.pm && ['Payment Method', d.pm],
            d.ch && ['Cheque No.', d.ch],
            d.bk && ['Bank', d.bk],
            d.td && ['Transaction Date', d.td],
            d.bg && ['Being', d.bg],
            d.rv && ['Received By', d.rv],
          ].filter(Boolean).map(([label, val], i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                paddingVertical: 5,
                borderBottom: '0.3 solid #f1f5f9',
              }}
            >
              <Text style={{ fontSize: 8.5, color: '#64748b', fontWeight: 600, width: 110 }}>{label as string}</Text>
              <Text style={{ fontSize: 8.5, color: '#0f172a', flex: 1 }}>{val as string}</Text>
            </View>
          ))}
        </View>

        {/* Items if any */}
        {d.items && d.items.length > 0 && (
          <ItemsTable items={d.items} dp={d.dp} symbol={d.cur.symbol} headerBg={alt} rowAlt={light} borderColor='#e2e8f0' />
        )}

        {/* Signature */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, alignItems: 'flex-end' }}>
          <View style={{ width: 70 }}>
            {d.comp.seal ? (
              <Image src={d.comp.seal} style={{ maxWidth: 60, maxHeight: 50, objectFit: 'contain' }} />
            ) : null}
          </View>
          <View style={{ alignItems: 'center', width: 130 }}>
            {d.comp.signature ? (
              <Image src={d.comp.signature} style={{ maxWidth: 110, maxHeight: 38, objectFit: 'contain', marginBottom: 3 }} />
            ) : null}
            <View style={{ borderTop: `1 solid ${p}`, width: 130, marginBottom: 3 }} />
            <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 0.5 }}>AUTHORIZED SIGNATURE</Text>
            <Text style={{ fontSize: 8, color: p, fontWeight: 700, marginTop: 2 }}>{s(d.comp.name)}</Text>
          </View>
        </View>

        <Footer comp={d.comp} accentBg={p} />
      </Page>
    </Document>
  )
}

// ─── Quotation Document ───────────────────────────────────────────────────────
function QuotationDocument({ d }: { d: QuotTemplateData }) {
  const p = d.comp.pcolor || '#1f2937'
  const light = lightenHex(p, 0.9)
  const tpl = d.comp.quotTemplate || 'classic'
  const isBold = tpl === 'bold'

  return (
    <Document>
      <Page
        size="A4"
        style={{
          ...PAGE_STYLE,
          paddingHorizontal: 32,
          paddingBottom: 55,
          border: (tpl === 'elegant' || tpl === 'beirak') ? `2 solid ${p}` : 'none',
        }}
      >
        {/* Top decoration */}
        {isBold ? (
          <View style={{ backgroundColor: '#000000', marginHorizontal: -32, padding: '18 32', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>QUOTATION</Text>
              <Text style={{ fontSize: 9, color: '#999999', marginTop: 2 }}>{s(d.no)}</Text>
            </View>
            {d.comp.logo ? <Image src={d.comp.logo} style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }} /> : null}
          </View>
        ) : (
          <View style={{ height: tpl === 'professional' ? 7 : 4, backgroundColor: p, marginHorizontal: -32 }} />
        )}

        {/* Header */}
        {!isBold && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              {d.comp.logo ? <Image src={d.comp.logo} style={{ maxHeight: 36, maxWidth: 52, objectFit: 'contain' }} /> : null}
              <View>
                <Text style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s(d.comp.name)}</Text>
                {d.comp.sub ? <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>{d.comp.sub}</Text> : null}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, fontWeight: 700, color: p }}>QUOTATION</Text>
              <Text style={{ fontSize: 8.5, color: '#64748b', marginTop: 2 }}>{s(d.no)}</Text>
            </View>
          </View>
        )}

        {/* Info bar */}
        <View style={{ flexDirection: 'row', backgroundColor: light, padding: '10 12', marginTop: 14 }}>
          <View style={{ flex: 2 }}>
            <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.8 }}>QUOTE TO</Text>
            <Text style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s(d.cust)}</Text>
            <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 2 }}>
              {[d.addr, d.ph, d.cr, d.em].filter(Boolean).join('  |  ')}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.8 }}>DATE</Text>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s(d.dt)}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.8 }}>VALID UNTIL</Text>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s(d.validDt)}</Text>
          </View>
        </View>

        <ItemsTable items={d.items} dp={d.dp} symbol={d.cur.symbol} headerBg={isBold ? '#000000' : p} rowAlt={light} borderColor={lightenHex(p, 0.6)} />
        <TotalsBlock d={d} accentBg={isBold ? '#000000' : p} />

        {(d.notes || d.terms) ? (
          <View style={{ marginTop: 10 }}>
            {[d.notes, d.terms].filter(Boolean).map((line, i) => (
              <View key={i} style={{ marginTop: i > 0 ? 6 : 0, padding: '8 10', backgroundColor: light, borderLeft: `3 solid ${p}` }}>
                <Text style={{ fontSize: 8, color: '#475569' }}>{line}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <SigRow comp={d.comp} accentBg={isBold ? '#000000' : p} />
        <Footer comp={d.comp} accentBg={p} />
      </Page>
    </Document>
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function downloadPDF(element: React.ReactElement, filename: string): Promise<void> {
  const blob = await pdf(element).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function buildInvoicePDF(d: InvTemplateData, filename: string): Promise<void> {
  await downloadPDF(<InvoiceDocument d={d} />, filename)
}

export async function buildReceiptPDF(d: RecTemplateData, filename: string): Promise<void> {
  await downloadPDF(<ReceiptDocument d={d} />, filename)
}

export async function buildQuotationPDF(d: QuotTemplateData, filename: string): Promise<void> {
  await downloadPDF(<QuotationDocument d={d} />, filename)
}

export async function buildInvoicePDFBlob(d: InvTemplateData): Promise<Blob> {
  return pdf(<InvoiceDocument d={d} />).toBlob()
}

export async function buildReceiptPDFBlob(d: RecTemplateData): Promise<Blob> {
  return pdf(<ReceiptDocument d={d} />).toBlob()
}

export async function buildQuotationPDFBlob(d: QuotTemplateData): Promise<Blob> {
  return pdf(<QuotationDocument d={d} />).toBlob()
}
