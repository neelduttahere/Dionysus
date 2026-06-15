import {
  CheckCircledIcon,
  CrossCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons'
import { Flex, Spinner, Table, Text, Tooltip } from '@radix-ui/themes'
import type { TileRequestRecord } from '@/types/tileDiagnostics'
import {
  formatTileRequestDuration,
  getTileRequestStatusLabel,
} from '@/utils/map/tileDiagnosticsStatus'

interface TileDiagnosticsTableProps {
  records: TileRequestRecord[]
}

export function TileDiagnosticsTable({ records }: TileDiagnosticsTableProps) {
  if (records.length === 0) {
    return (
      <Flex align="center" justify="center" className="tile-diagnostics-empty">
        <Text size="2" color="gray">
          No TiTiler tile requests recorded yet.
        </Text>
      </Flex>
    )
  }

  return (
    <Table.Root size="1" variant="surface" className="tile-diagnostics-table">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell className="tile-diagnostics-request-column">
            Request
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="tile-diagnostics-status-column">
            Status
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="tile-diagnostics-timing-column">
            Timing
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {records.map((record) => (
          <Table.Row key={record.id}>
            <Table.Cell className="tile-diagnostics-request-column">
              <Tooltip content={record.url}>
                <Text size="1" className="tile-diagnostics-url">
                  {record.url}
                </Text>
              </Tooltip>
            </Table.Cell>
            <Table.Cell className="tile-diagnostics-status-column">
              <TileRequestStatus record={record} />
            </Table.Cell>
            <Table.Cell className="tile-diagnostics-timing-column">
              <Flex align="center" gap="1" className="tile-diagnostics-timing">
                <StopwatchIcon />
                <Text size="1">{formatTileRequestDuration(record)}</Text>
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function TileRequestStatus({ record }: { record: TileRequestRecord }) {
  const label = getTileRequestStatusLabel(record)

  if (record.status === 'pending') {
    return (
      <Flex align="center" gap="2" className="tile-diagnostics-status pending">
        <Spinner size="1" />
        <Text size="1">{label}</Text>
      </Flex>
    )
  }

  if (record.status === 'success') {
    return (
      <Flex align="center" gap="2" className="tile-diagnostics-status success">
        <CheckCircledIcon />
        <Text size="1">{label}</Text>
      </Flex>
    )
  }

  return (
    <Flex align="center" gap="2" className="tile-diagnostics-status error">
      <CrossCircledIcon />
      <Text size="1">{label}</Text>
    </Flex>
  )
}
