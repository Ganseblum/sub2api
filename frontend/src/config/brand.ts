export const APP_BRAND_NAME = 'YOUC'
export const LEGACY_BRAND_NAME = 'Sub2API'

export function normalizeBrandName(value?: string | null): string {
  const name = typeof value === 'string' ? value.trim() : ''
  if (!name || name === LEGACY_BRAND_NAME) {
    return APP_BRAND_NAME
  }
  return name
}
