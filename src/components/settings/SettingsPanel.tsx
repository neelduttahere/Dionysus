import { ReloadIcon } from '@radix-ui/react-icons'
import {
  Button,
  Heading,
  Select,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes'
import type { AppPreferences } from '@/types/preferences'
import './SettingsPanel.css'

interface SettingsPanelProps {
  preferences: AppPreferences
  onPreferencesChange: (preferences: AppPreferences) => void
  onReset: () => void
}

export function SettingsPanel({
  preferences,
  onPreferencesChange,
  onReset,
}: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <div>
        <Heading as="h2" size="5">
          Settings
        </Heading>
        <Text as="p" size="2" color="gray" className="settings-intro">
          Configure local preferences for TiTiler, basemaps, and measurements.
        </Text>
      </div>

      <Separator size="4" />

      <div className="field">
        <Text size="2" weight="medium">
          TiTiler endpoint
        </Text>
        <TextField.Root
          aria-label="TiTiler endpoint"
          value={preferences.titilerUrl}
          onChange={(event) =>
            onPreferencesChange({
              ...preferences,
              titilerUrl: event.target.value,
            })
          }
        />
      </div>

      <div className="field">
        <Text size="2" weight="medium">
          Basemap
        </Text>
        <Select.Root
          value={preferences.basemapKind}
          onValueChange={(value) =>
            onPreferencesChange({
              ...preferences,
              basemapKind: value as AppPreferences['basemapKind'],
            })
          }
        >
          <Select.Trigger aria-label="Basemap" />
          <Select.Content position="popper" side="top">
            <Select.Item value="osm">OpenStreetMap</Select.Item>
            <Select.Item value="custom-xyz">Custom XYZ</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      <div className="field">
        <Text size="2" weight="medium">
          Custom XYZ URL
        </Text>
        <TextField.Root
          aria-label="Custom XYZ URL"
          value={preferences.customXyzUrl}
          onChange={(event) =>
            onPreferencesChange({
              ...preferences,
              customXyzUrl: event.target.value,
            })
          }
        />
      </div>

      <div className="field">
        <Text size="2" weight="medium">
          Area unit
        </Text>
        <Select.Root
          value={preferences.areaUnit}
          onValueChange={(value) =>
            onPreferencesChange({
              ...preferences,
              areaUnit: value as AppPreferences['areaUnit'],
            })
          }
        >
          <Select.Trigger aria-label="Area unit" />
          <Select.Content position="popper" side="top">
            <Select.Item value="km2">Square kilometers</Select.Item>
            <Select.Item value="m2">Square meters</Select.Item>
            <Select.Item value="hectare">Hectares</Select.Item>
            <Select.Item value="acre">Acres</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      <Button variant="surface" onClick={onReset}>
        <ReloadIcon />
        Reset preferences
      </Button>
    </div>
  )
}
