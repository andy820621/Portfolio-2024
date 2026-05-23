import { describe, expect, it } from 'vitest'
import { getPnpmVersion, syncPnpmDocText } from '../scripts/sync-pnpm-version.js'

describe('getPnpmVersion', () => {
  it('extracts the pnpm version from packageManager', () => {
    expect(getPnpmVersion('pnpm@11.2.2+sha512.36e6621fad506178936455e70247b8808ef4ec25797a9f437a93281a020484e2607f6a469a22e982987c3dbb8866e3071514ab10a4a1749e06edcd1ec118436f')).toBe('11.2.2')
  })

  it('rejects unsupported packageManager values', () => {
    expect(() => getPnpmVersion('npm@10.0.0')).toThrowError('Unsupported packageManager value: npm@10.0.0')
  })
})

describe('syncPnpmDocText', () => {
  it('updates the displayed pnpm version in docs', () => {
    const source = [
      '{',
      '  "packageManager": "pnpm@11.1.3+sha512..."',
      '}',
    ].join('\n')

    expect(syncPnpmDocText(source, '11.2.2')).toBe([
      '{',
      '  "packageManager": "pnpm@11.2.2+sha512..."',
      '}',
    ].join('\n'))
  })

  it('leaves unrelated content untouched', () => {
    expect(syncPnpmDocText('no pnpm version here', '11.2.2')).toBe('no pnpm version here')
  })
})
