import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

const {
  getPublicSettingsMock,
  loginMock,
  registerMock,
  pushMock,
  showErrorMock,
  showSuccessMock,
  showWarningMock
} = vi.hoisted(() => ({
  getPublicSettingsMock: vi.fn(),
  loginMock: vi.fn(),
  registerMock: vi.fn(),
  pushMock: vi.fn(),
  showErrorMock: vi.fn(),
  showSuccessMock: vi.fn(),
  showWarningMock: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    currentRoute: { value: { query: {} } },
    push: pushMock
  }),
  useRoute: () => ({ query: {} })
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
      locale: { value: 'zh-CN' }
    })
  }
})

vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    login: (...args: unknown[]) => loginMock(...args),
    register: (...args: unknown[]) => registerMock(...args)
  }),
  useAppStore: () => ({
    showError: (...args: unknown[]) => showErrorMock(...args),
    showSuccess: (...args: unknown[]) => showSuccessMock(...args),
    showWarning: (...args: unknown[]) => showWarningMock(...args)
  })
}))

vi.mock('@/api/auth', () => ({
  getPublicSettings: (...args: unknown[]) => getPublicSettingsMock(...args),
  isTotp2FARequired: () => false,
  isWeChatWebOAuthEnabled: () => false,
  validateInvitationCode: vi.fn(),
  validatePromoCode: vi.fn()
}))

const publicSettings = {
  registration_enabled: true,
  email_verify_enabled: false,
  promo_code_enabled: true,
  invitation_code_enabled: true,
  turnstile_enabled: false,
  turnstile_site_key: '',
  site_name: 'Sub2API',
  linuxdo_oauth_enabled: false,
  dingtalk_oauth_enabled: false,
  backend_mode_enabled: false,
  oidc_oauth_enabled: false,
  oidc_oauth_provider_name: 'OIDC',
  github_oauth_enabled: true,
  google_oauth_enabled: false,
  password_reset_enabled: false,
  registration_email_suffix_whitelist: [],
  login_agreement_enabled: true,
  login_agreement_mode: 'checkbox',
  login_agreement_updated_at: '2026-07-14',
  login_agreement_revision: 'agreement-revision-1',
  login_agreement_documents: [{ id: 'service-policy', title: '服务政策' }]
}

const globalStubs = {
  AuthLayout: { template: '<div><slot /><slot name="footer" /></div>' },
  Icon: true,
  RouterLink: { template: '<a><slot /></a>' },
  TurnstileWidget: true,
  TotpLoginModal: true,
  EmailOAuthButtons: {
    props: ['disabled'],
    template: '<button data-testid="oauth-action" :disabled="disabled">OAuth</button>'
  },
  LinuxDoOAuthSection: true,
  DingTalkOAuthSection: true,
  WechatOAuthSection: true,
  OidcOAuthSection: true,
  transition: false
}

describe('authentication agreement gating', () => {
  beforeEach(() => {
    getPublicSettingsMock.mockReset()
    loginMock.mockReset()
    registerMock.mockReset()
    pushMock.mockReset()
    showErrorMock.mockReset()
    showSuccessMock.mockReset()
    showWarningMock.mockReset()
    localStorage.clear()
    sessionStorage.clear()
    getPublicSettingsMock.mockResolvedValue(publicSettings)
  })

  it('keeps login fields editable while consent-gating login actions', async () => {
    const wrapper = mount(LoginView, { global: { stubs: globalStubs } })

    await flushPromises()

    const email = wrapper.get<HTMLInputElement>('#email')
    const password = wrapper.get<HTMLInputElement>('#password')
    const submit = wrapper.get<HTMLButtonElement>('button[type="submit"]')
    const oauth = wrapper.get<HTMLButtonElement>('[data-testid="oauth-action"]')

    expect(email.element.disabled).toBe(false)
    expect(password.element.disabled).toBe(false)
    await email.setValue('user@example.com')
    await password.setValue('secret-123')
    expect(email.element.value).toBe('user@example.com')
    expect(password.element.value).toBe('secret-123')
    expect(submit.element.disabled).toBe(true)
    expect(oauth.element.disabled).toBe(true)

    await wrapper.get<HTMLInputElement>('#login-agreement-consent').setValue(true)

    expect(submit.element.disabled).toBe(false)
    expect(oauth.element.disabled).toBe(false)
  })

  it('keeps registration fields editable while consent-gating registration actions', async () => {
    const wrapper = mount(RegisterView, { global: { stubs: globalStubs } })

    await flushPromises()

    const email = wrapper.get<HTMLInputElement>('#email')
    const password = wrapper.get<HTMLInputElement>('#password')
    const invitationCode = wrapper.get<HTMLInputElement>('#invitation_code')
    const promoCode = wrapper.get<HTMLInputElement>('#promo_code')
    const submit = wrapper.get<HTMLButtonElement>('button[type="submit"]')
    const oauth = wrapper.get<HTMLButtonElement>('[data-testid="oauth-action"]')

    expect(email.element.disabled).toBe(false)
    expect(password.element.disabled).toBe(false)
    expect(invitationCode.element.disabled).toBe(false)
    expect(promoCode.element.disabled).toBe(false)
    await email.setValue('new-user@example.com')
    await password.setValue('secret-123')
    expect(email.element.value).toBe('new-user@example.com')
    expect(password.element.value).toBe('secret-123')
    expect(submit.element.disabled).toBe(true)
    expect(oauth.element.disabled).toBe(true)

    await wrapper.get<HTMLInputElement>('#login-agreement-consent').setValue(true)

    expect(submit.element.disabled).toBe(false)
    expect(oauth.element.disabled).toBe(false)
  })
})
