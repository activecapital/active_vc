import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import { SITE_CONTENT } from '../lib/content.ts'

test('every exported production content field is preserved exactly', () => {
  const snapshot = JSON.parse(readFileSync(new URL('../content/production-snapshot.json', import.meta.url), 'utf8'))
  assert.equal(snapshot.rows.length, 6)
  assert.deepEqual(SITE_CONTENT, Object.fromEntries(snapshot.rows.map(({ key, value }) => [key, value])))
})

test('all production approach icons are available locally', () => {
  for (const item of SITE_CONTENT.approach_items) {
    assert.ok(existsSync(new URL(`../public${item.icon}`, import.meta.url)), item.icon)
  }
})
