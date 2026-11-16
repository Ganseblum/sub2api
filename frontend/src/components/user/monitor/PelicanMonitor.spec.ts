import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PelicanMonitor from './PelicanMonitor.vue'

const mocks = vi.hoisted(() => ({ pelican: vi.fn() }))
vi.mock('@/api/channelMonitor', () => ({ pelican: mocks.pelican }))
enableAutoUnmount(afterEach)
beforeEach(() => vi.clearAllMocks())

describe('PelicanMonitor', () => {
  it('opens a selected result in an isolated preview and shows its source', async () => {
    mocks.pelican.mockResolvedValue({ enabled: true, models: ['gpt-test', 'gpt-test-2'], items: [{ id: 1, model: 'gpt-test', status: 'passed', source_length: 9001, artifact: '<html><svg></svg></html>', started_at: '2026-11-16T00:00:00Z', finished_at: '2026-11-16T00:01:00Z' }] })
    const wrapper = mount(PelicanMonitor, { props: { monitorId: 1, monitorName: '测试' }, global: { stubs: { BaseDialog: { props: ['show'], template: '<div v-if="show"><slot /><slot name="footer" /></div>' } } } })
    await flushPromises()
    expect(wrapper.text()).toContain('gpt-test')
    await wrapper.get('button[aria-label="gpt-test 检测通过 · 100分"]').trigger('click')
    expect(wrapper.text()).toContain('开始：')
    expect(wrapper.text()).toContain('结束：')
    expect(wrapper.findAll('button').some(button => button.text() === 'gpt-test-2')).toBe(true)
    const frame = wrapper.get('iframe')
    expect(frame.attributes('sandbox')).toBe('allow-scripts')
    expect(frame.attributes('srcdoc')).toContain("connect-src 'none'")
    await wrapper.findAll('button').find(button => button.text() === '查看源码')!.trigger('click')
    expect(wrapper.get('pre').text()).toBe('<html><svg></svg></html>')
  })

  it('does not display a disabled check', async () => {
    mocks.pelican.mockResolvedValue({ enabled: false, models: [], items: [] })
    const wrapper = mount(PelicanMonitor, { props: { monitorId: 1, monitorName: '测试' } })
    await flushPromises()
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
