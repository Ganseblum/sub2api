import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContactView from '../ContactView.vue'

const copyToClipboard = vi.fn()

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({ copyToClipboard }),
}))

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => ({
        'contact.title': '联系我们',
        'contact.description': '使用过程中遇到问题或有任何建议，可以通过以下方式联系我们。',
        'contact.customerService': '客服 QQ',
        'contact.customerServiceHint': '添加好友时请备注你注册的账号。',
        'contact.qqGroup': 'QQ 交流群',
        'contact.qqGroupHint': '申请加群时请备注你注册的账号。',
        'contact.copyNumber': '复制 QQ 号',
        'contact.copyGroupNumber': '复制群号',
        'contact.copied': '号码已复制',
        'contact.noticeTitle': '申请备注',
        'contact.notice': '添加客服或申请加群时，请务必填写你在本平台注册的账号。未备注账号的申请一律不通过。',
      } as Record<string, string>)[key] ?? key,
    }),
  }
})

describe('ContactView', () => {
  beforeEach(() => {
    copyToClipboard.mockReset()
  })

  function mountView() {
    return mount(ContactView, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('renders the contact channels moved out of Help Center', () => {
    const wrapper = mountView()

    expect(wrapper.text()).toContain('联系我们')
    expect(wrapper.text()).toContain('977252487')
    expect(wrapper.text()).toContain('821362587')
    expect(wrapper.text()).toContain('未备注账号的申请一律不通过')
  })

  it('copies each contact number', async () => {
    const wrapper = mountView()
    const customerServiceButton = wrapper.get('button[aria-label="复制 QQ 号"]')
    const groupButton = wrapper.get('button[aria-label="复制群号"]')

    await customerServiceButton.trigger('click')
    await groupButton.trigger('click')

    expect(copyToClipboard).toHaveBeenNthCalledWith(1, '977252487', '号码已复制')
    expect(copyToClipboard).toHaveBeenNthCalledWith(2, '821362587', '号码已复制')
  })
})
