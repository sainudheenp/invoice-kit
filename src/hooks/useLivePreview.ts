import { useEffect, useRef, useState } from 'react'

export function useLivePreview(build: () => string, dep: unknown, delay = 250): string {
  const buildRef = useRef(build)
  buildRef.current = build
  const [html, setHtml] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setHtml(buildRef.current())
    }, delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])

  return html
}