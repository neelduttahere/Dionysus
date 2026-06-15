import type { AddProtocolAction } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
import type {
  TileRequestCompletePayload,
  TileRequestErrorPayload,
  TileRequestStartPayload,
} from '@/types/tileDiagnostics'

const TILE_DIAGNOSTICS_PROTOCOL = 'dionysus-tile'
const TILE_DIAGNOSTICS_PREFIX = `${TILE_DIAGNOSTICS_PROTOCOL}://`

interface TileDiagnosticsProtocolHandlers {
  onStart: (payload: TileRequestStartPayload) => void
  onSuccess: (payload: TileRequestCompletePayload) => void
  onCancel: (payload: TileRequestErrorPayload) => void
  onError: (payload: TileRequestErrorPayload) => void
}

export function registerTileDiagnosticsProtocol(
  handlers: TileDiagnosticsProtocolHandlers,
) {
  maplibregl.removeProtocol(TILE_DIAGNOSTICS_PROTOCOL)
  maplibregl.addProtocol(
    TILE_DIAGNOSTICS_PROTOCOL,
    createTileDiagnosticsLoader(handlers),
  )

  return () => {
    maplibregl.removeProtocol(TILE_DIAGNOSTICS_PROTOCOL)
  }
}

export function wrapDiagnosticTileUrl(tileUrl: string) {
  if (tileUrl.startsWith(TILE_DIAGNOSTICS_PREFIX)) {
    return tileUrl
  }

  return `${TILE_DIAGNOSTICS_PREFIX}${tileUrl}`
}

function createTileDiagnosticsLoader({
  onStart,
  onSuccess,
  onCancel,
  onError,
}: TileDiagnosticsProtocolHandlers): AddProtocolAction {
  return async (requestParameters, abortController) => {
    const url = unwrapDiagnosticTileUrl(requestParameters.url)
    const id = crypto.randomUUID()
    const startedAt = performance.now()

    onStart({
      id,
      url,
      startedAt,
    })

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
      })

      if (!response.ok) {
        const completedAt = performance.now()
        const durationMs = completedAt - startedAt
        const errorMessage = `HTTP ${response.status} ${response.statusText}`.trim()
        const error = new Error(errorMessage)

        onError({
          id,
          completedAt,
          durationMs,
          statusCode: response.status,
          errorMessage,
        })
        throw Object.assign(error, { diagnosticsRecorded: true })
      }

      const data = await response.arrayBuffer()
      const completedAt = performance.now()
      const durationMs = completedAt - startedAt

      onSuccess({
        id,
        completedAt,
        durationMs,
        statusCode: response.status,
      })

      return { data }
    } catch (error) {
      const completedAt = performance.now()
      const durationMs = completedAt - startedAt
      const errorMessage = getErrorMessage(error)

      if (isDiagnosticsRecordedError(error)) {
        throw error
      }

      if (abortController.signal.aborted || errorMessage === 'AbortError') {
        onCancel({
          id,
          completedAt,
          durationMs,
          errorMessage: 'Cancelled',
        })
      } else {
        onError({
          id,
          completedAt,
          durationMs,
          errorMessage,
        })
      }

      throw error
    }
  }
}

function unwrapDiagnosticTileUrl(url: string) {
  return url.startsWith(TILE_DIAGNOSTICS_PREFIX)
    ? url.slice(TILE_DIAGNOSTICS_PREFIX.length)
    : url
}

function getErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'AbortError'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Network error'
}

function isDiagnosticsRecordedError(
  error: unknown,
): error is Error & { diagnosticsRecorded: true } {
  return (
    error instanceof Error &&
    'diagnosticsRecorded' in error &&
    error.diagnosticsRecorded === true
  )
}
