import {
  GearIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  RulerSquareIcon,
  SliderIcon,
  TargetIcon,
} from '@radix-ui/react-icons'
import {
  Button,
  Flex,
  IconButton,
  Popover,
  Select,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import type { ComposerState } from '@/types/composer'
import type { AppPreferences } from '@/types/preferences'
import './RightMapControls.css'

interface RightMapControlsProps {
  composerState?: ComposerState
  preferences: AppPreferences
  cursor: { longitude: number; latitude: number } | null
  onPreferencesChange: (preferences: AppPreferences) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onEnableSwipe: () => void
}

export function RightMapControls({
  composerState,
  preferences,
  cursor,
  onPreferencesChange,
  onZoomIn,
  onZoomOut,
  onEnableSwipe,
}: RightMapControlsProps) {
  const hasStacUrls = Boolean(
    composerState?.single.urls.length ||
      composerState?.left.urls.length ||
      composerState?.right.urls.length,
  )

  return (
    <>
      <fieldset className="map-tools map-tools-top">
        <legend className="sr-only">Application tools</legend>
        <Tooltip content="Measure distance or area">
          <IconButton
            variant="surface"
            size="3"
            aria-label="Measurement tool"
            onClick={() => undefined}
          >
            <RulerSquareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Search places">
          <IconButton
            variant="surface"
            size="3"
            aria-label="Places search"
            onClick={() => undefined}
          >
            <MagnifyingGlassIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          content={
            hasStacUrls
              ? 'Enable swipe compare'
              : 'Add at least one STAC URL before enabling swipe compare.'
          }
        >
          <IconButton
            variant="surface"
            size="3"
            aria-label="Swipe compare"
            disabled={!hasStacUrls}
            onClick={onEnableSwipe}
          >
            <SliderIcon />
          </IconButton>
        </Tooltip>
      </fieldset>

      <fieldset className="map-tools map-tools-bottom">
        <legend className="sr-only">Map tools</legend>
        <Tooltip content="Zoom in">
          <IconButton
            variant="surface"
            size="3"
            aria-label="Zoom in"
            onClick={onZoomIn}
          >
            <PlusIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Zoom out">
          <IconButton
            variant="surface"
            size="3"
            aria-label="Zoom out"
            onClick={onZoomOut}
          >
            <MinusIcon />
          </IconButton>
        </Tooltip>
        <Popover.Root>
          <Tooltip content="Basemap">
            <Popover.Trigger>
              <IconButton variant="surface" size="3" aria-label="Basemap switcher">
                <LayersIcon />
              </IconButton>
            </Popover.Trigger>
          </Tooltip>
          <Popover.Content width="300px">
            <Flex direction="column" gap="3">
              <Text size="2" weight="bold">
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
                <Select.Content>
                  <Select.Item value="osm">OpenStreetMap</Select.Item>
                  <Select.Item value="custom-xyz">Custom XYZ</Select.Item>
                </Select.Content>
              </Select.Root>
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
              <Button asChild variant="soft">
                <Link to="/map/settings">Open settings</Link>
              </Button>
            </Flex>
          </Popover.Content>
        </Popover.Root>
        <Tooltip content="Settings">
          <IconButton asChild variant="surface" size="3" aria-label="Settings">
            <Link to="/map/settings">
              <GearIcon />
            </Link>
          </IconButton>
        </Tooltip>
        <div className="cursor-readout">
          <TargetIcon />
          <span>{formatCursor(cursor)}</span>
        </div>
      </fieldset>
    </>
  )
}

function formatCursor(cursor: RightMapControlsProps['cursor']) {
  if (!cursor) {
    return 'Move cursor'
  }

  return `${cursor.latitude.toFixed(5)}, ${cursor.longitude.toFixed(5)}`
}
