import { pdf } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

export async function renderPDF(element: ReactElement): Promise<Blob> {
  const instance = pdf(element)
  return instance.toBlob()
}

export async function renderPDFToFile(element: ReactElement, filename: string): Promise<void> {
  const blob = await renderPDF(element)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
