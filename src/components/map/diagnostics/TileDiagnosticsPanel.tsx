import { TrashIcon } from '@radix-ui/react-icons'
import { Button, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes'
import { TileDiagnosticsTable } from '@/components/map/diagnostics/TileDiagnosticsTable'
import type { TileRequestRecord } from '@/types/tileDiagnostics'
import './TileDiagnosticsPanel.css'

interface TileDiagnosticsPanelProps {
  records: TileRequestRecord[]
  pendingCount: number
  onClear: () => void
}

export function TileDiagnosticsPanel({
  records,
  pendingCount,
  onClear,
}: TileDiagnosticsPanelProps) {
  return (
    <div className="tile-diagnostics-panel">
      <Flex align="start" justify="between" gap="4">
        <div>
          <Heading as="h2" size="3">
            Tile diagnostics
          </Heading>
          <Text as="p" size="2" color="gray" className="tile-diagnostics-intro">
            TiTiler raster tile requests made by the map.
          </Text>
        </div>
        <Button
          type="button"
          variant="surface"
          size="2"
          onClick={onClear}
          disabled={records.length === 0}
        >
          <TrashIcon />
          Clear
        </Button>
      </Flex>

      <Flex gap="3" align="center" className="tile-diagnostics-summary">
        <Text size="1" color="gray">
          {records.length} total
        </Text>
        <Text size="1" color={pendingCount > 0 ? 'amber' : 'gray'}>
          {pendingCount} pending
        </Text>
      </Flex>

      <ScrollArea
        className="tile-diagnostics-scroll"
        scrollbars="vertical"
        type="hover"
      >
        <TileDiagnosticsTable records={records} />
      </ScrollArea>
    </div>
  )
}
