import type { AreaUnit } from '@/types/preferences'

const SQUARE_METERS_PER_ACRE = 4046.8564224

export function formatArea(squareMeters: number, unit: AreaUnit): string {
  const value = convertArea(squareMeters, unit)
  const suffix = getAreaUnitLabel(unit)

  return `${formatNumber(value)} ${suffix}`
}

export function convertArea(squareMeters: number, unit: AreaUnit): number {
  switch (unit) {
    case 'm2':
      return squareMeters
    case 'km2':
      return squareMeters / 1_000_000
    case 'hectare':
      return squareMeters / 10_000
    case 'acre':
      return squareMeters / SQUARE_METERS_PER_ACRE
  }
}

export function getAreaUnitLabel(unit: AreaUnit): string {
  switch (unit) {
    case 'm2':
      return 'm2'
    case 'km2':
      return 'km2'
    case 'hectare':
      return 'ha'
    case 'acre':
      return 'ac'
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en', {
    maximumFractionDigits: value >= 100 ? 1 : 2,
  }).format(value)
}
