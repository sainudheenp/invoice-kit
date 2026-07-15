import { pdf } from '@react-pdf/renderer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderPDF(element: any): Promise<Blob> {
  const instance = pdf(element)
  return instance.toBlob()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderPDFToFile(element: any, filename: string): Promise<void> {
  const blob = await renderPDF(element)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
