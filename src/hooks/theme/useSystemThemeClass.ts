import { useEffect } from 'react'

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'

export function useSystemThemeClass() {
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY)
    const root = document.documentElement
    const updateThemeClass = () => {
      const appearance = mediaQuery.matches ? 'dark' : 'light'
      const oppositeAppearance = mediaQuery.matches ? 'light' : 'dark'

      root.classList.remove(oppositeAppearance, `${oppositeAppearance}-theme`)
      root.classList.add(appearance)
      root.style.colorScheme = appearance
    }

    updateThemeClass()
    mediaQuery.addEventListener('change', updateThemeClass)

    return () => {
      mediaQuery.removeEventListener('change', updateThemeClass)
      root.classList.remove('light', 'dark')
      root.style.removeProperty('color-scheme')
    }
  }, [])
}
