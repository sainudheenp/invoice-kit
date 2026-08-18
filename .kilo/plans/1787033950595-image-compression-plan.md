# Image Compression Plan

## Problem
Uploaded branding images (logo, seal, signature) are stored as base64 Data URLs in IndexedDB. The current `resizeImage` utility outputs PNG format, which has poor compression for complex/photographic images. This results in invoice files exceeding 2MB when the large base64 data URLs are embedded inline.

## Root Cause
`src/utils/image.ts:25` uses `canvas.toDataURL('image/png')`, which is lossless but produces large files for images with gradients, anti-aliasing, or photographic content.

## Solution
Switch the `resizeImage` output format from PNG to JPEG with a 0.75 quality setting. This typically reduces file sizes by 70–90% with negligible visual impact for logos, seals, and signatures on white document backgrounds.

## Tasks

### 1. Update `src/utils/image.ts`
- Change `canvas.toDataURL('image/png')` to `canvas.toDataURL('image/jpeg', 0.75)`
- Keep SVG passthrough logic unchanged
- Add a `JPEG_QUALITY` export constant for configurability

### 2. Update upload UI text
- `src/components/settings/BrandingSection.tsx:66` — change "PNG, JPG, SVG" to "JPG, PNG, SVG"
- `src/pages/Settings.tsx:534` — same text update

### 3. Add tests for `resizeImage`
- Create `src/__tests__/image.test.ts`
- Test: SVG passthrough
- Test: raster image resizing produces JPEG data URL
- Test: dimensions are constrained by maxW/maxH
- Test: never upscales smaller images

## Files Changed
- `src/utils/image.ts`
- `src/components/settings/BrandingSection.tsx`
- `src/pages/Settings.tsx`
- `src/__tests__/image.test.ts` (new)

## Validation
- Run `npm run lint`
- Run `npm run test`
- Run `npm run build`
