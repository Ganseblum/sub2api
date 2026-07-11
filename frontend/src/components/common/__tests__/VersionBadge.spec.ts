import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VersionBadge from '@/components/common/VersionBadge.vue'

const { appStore, authStore } = vi.hoisted(() => ({
  appStore: {
    versionLoading: false,
    currentVersion: '',
    latestVersion: '',
    hasUpdate: false,
    releaseInfo: null,
    buildType: 'source',
    fetchVersion: vi.fn().mockResolvedValue(null),
    clearVersionCache: vi.fn()
  },
  authStore: {
    isAdmin: true
  }
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

vi.mock('@/stores', () => ({
  useAppStore: () => appStore,
  useAuthStore: () => authStore
}))

vi.mock('@/api/admin/system', () => ({
  performUpdate: vi.fn(),
  restartService: vi.fn(),
  getRollbackVersions: vi.fn(),
  rollback: vi.fn()
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({
    copied: false,
    copyToClipboard: vi.fn()
  })
}))

function mountBadge() {
  return mount(VersionBadge, {
    global: {
      stubs: {
        Icon: true
      }
    }
  })
}

describe('VersionBadge', () => {
  beforeEach(() => {
    appStore.versionLoading = false
    appStore.currentVersion = ''
    appStore.latestVersion = ''
    appStore.hasUpdate = false
    appStore.releaseInfo = null
    appStore.buildType = 'source'
    appStore.fetchVersion.mockClear()
    appStore.clearVersionCache.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows a skeleton only while version data is loading', () => {
    appStore.versionLoading = true

    const wrapper = mountBadge()
    const button = wrapper.get('button')

    expect(button.find('.animate-pulse').exists()).toBe(true)
    expect(button.attributes('title')).toBe('version.checking')
    wrapper.unmount()
  })

  it('shows an explicit unavailable state after loading without a version', async () => {
    const wrapper = mountBadge()
    const button = wrapper.get('button')

    expect(button.find('.animate-pulse').exists()).toBe(false)
    expect(button.text()).toContain('v--')
    expect(button.attributes('title')).toBe('version.unavailable')

    await button.trigger('click')
    const dropdown = wrapper.get('.absolute.left-0.z-50')
    expect(dropdown.text()).not.toContain('--')
    expect(dropdown.text().match(/version\.unavailable/g)).toHaveLength(1)
    expect(dropdown.text()).toContain('version.retry')
    wrapper.unmount()
  })

  it('shows the current version and the up-to-date title when available', () => {
    appStore.currentVersion = '1.2.3'

    const wrapper = mountBadge()
    const button = wrapper.get('button')

    expect(button.find('.animate-pulse').exists()).toBe(false)
    expect(button.text()).toContain('v1.2.3')
    expect(button.attributes('title')).toBe('version.upToDate')
    wrapper.unmount()
  })
})
