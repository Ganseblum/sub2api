import { i18n } from '@/i18n'
import { normalizeBrandName } from '@/config/brand'

const legalDocumentTitles: Record<string, string> = {
  terms: '服务条款',
  'usage-policy': '使用政策',
  'supported-countries': '支持的国家和地区',
  'service-specific-terms': '服务特定条款',
  'admin-compliance': '管理员合规确认'
}

/**
 * 统一生成页面标题，避免多处写入 document.title 产生覆盖冲突。
 * 优先使用 titleKey 通过 i18n 翻译，fallback 到静态 routeTitle。
 */
export function resolveDocumentTitle(
  routeTitle: unknown,
  siteName?: string,
  titleKey?: string,
  routeParams?: Record<string, unknown>
): string {
  const normalizedSiteName = normalizeBrandName(siteName)

  if (routeTitle === 'Legal Document') {
    const documentId = routeParams?.documentId
    if (typeof documentId === 'string' && legalDocumentTitles[documentId]) {
      return `${legalDocumentTitles[documentId]} - ${normalizedSiteName}`
    }
  }

  if (typeof titleKey === 'string' && titleKey.trim()) {
    const translated = i18n.global.t(titleKey)
    if (translated && translated !== titleKey) {
      return `${translated} - ${normalizedSiteName}`
    }
  }

  if (typeof routeTitle === 'string' && routeTitle.trim()) {
    return `${routeTitle.trim()} - ${normalizedSiteName}`
  }

  return normalizedSiteName
}
