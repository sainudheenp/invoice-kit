import { useEffect } from 'react'

interface ShortcutMap {
  [key: string]: () => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      const key = e.key.toLowerCase()
      // Only allow registered shortcut keys inside inputs; block plain typing
      const tag = (e.target as HTMLElement)?.tagName
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable
      if (inField) {
        const isSaveKey = Object.keys(shortcuts).some(k => k.toLowerCase() === key)
        if (!isSaveKey) return
      }
      for (const [k, fn] of Object.entries(shortcuts)) {
        if (key === k.toLowerCase()) { e.preventDefault(); fn(); return }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts])
}
