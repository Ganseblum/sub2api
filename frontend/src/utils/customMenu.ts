import type { CustomMenuItem } from '@/types'

export const MIGRATED_PURCHASE_MENU_ID = 'migrated_purchase_subscription'

type Translate = (key: string) => string

export function isMigratedPurchaseMenuItem(item: Pick<CustomMenuItem, 'id'>): boolean {
  return item.id === MIGRATED_PURCHASE_MENU_ID
}

export function localizeCustomMenuLabel(
  item: Pick<CustomMenuItem, 'id' | 'label'>,
  t: Translate,
): string {
  return isMigratedPurchaseMenuItem(item) ? t('nav.buySubscription') : item.label
}

export function shouldHideCustomMenuItem(
  item: Pick<CustomMenuItem, 'id'>,
  options: { hasBuiltInPurchaseEntry: boolean },
): boolean {
  return options.hasBuiltInPurchaseEntry && isMigratedPurchaseMenuItem(item)
}
