/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCanonicalSiteUrl, canonicalizePagePath, decodeRouteParam, encodeCanonicalPagePath } from '../app/utils/pathUtils.ts'

test('canonicalizePagePath appends a trailing slash to content paths', () => {
  assert.equal(canonicalizePagePath('/zh/projects/nuxt-content-mermaid'), '/zh/projects/nuxt-content-mermaid/')
})

test('canonicalizePagePath preserves the root path', () => {
  assert.equal(canonicalizePagePath('/'), '/')
})

test('buildCanonicalSiteUrl encodes gallery album segments and returns a slashful URL', () => {
  assert.equal(
    buildCanonicalSiteUrl('https://barz.app/', '/gallery/Blossoms & Kids'),
    'https://barz.app/gallery/Blossoms%20%26%20Kids/',
  )
})

test('encodeCanonicalPagePath returns a slashful and encoded internal path', () => {
  assert.equal(
    encodeCanonicalPagePath('/gallery/Blossoms & Kids'),
    '/gallery/Blossoms%20%26%20Kids/',
  )
})

test('decodeRouteParam decodes encoded gallery route params', () => {
  assert.equal(decodeRouteParam('Blossoms%20%26%20Kids'), 'Blossoms & Kids')
})
