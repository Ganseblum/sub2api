import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import en from '../locales/en'
import zh from '../locales/zh'

type FlatMessages = Record<string, string>

function flattenMessages(node: unknown, path = '', out: FlatMessages = {}): FlatMessages {
  if (typeof node === 'string') {
    out[path] = node
    return out
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) => flattenMessages(item, `${path}.${index}`, out))
    return out
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      flattenMessages(value, path ? `${path}.${key}` : key, out)
    }
  }
  return out
}

function collectSourceFiles(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name === 'locales') {
      continue
    }
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(path))
    } else if (['.ts', '.vue'].includes(extname(entry.name))) {
      files.push(path)
    }
  }
  return files
}

function collectStaticTranslationKeys(): string[] {
  const sourceRoot = resolve(process.cwd(), 'src')
  const keys = new Set<string>()
  const translationCall = /\b(?:i18n\.)?t\(\s*['"]([^'"]+)['"]/g

  for (const file of collectSourceFiles(sourceRoot)) {
    const source = readFileSync(file, 'utf8')
    let match: RegExpExecArray | null
    while ((match = translationCall.exec(source))) {
      if (!match[1].endsWith('.')) {
        keys.add(match[1])
      }
    }
  }
  return [...keys].sort()
}

const locales = {
  en: flattenMessages(en),
  zh: flattenMessages(zh)
}

describe('locale message completeness', () => {
  // 验证：源码引用的静态 key 在所有语言包中均存在，避免菜单显示原始 key 或空白。
  it('defines every statically referenced translation key in every locale', () => {
    const usedKeys = collectStaticTranslationKeys()
    const missing = Object.fromEntries(
      Object.entries(locales).map(([locale, messages]) => [
        locale,
        usedKeys.filter((key) => !(key in messages))
      ])
    )

    expect(missing).toEqual({ en: [], zh: [] })
  })

  // 验证：语言包不包含空字符串，避免已定义 key 渲染为空白标签。
  it.each(Object.entries(locales))('%s contains no empty translation values', (_locale, messages) => {
    const emptyKeys = Object.entries(messages)
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key)

    expect(emptyKeys).toEqual([])
  })
})
