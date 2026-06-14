import { useCallback, useEffect, useState } from 'react'

export function useLocalStoragePreference<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key)

    if (!storedValue) {
      return defaultValue
    }

    try {
      return JSON.parse(storedValue) as T
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  const reset = useCallback(() => {
    window.localStorage.removeItem(key)
    setValue(defaultValue)
  }, [defaultValue, key])

  return [value, setValue, reset] as const
}
