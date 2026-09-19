export function fmtName(s: string): string {
  if (!s) return s
  // Title-case only Latin words; leave Arabic / CJK untouched.
  // Use \p{L} with unicode flag where available, fallback to \S+
  try {
    return s.replace(/\p{L}[\p{L}\p{M}'-]*/gu, (w) => {
      if (/[A-Za-z]/.test(w)) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      }
      return w
    })
  } catch {
    return s.replace(/\S+/g, (w) => {
      if (/[A-Za-z]/.test(w)) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      return w
    })
  }
}