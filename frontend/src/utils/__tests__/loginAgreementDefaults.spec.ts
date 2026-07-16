import { describe, expect, it } from 'vitest'
import {
  buildDefaultLoginAgreementDocuments,
  getDefaultLoginAgreementContent,
  hydrateLoginAgreementDocuments,
} from '../loginAgreementDefaults'

describe('login agreement default documents', () => {
  it('builds built-in documents with real markdown content', () => {
    const documents = buildDefaultLoginAgreementDocuments()

    expect(documents.map((doc) => doc.id)).toEqual([
      'terms',
      'usage-policy',
      'supported-regions',
      'service-specific-terms',
    ])
    expect(documents.every((doc) => doc.content_md.includes('生效日期'))).toBe(true)
  })

  it('hydrates empty built-in content while preserving custom content', () => {
    const documents = hydrateLoginAgreementDocuments([
      { id: 'terms', title: '服务条款', content_md: '' },
      { id: 'custom-policy', title: 'Custom Policy', content_md: '# Keep me' },
    ])

    expect(documents[0].content_md).toContain('# 服务条款')
    expect(documents[1].content_md).toBe('# Keep me')
  })

  it('can localize fallback titles and content', () => {
    const localText = (_zh: string, en: string) => en

    expect(buildDefaultLoginAgreementDocuments(localText)[0].title).toBe('Terms of Service')
    expect(getDefaultLoginAgreementContent('terms', localText)).toContain('# Terms of Service')
  })
})
