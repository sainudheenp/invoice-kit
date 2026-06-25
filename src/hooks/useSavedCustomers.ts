import { useState, useCallback } from 'react'

const STORAGE_KEY = '_savedCust'

function loadCustomers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useSavedCustomers() {
  const [customers, setCustomers] = useState<string[]>(loadCustomers)

  const saveCustomer = useCallback((name: string) => {
    if (!name) return
    setCustomers((prev) => {
      if (prev.includes(name)) return prev
      const next = [...prev, name]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { customers, saveCustomer }
}
