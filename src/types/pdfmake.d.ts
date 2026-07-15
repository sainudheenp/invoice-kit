declare module 'pdfmake/build/vfs_fonts' {
  const fonts: Record<string, string>
  export default fonts
}

declare module 'pdfmake/build/pdfmake' {
  const pdfMake: {
    addVirtualFileSystem(vfs: Record<string, unknown>): void
    createPdf(docDefinition: Record<string, unknown>): {
      download(filename?: string): void
      open(): void
      print(): void
      getBlob(cb: (blob: Blob) => void): void
      getDataUrl(cb: (dataUrl: string) => void): void
      getBuffer(cb: (buffer: ArrayBuffer) => void): void
    }
  }
  export default pdfMake
}
