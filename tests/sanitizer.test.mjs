import assert from 'node:assert/strict'
import { test } from 'node:test'
import DOMPurify from 'isomorphic-dompurify'

test('the server sanitizer loads and preserves marketing markup', () => {
  const html = '<p>Hello <strong>founders</strong>. <a href="mailto:team@active.vc">Contact us</a>.</p>'
  assert.equal(DOMPurify.sanitize(html), html)
})

test('the server sanitizer removes executable content and unsafe links', () => {
  const html = '<p onclick="alert(1)">Hello<script>alert(1)</script></p><a href="javascript:alert(1)">Contact</a><img src="/img/logo-white.svg" onerror="alert(1)">'
  assert.equal(
    DOMPurify.sanitize(html),
    '<p>Hello</p><a>Contact</a><img src="/img/logo-white.svg">',
  )
})
