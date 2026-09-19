import { useState, useCallback, useRef } from 'react'

interface UseUndoRedoReturn<T> {
  state: T
  set: (next: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clear: () => void
}

export function useUndoRedo<T>(initial: T, maxHistory = 50): UseUndoRedoReturn<T> {
  const [state, setState] = useState(initial)
  const historyRef = useRef<T[]>([initial])
  const pointerRef = useRef(0)
  const [, forceRender] = useState(0)
  const bump = useCallback(() => forceRender((n) => n + 1), [])

  const set = useCallback((next: T | ((prev: T) => T)) => {
    const prevState = historyRef.current[pointerRef.current]
    const resolved = typeof next === 'function' ? (next as (p: T) => T)(prevState) : next
    const history = historyRef.current
    const ptr = pointerRef.current
    const newHistory = history.slice(0, ptr + 1)
    newHistory.push(resolved)
    if (newHistory.length > maxHistory) newHistory.shift()
    historyRef.current = newHistory
    pointerRef.current = newHistory.length - 1
    setState(resolved)
    bump()
  }, [maxHistory, bump])

  const undo = useCallback(() => {
    const ptr = pointerRef.current
    if (ptr <= 0) return
    pointerRef.current = ptr - 1
    setState(historyRef.current[ptr - 1])
    bump()
  }, [bump])

  const redo = useCallback(() => {
    const history = historyRef.current
    const ptr = pointerRef.current
    if (ptr >= history.length - 1) return
    pointerRef.current = ptr + 1
    setState(history[ptr + 1])
    bump()
  }, [bump])

  const clear = useCallback(() => {
    historyRef.current = [state]
    pointerRef.current = 0
    bump()
  }, [state, bump])

  return {
    state,
    set,
    undo,
    redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < historyRef.current.length - 1,
    clear,
  }
}
