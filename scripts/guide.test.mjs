import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGuide } from './guide.mjs';

test('editorial copy is escaped and section anchors cannot be duplicated or injected', () => {
  const guide = { title: '<title>', answer: '<answer>', imageAlt: '"caption', sections: [{ id: 'first', title: '<heading>', paragraphs: ['<script>alert(1)</script>'] }], faq: [{ question: '<q>', answer: '<a>' }] };
  const html = renderGuide(guide, 'ko', value => value, '2026-10-30');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&quot;caption'));
  assert.doesNotMatch(html, /<script>|alt=""caption/);
  assert.throws(() => renderGuide({ ...guide, sections: [guide.sections[0], guide.sections[0]] }, 'ko', value => value, '2026-10-30'));
  assert.throws(() => renderGuide({ ...guide, sections: [{ ...guide.sections[0], id: '"><img>' }] }, 'ko', value => value, '2026-10-30'));
});
