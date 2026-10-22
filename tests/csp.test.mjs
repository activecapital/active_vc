import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildContentSecurityPolicy } from '../lib/csp.ts'

const directives = (policy) => new Map(policy.split('; ').map((value) => {
  const [name, ...sources] = value.split(' ')
  return [name, sources]
}))

test('both script directives allow only the supplied nonce for inline scripts', () => {
  const policy = directives(buildContentSecurityPolicy('request-one', undefined, false))
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

test('browser authentication can connect to the configured Supabase origin', () => {
  const policy = directives(buildContentSecurityPolicy('test', 'https://staging-project.supabase.co/auth/v1', false))
  assert.ok(policy.get('connect-src').includes('https://staging-project.supabase.co'))
  assert.ok(!policy.get('connect-src').includes('*'))
})

test('eval is available only for local development', () => {
  const policy = directives(buildContentSecurityPolicy('test', undefined, true))
  assert.ok(policy.get('script-src').includes("'unsafe-eval'"))
})
