import { DataList, Text } from '@radix-ui/themes'
import type { AreaUnit } from '@/types/preferences'
import type { ParsedStacItem } from '@/types/stac'
import { formatArea } from '@/utils/geo/formatArea'

interface TimelineItemDetailsProps {
  item: ParsedStacItem
  areaUnit: AreaUnit
}

export function TimelineItemDetails({ item, areaUnit }: TimelineItemDetailsProps) {
  return (
    <div className="timeline-details">
      <Text size="1" weight="bold">
        {item.id}
      </Text>
      <DataList.Root size="1">
        <TimelineDetail label="Datetime" value={item.datetime ?? 'Unknown'} />
        <TimelineDetail label="Constellation" value={item.constellation ?? 'Unknown'} />
        <TimelineDetail label="Platform" value={item.platform ?? 'Unknown'} />
        <TimelineDetail label="Bands" value={String(item.bandCount)} />
        <TimelineDetail
          label="Coverage"
          value={
            item.areaSquareMeters === null
              ? 'Unknown'
              : formatArea(item.areaSquareMeters, areaUnit)
          }
        />
      </DataList.Root>
    </div>
  )
}

function TimelineDetail({ label, value }: { label: string; value: string }) {
  return (
    <DataList.Item>
      <DataList.Label>{label}</DataList.Label>
      <DataList.Value>{value}</DataList.Value>
    </DataList.Item>
  )
}
