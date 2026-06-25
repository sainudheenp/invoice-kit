import { useEffect } from 'react'

interface ShortcutMap {
  [key: string]: () => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (!e.ctrlKey && !e.metaKey) return
      const key = e.key.toLowerCase()
      for (const [k, fn] of Object.entries(shortcuts)) {
        if (key === k) { e.preventDefault(); fn(); return }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts])
}
