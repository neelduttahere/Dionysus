import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  TileRequestCompletePayload,
  TileRequestErrorPayload,
  TileRequestRecord,
  TileRequestStartPayload,
} from '@/types/tileDiagnostics'
import {
  registerTileDiagnosticsProtocol,
  wrapDiagnosticTileUrl,
} from '@/utils/map/tileDiagnosticsProtocol'

const MAX_TILE_DIAGNOSTIC_RECORDS = 250

export function useTileDiagnostics() {
  const [records, setRecords] = useState<TileRequestRecord[]>([])

  const setRecordsWithRef = useCallback(
    (
      updater: (
        currentRecords: TileRequestRecord[],
      ) => TileRequestRecord[],
    ) => {
      setRecords((currentRecords) => {
        const nextRecords = updater(currentRecords)
        return nextRecords
      })
    },
    [],
  )

  const markStarted = useCallback(
    ({ id, url, startedAt }: TileRequestStartPayload) => {
      setRecordsWithRef((currentRecords) =>
        [
          {
            id,
            url,
            startedAt,
            status: 'pending' as const,
          },
          ...currentRecords,
        ].slice(0, MAX_TILE_DIAGNOSTIC_RECORDS),
      )
    },
    [setRecordsWithRef],
  )

  const markSuccess = useCallback(
    ({ id, completedAt, durationMs, statusCode }: TileRequestCompletePayload) => {
      setRecordsWithRef((currentRecords) =>
        updateRecord(currentRecords, id, {
          status: 'success',
          completedAt,
          durationMs,
          statusCode,
        }),
      )
    },
    [setRecordsWithRef],
  )

  const markCancelled = useCallback(
    ({ id, completedAt, durationMs, errorMessage }: TileRequestErrorPayload) => {
      setRecordsWithRef((currentRecords) =>
        updateRecord(currentRecords, id, {
          status: 'cancelled',
          completedAt,
          durationMs,
          errorMessage,
        }),
      )
    },
    [setRecordsWithRef],
  )

  const markError = useCallback(
    ({
      id,
      completedAt,
      durationMs,
      statusCode,
      errorMessage,
    }: TileRequestErrorPayload) => {
      setRecordsWithRef((currentRecords) =>
        updateRecord(currentRecords, id, {
          status: 'error',
          completedAt,
          durationMs,
          statusCode,
          errorMessage,
        }),
      )
    },
    [setRecordsWithRef],
  )

  useEffect(() => {
    return registerTileDiagnosticsProtocol({
      onStart: markStarted,
      onSuccess: markSuccess,
      onCancel: markCancelled,
      onError: markError,
    })
  }, [markStarted, markSuccess, markCancelled, markError])

  const hasPendingRequests = useMemo(
    () => records.some((record) => record.status === 'pending'),
    [records],
  )

  const clearAllRecords = useCallback(() => {
    setRecordsWithRef(() => [])
  }, [setRecordsWithRef])

  return {
    records,
    hasPendingRequests,
    wrapTileUrl: wrapDiagnosticTileUrl,
    clearAllRecords,
  }
}

function updateRecord(
  records: TileRequestRecord[],
  id: string,
  patch: Partial<TileRequestRecord>,
) {
  return records.map((record) =>
    record.id === id
      ? {
          ...record,
          ...patch,
        }
      : record,
  )
}
