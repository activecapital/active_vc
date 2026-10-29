import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildContentSecurityPolicy } from '../lib/csp.ts'

const directives = (policy) => new Map(policy.split('; ').map((value) => {
  const [name, ...sources] = value.split(' ')
  return [name, sources]
}))

test('both script directives allow only the supplied nonce for inline scripts', () => {
  const policy = directives(buildContentSecurityPolicy('request-one', false))
  for (const name of ['script-src', 'script-src-elem']) {
    assert.ok(policy.get(name).includes("'nonce-request-one'"))
    assert.ok(!policy.get(name).includes("'unsafe-inline'"))
    assert.ok(!policy.get(name).includes("'unsafe-eval'"))
  }
  assert.notEqual(
    buildContentSecurityPolicy('request-one'),
    buildContentSecurityPolicy('request-two'),
  )
  assert.deepEqual(policy.get('object-src'), ["'none'"])
  assert.deepEqual(policy.get('frame-ancestors'), ["'none'"])
})

test('eval is available only for local development', () => {
  const policy = directives(buildContentSecurityPolicy('test', true))
  assert.ok(policy.get('script-src').includes("'unsafe-eval'"))
})
