import type { InternalCtx } from './types.js'
import { hpf, _te } from './utils.js'
import { deflate } from '../../tae-engine/pkg/tae_pdf.js'

export function putImages(ctx: InternalCtx): void {
  for (let i = 0; i < ctx.images.length; i++) {
    const img = ctx.images[i]

    let smaskObjId = 0
    if (img.smask) {
      const smaskData = deflate(img.smask) as Uint8Array
      smaskObjId = ctx.newObject()
      ctx.out('<<')
      ctx.out('/Type /XObject')
      ctx.out('/Subtype /Image')
      ctx.out(`/Width ${img.width}`)
      ctx.out(`/Height ${img.height}`)
      ctx.out('/ColorSpace /DeviceGray')
      ctx.out('/BitsPerComponent 8')
      ctx.out('/Filter /FlateDecode')
      ctx.out(`/Length ${ctx.encryptedLength(smaskData.length)}`)
      ctx.out('>>')
      ctx.out('stream')
      ctx.outBytes(smaskData)
      ctx.out('endstream')
      ctx.out('endobj')
    }

    const oid = ctx.newObject()
    ctx.images[i].objectNumber = oid

    ctx.out('<<')
    ctx.out('/Type /XObject')
    ctx.out('/Subtype /Image')
    ctx.out(`/Width ${img.width}`)
    ctx.out(`/Height ${img.height}`)
    ctx.out(`/ColorSpace /${img.colorSpace}`)
    ctx.out('/BitsPerComponent 8')
    ctx.out(`/Filter ${img.filter}`)
    ctx.out(`/Length ${ctx.encryptedLength(img.data.length)}`)
    // Adobe CMYK JPEGs carry inverted channel values — flip them back per component
    if (img.decodeInvert) ctx.out('/Decode [1 0 1 0 1 0 1 0]')
    if (smaskObjId) ctx.out(`/SMask ${smaskObjId} 0 R`)
    ctx.out('>>')
    ctx.out('stream')
    ctx.outBytes(img.data)
    ctx.out('endstream')
    ctx.out('endobj')
  }
}

type Stop5 = [number, number, number, number, number]
type GradGeom = { x: number; y: number; w: number; h: number; pageH: number }

// Stop positions are honored by padding the list to span [0,1] — the 2-stop fast
// path below otherwise ignores them entirely (linear-gradient(#fff 30%, #000 70%)
// ramped across the whole box instead of holding flat until 30%), and lists not
// starting at 0 had the same flat-region problem. Positions are clamped and kept
// strictly increasing so /Bounds stays valid (double-position stops repeat a value).
function normalizeStops(rawStops: Stop5[]): Stop5[] {
  const sp: Stop5[] = rawStops.map(st => [...st] as Stop5)
  for (let k = 0; k < sp.length; k++) {
    sp[k][0] = Math.min(1, Math.max(0, sp[k][0]))
    if (k > 0 && sp[k][0] < sp[k - 1][0]) sp[k][0] = sp[k - 1][0]
  }
  if (sp.length && sp[0][0] > 0) sp.unshift([0, sp[0][1], sp[0][2], sp[0][3], sp[0][4]])
  if (sp.length && sp[sp.length - 1][0] < 1) {
    const last = sp[sp.length - 1]
    sp.push([1, last[1], last[2], last[3], last[4]])
  }
  // The gap must survive hpf()'s 3-decimal formatting of the literal PDF
  // number, not just be positive in float space. Two failure modes both
  // need a MINIMUM-GAP check, not a same-or-reversed check: (1) an 0.0001
  // nudge (the prior value here) rounds right back to the same 3-decimal
  // string as its neighbor; (2) tile-boundary stops from a repeating
  // gradient are only NOMINALLY equal — repeated float addition drifts them
  // apart by ~1e-15, which satisfies "a < b" while still rounding to the
  // identical string, so a pure `<=` comparison misses it entirely. A
  // repeating gradient routinely produces long runs of these (by design —
  // the coincidence IS the hard color restart), so this isn't a one-off.
  // 0.999 (not 0.9999) as the ceiling keeps the clamp itself from rounding
  // up to "1.000" and colliding with the final stop.
  for (let k = 1; k < sp.length - 1; k++) {
    if (sp[k][0] - sp[k - 1][0] < 0.001) sp[k][0] = Math.min(0.999, sp[k - 1][0] + 0.001)
  }
  return sp
}

// shared by the color shading (DeviceRGB, picks r/g/b) and the alpha soft-mask
// shading (DeviceGray, picks alpha alone) — same stop list, different component(s)
function buildFunction(stops: Stop5[], pick: (s: Stop5) => number[]): string {
  const comps = (s: Stop5) => pick(s).map(hpf).join(' ')
  if (stops.length <= 1) {
    const c = comps(stops[0] ?? [0, 0, 0, 0, 0])
    return `/Function << /FunctionType 2 /Domain [0 1] /C0 [${c}] /C1 [${c}] /N 1 >>`
  }
  if (stops.length === 2) {
    const [s0, s1] = stops
    return `/Function << /FunctionType 2 /Domain [0 1] /C0 [${comps(s0)}] /C1 [${comps(s1)}] /N 1 >>`
  }
  const n      = stops.length
  const bounds = stops.slice(1, n - 1).map(s => hpf(s[0])).join(' ')
  const encode = Array.from({ length: n - 1 }, () => '0 1').join(' ')
  const funcs  = stops.slice(0, n - 1).map((s0, j) => {
    const s1 = stops[j + 1]
    return `<< /FunctionType 2 /Domain [0 1] /C0 [${comps(s0)}] /C1 [${comps(s1)}] /N 1 >>`
  }).join(' ')
  return `/Function << /FunctionType 3 /Domain [0 1] /Bounds [${bounds}] /Encode [${encode}] /Functions [${funcs}] >>`
}

// shared by the color shading and the alpha soft-mask shading — both need
// identical /ShadingType + /Coords, only the colorspace/function differ
function shadingCoordLines(def: { gradType: number; angle: number; cx: number; cy: number; fx?: number; fy?: number }, pat: GradGeom): string[] {
  const cx  = pat.x + pat.w / 2
  const cyp = pat.pageH - pat.y - pat.h / 2

  if (def.gradType === 0) {
    // CSS angle direction in screen coords is (sin, -cos); PDF's y axis points up,
    // so the vertical component flips to +cos — with -cos, to-bottom gradients invert
    const rad = def.angle * Math.PI / 180
    const dx = Math.sin(rad), dy = Math.cos(rad)
    const hw = pat.w / 2, hh = pat.h / 2
    const projs = [-hw*dx - hh*dy, hw*dx - hh*dy, -hw*dx + hh*dy, hw*dx + hh*dy]
    const tMin  = Math.min(...projs), tMax = Math.max(...projs)
    return [
      '/ShadingType 2',
      `/Coords [${hpf(cx+tMin*dx)} ${hpf(cyp+tMin*dy)} ${hpf(cx+tMax*dx)} ${hpf(cyp+tMax*dy)}]`,
    ]
  }
  const gcx  = pat.x + pat.w * def.cx
  const gcyp = pat.pageH - (pat.y + pat.h * def.cy)
  // farthest-corner, the CSS default ending-shape size, measured from the real center
  const dxMax = Math.max(gcx - pat.x, pat.x + pat.w - gcx)
  const dyMax = Math.max((pat.pageH - pat.y) - gcyp, gcyp - (pat.pageH - pat.y - pat.h))
  const r = Math.hypot(dxMax, dyMax)
  // SVG's radial focal point: a true 0-radius inner circle, offset from the
  // outer circle's own center when fx/fy differ from cx/cy (fx/fy default to
  // cx/cy for CSS radial-gradient and any SVG one that doesn't set them,
  // reproducing the same-center behavior exactly)
  const gfx  = pat.x + pat.w * (def.fx ?? def.cx)
  const gfyp = pat.pageH - (pat.y + pat.h * (def.fy ?? def.cy))
  return [
    '/ShadingType 3',
    `/Coords [${hpf(gfx)} ${hpf(gfyp)} 0 ${hpf(gcx)} ${hpf(gcyp)} ${hpf(r)}]`,
  ]
}

export function putShadingPatterns(ctx: InternalCtx): void {
  if (!ctx.shadPats.length) return

  for (let i = 0; i < ctx.shadPats.length; i++) {
    const pat = ctx.shadPats[i]
    const def = ctx.gradDefs[pat.defIdx]
    const oid = ctx.newObject()
    ctx.shadPats[i].objId = oid

    const stops = normalizeStops(def.stops)

    ctx.out('<<')
    ctx.out('/PatternType 2')
    ctx.out('/Matrix [1 0 0 1 0 0]')
    ctx.out('/Shading <<')
    ctx.out('/ColorSpace /DeviceRGB')
    ctx.out('/Extend [true true]')
    for (const line of shadingCoordLines(def, pat)) ctx.out(line)
    ctx.out(buildFunction(stops, s => [s[1], s[2], s[3]]))
    ctx.out('>>')
    ctx.out('>>')
    ctx.out('endobj')
  }
}

// Only invoked for gradients with a sub-1-alpha stop (registerSoftMaskIfNeeded
// in pdf_doc/index.ts) — a fully-opaque gradient never reaches here, zero
// extra objects. Builds: an alpha-only DeviceGray shading (identical geometry
// to the color one), a Transparency-group Form XObject that paints it, and
// an ExtGState wiring that Form in as a /Luminosity /SMask. White (gray 1) =
// fully opaque, black (gray 0) = fully transparent, per the SMask convention.
export function putGradientSoftMasks(ctx: InternalCtx): void {
  for (let i = 0; i < ctx.gradSoftMasks.length; i++) {
    const sm  = ctx.gradSoftMasks[i]
    const def = ctx.gradDefs[sm.defIdx]
    const stops = normalizeStops(def.stops)

    const shadingOid = ctx.newObject()
    ctx.out('<<')
    ctx.out('/ShadingType ' + (def.gradType === 0 ? '2' : '3'))
    // shadingCoordLines' first line duplicates the ShadingType above (needed
    // for the pattern-embedded case) — only its /Coords line is used here
    ctx.out(shadingCoordLines(def, sm)[1])
    ctx.out('/ColorSpace /DeviceGray')
    ctx.out('/Extend [true true]')
    ctx.out(buildFunction(stops, s => [s[4]]))
    ctx.out('>>')
    ctx.out('endobj')

    const yp = sm.pageH - sm.y - sm.h
    const formOid = ctx.newObject()
    const formBody = _te.encode(`/ShM${i} sh`)
    ctx.out('<<')
    ctx.out('/Type /XObject')
    ctx.out('/Subtype /Form')
    ctx.out('/FormType 1')
    ctx.out(`/BBox [${hpf(sm.x)} ${hpf(yp)} ${hpf(sm.x + sm.w)} ${hpf(yp + sm.h)}]`)
    ctx.out('/Group << /Type /Group /S /Transparency /CS /DeviceGray >>')
    ctx.out(`/Resources << /Shading << /ShM${i} ${shadingOid} 0 R >> >>`)
    ctx.out(`/Length ${ctx.encryptedLength(formBody.length)}`)
    ctx.out('>>')
    ctx.out('stream')
    ctx.outBytes(formBody)
    ctx.out('endstream')
    ctx.out('endobj')

    const gsOid = ctx.newObject()
    ctx.out('<<')
    ctx.out('/Type /ExtGState')
    ctx.out(`/SMask << /Type /Mask /S /Luminosity /G ${formOid} 0 R >>`)
    ctx.out('>>')
    ctx.out('endobj')

    ctx.gradSoftMasks[i].objId = gsOid
  }
}

export function putResourceDictionary(ctx: InternalCtx): void {
  ctx.newObjectDeferredBegin(ctx.resourceDictObjId, true)
  ctx.out('<<')
  ctx.out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]')

  ctx.out('/Font <<')
  for (const font of ctx.fonts) {
    if (!ctx.usedFonts.has(font.id)) continue
    if (font.objectNumber > 0) ctx.out(`/${font.id} ${font.objectNumber} 0 R`)
    // A4: the vertical Type0 variant gets its own resource name (Vn suffix) —
    // content streams select it explicitly for vertical text, independent of
    // the horizontal entry above, so both can coexist for the same font
    if (font.usedVertically && font.verticalObjectNumber > 0) {
      ctx.out(`/${font.id}V ${font.verticalObjectNumber} 0 R`)
    }
  }
  ctx.out('>>')

  if (ctx.images.length) {
    ctx.out('/XObject <<')
    for (const img of ctx.images) ctx.out(`/${img.name} ${img.objectNumber} 0 R`)
    ctx.out('>>')
  }

  if (ctx.shadPats.length) {
    ctx.out('/Pattern <<')
    for (const p of ctx.shadPats) ctx.out(`/${p.patName} ${p.objId} 0 R`)
    ctx.out('>>')
  }

  if (ctx.extGStates.length || ctx.gradSoftMasks.length) {
    ctx.out('/ExtGState <<')
    for (let i = 0; i < ctx.extGStates.length; i++) {
      const st = ctx.extGStates[i]
      const v  = hpf(st.alpha)
      ctx.out(`/GS${i} << /Type /ExtGState /ca ${v} /CA ${v} /BM /${st.blend} >>`)
    }
    // the referenced Form XObject (SMask /G) needs no /XObject resource entry —
    // it's addressed directly via its indirect object reference, not looked up
    // by name the way a content-stream "/Im0 Do" operator would need
    for (const sm of ctx.gradSoftMasks) {
      ctx.out(`/${sm.gsName} ${sm.objId} 0 R`)
    }
    ctx.out('>>')
  }

  ctx.out('>>')
  ctx.out('endobj')
}

export function packObjStm(ctx: InternalCtx): void {
  if (!ctx.objStmQueue.length) return

  const items   = ctx.objStmQueue.splice(0)
  const hparts: string[] = []
  const bparts: string[] = []
  let boff = 0

  for (const { oid, content } of items) {
    hparts.push(`${oid} ${boff}`)
    boff += content.length + 1
    bparts.push(content)
  }

  const hstr   = hparts.join(' ')
  const body   = `${hstr}\n${bparts.join('\n')}`
  const comp   = deflate(_te.encode(body)) as Uint8Array
  const stmId  = ctx.newObject()

  ctx.out('<<')
  ctx.out('/Type /ObjStm')
  ctx.out(`/N ${items.length}`)
  ctx.out(`/First ${hstr.length + 1}`)
  ctx.out(`/Length ${ctx.encryptedLength(comp.length)}`)
  ctx.out('/Filter /FlateDecode')
  ctx.out('>>')
  ctx.out('stream')
  ctx.outBytes(comp)
  ctx.out('endstream')
  ctx.out('endobj')

  for (let qi = 0; qi < items.length; qi++) {
    ctx.objStmMembers.push([items[qi].oid, stmId, qi])
  }
}
