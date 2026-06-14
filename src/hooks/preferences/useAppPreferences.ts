import { defaultPreferences } from '@/config/defaults'
import type { AppPreferences } from '@/types/preferences'
import { useLocalStoragePreference } from './useLocalStoragePreference'

export function useAppPreferences() {
  return useLocalStoragePreference<AppPreferences>(
    'dionysus.preferences',
    defaultPreferences,
  )
}
