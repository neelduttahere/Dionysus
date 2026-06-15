export type TileRequestStatus = 'pending' | 'success' | 'cancelled' | 'error'

export interface TileRequestRecord {
  id: string
  url: string
  status: TileRequestStatus
  startedAt: number
  completedAt?: number
  durationMs?: number
  statusCode?: number
  errorMessage?: string
}

export interface TileRequestStartPayload {
  id: string
  url: string
  startedAt: number
}

export interface TileRequestCompletePayload {
  id: string
  completedAt: number
  durationMs: number
  statusCode?: number
}

export interface TileRequestErrorPayload extends TileRequestCompletePayload {
  errorMessage: string
}
