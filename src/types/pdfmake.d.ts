declare module 'html-to-pdfmake' {
  function htmlToPdfmake(
    html: string,
    win?: Window,
    styles?: Record<string, Record<string, string>>
  ): Record<string, unknown>[]
  export default htmlToPdfmake
}

declare module 'pdfmake/build/vfs_fonts' {
  const fonts: Record<string, Record<string, string>>
  export default fonts
}
