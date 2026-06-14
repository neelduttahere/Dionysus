import { SettingsPanel } from '@/components/settings/SettingsPanel'
import type { useAppPreferences } from '@/hooks/preferences/useAppPreferences'

interface SettingsPanelContainerProps {
  preferences: ReturnType<typeof useAppPreferences>[0]
  onPreferencesChange: ReturnType<typeof useAppPreferences>[1]
  onReset: ReturnType<typeof useAppPreferences>[2]
}

export function SettingsPanelContainer({
  preferences,
  onPreferencesChange,
  onReset,
}: SettingsPanelContainerProps) {
  return (
    <SettingsPanel
      preferences={preferences}
      onPreferencesChange={onPreferencesChange}
      onReset={onReset}
    />
  )
}
