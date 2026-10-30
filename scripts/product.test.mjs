import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { featureMenu, sectionRail, productStory, featurePage } from './product.mjs';

const copies = JSON.parse(readFileSync(new URL('../content/product-story.json', import.meta.url))).locales;
test('localized product stories keep valid targets and escape editorial copy', () => {
  for (const [locale, copy] of Object.entries(copies)) {
    assert.equal((sectionRail(copy).match(/<li>/g) ?? []).length, 9);
    const story = productStory(copy, locale);
    assert.equal((story.match(/data-story-step=/g) ?? []).length, 3);
    assert.equal((story.match(/class="flow-entry"/g) ?? []).length, 3);
    assert.ok(story.includes('aria-hidden="true"'));
    for (const key of ['recording', 'insights']) {
      assert.ok(featureMenu(copy, locale, `features/${key}`).includes('aria-current="page"'));
      assert.ok(featurePage(copy, locale, key).includes('id6770472441'));
    }
  }
  const copy = structuredClone(copies.ko);
  copy.headline[0] = '</h2><script>alert(1)</script>';
  assert.ok(productStory(copy, 'ko').includes('&lt;script&gt;'));
  assert.throws(() => featurePage(copy, 'ko', '../private'));
  assert.throws(() => productStory({ ...copy, steps: copy.steps.slice(1) }, 'ko'));
  assert.throws(() => sectionRail({ ...copy, rail: [] }));
});
