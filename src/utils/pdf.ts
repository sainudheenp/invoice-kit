export function printHTML(html: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;height:1123px;border:none;overflow:hidden;'
  document.body.appendChild(iframe)
  iframe.srcdoc = html
  iframe.onload = () => {
    const doc = iframe.contentDocument
    if (doc) {
      const style = doc.createElement('style')
      style.textContent = 'html,body{margin:0!important;padding:0!important;background:#fff!important;}@media print{html,body{margin:0!important;padding:0!important;background:#fff!important;}}'
      doc.head.appendChild(style)
    }
    iframe.contentWindow!.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }
}

export function downloadText(html: string, filename: string): void {
  const div = document.createElement('div')
  div.innerHTML = html
  const cleaned = (div.textContent || '').replace(/\s+/g, ' ').trim()
  const blob = new Blob([cleaned], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename + '.txt'
  a.click(); URL.revokeObjectURL(url)
}
