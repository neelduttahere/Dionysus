import { GearIcon, TimerIcon } from '@radix-ui/react-icons'
import { Button, Popover, Spinner, Tooltip } from '@radix-ui/themes'
import { TileDiagnosticsPanel } from '@/components/map/diagnostics/TileDiagnosticsPanel'
import type { TileRequestRecord } from '@/types/tileDiagnostics'
import './TileDiagnosticsButton.css'

interface TileDiagnosticsButtonProps {
  records: TileRequestRecord[]
  hasPendingRequests: boolean
  onClear: () => void
}

export function TileDiagnosticsButton({
  records,
  hasPendingRequests,
  onClear,
}: TileDiagnosticsButtonProps) {
  const pendingCount = records.filter((record) => record.status === 'pending').length

  return (
    <fieldset className="map-tools map-tools-top">
      <legend className="sr-only">Diagnostics</legend>
      <Popover.Root>
        <Tooltip content="Tile diagnostics">
          <Popover.Trigger>
            <Button
              variant="solid"
              size="2"
              aria-label="Open tile diagnostics"
              className="tile-diagnostics-trigger"
            >
              <TimerIcon />
              Tile Diagnostics
              {hasPendingRequests ? <Spinner size="1" /> : null}
            </Button>
          </Popover.Trigger>
        </Tooltip>
        <Popover.Content
          width="min(720px, calc(100vw - 40px))"
          align="end"
          side="bottom"
          sideOffset={12}
        >
          <TileDiagnosticsPanel
            records={records}
            pendingCount={pendingCount}
            onClear={onClear}
          />
        </Popover.Content>
      </Popover.Root>
    </fieldset>
  )
}
