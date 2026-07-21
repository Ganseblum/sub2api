import { describe, expect, it } from 'vitest'

import {
  MIGRATED_PURCHASE_MENU_ID,
  isMigratedPurchaseMenuItem,
  localizeCustomMenuLabel,
  shouldHideCustomMenuItem,
} from '@/utils/customMenu'

const t = (key: string) => key === 'nav.buySubscription' ? 'Recharge Center' : key

describe('migrated purchase custom menu', () => {
  it('recognizes only the menu item created by the purchase migration', () => {
    expect(isMigratedPurchaseMenuItem({ id: MIGRATED_PURCHASE_MENU_ID })).toBe(true)
    expect(isMigratedPurchaseMenuItem({ id: 'custom-purchase-link' })).toBe(false)
  })

  it('localizes the migrated label without rewriting ordinary custom labels', () => {
    expect(localizeCustomMenuLabel({ id: MIGRATED_PURCHASE_MENU_ID, label: '充值/订阅' }, t))
      .toBe('Recharge Center')
    expect(localizeCustomMenuLabel({ id: 'custom-help', label: 'Help Center' }, t))
      .toBe('Help Center')
  })

  it('hides the migrated item only when the built-in purchase entry is visible', () => {
    expect(shouldHideCustomMenuItem(
      { id: MIGRATED_PURCHASE_MENU_ID },
      { hasBuiltInPurchaseEntry: true },
    )).toBe(true)
    expect(shouldHideCustomMenuItem(
      { id: MIGRATED_PURCHASE_MENU_ID },
      { hasBuiltInPurchaseEntry: false },
    )).toBe(false)
    expect(shouldHideCustomMenuItem(
      { id: 'custom-purchase-link' },
      { hasBuiltInPurchaseEntry: true },
    )).toBe(false)
  })
})
