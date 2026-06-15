import type { TileRequestRecord } from '@/types/tileDiagnostics'

export function formatTileRequestDuration(record: TileRequestRecord) {
  if (record.status === 'pending') {
    return 'Running'
  }

  if (typeof record.durationMs !== 'number') {
    return '-'
  }

  if (record.durationMs < 1000) {
    return `${Math.round(record.durationMs)} ms`
  }

  return `${(record.durationMs / 1000).toFixed(2)} s`
}

export function getTileRequestStatusLabel(record: TileRequestRecord) {
  if (record.status === 'pending') {
    return 'Pending'
  }

  if (record.status === 'success') {
    return record.statusCode ? `${record.statusCode} Success` : 'Success'
  }

  if (record.status === 'cancelled') {
    return 'Cancelled'
  }

  return record.statusCode
    ? `${record.statusCode} ${record.errorMessage ?? 'Failed'}`
    : (record.errorMessage ?? 'Network error')
}
