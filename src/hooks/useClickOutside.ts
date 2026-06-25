import { useEffect, type RefObject } from 'react'

export function useClickOutside(ref: RefObject<HTMLElement | null>, fn: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fn()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, fn])
}
