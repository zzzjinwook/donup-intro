import test from 'node:test';
import assert from 'node:assert/strict';
import { changedURLs, sitemapURLs, pageRevision } from './indexnow.mjs';

test('IndexNow submits added, edited and removed URLs once and skips unchanged builds', () => {
  assert.deepEqual(changedURLs({ a: '1', b: '3', c: '4' }, { a: '1', b: '2', d: '5' }), ['b', 'c', 'd']);
  assert.deepEqual(changedURLs({ a: '1' }, { a: '1' }), []);
});
test('deployment verification tolerates hosting email transforms, but requires exactly one matching revision', () => {
  const revision = 'a'.repeat(64);
  const meta = `<meta name="donup-page-revision" content="${revision}" />`;
  assert.equal(pageRevision(meta + '<p>support@donup.app</p>'), pageRevision(meta + '<p>[email protected]</p>'));
  assert.throws(() => pageRevision('<p>old build</p>'));
  assert.throws(() => pageRevision(meta + meta));
});
test('only distinct canonical DonUp URLs may be submitted', () => {
  assert.deepEqual(sitemapURLs('<url><loc>https://donup.app/ja/support</loc></url>'), ['https://donup.app/ja/support']);
  for (const url of ['https://other.test/', 'http://donup.app/', 'https://donup.app/?x=1', 'https://donup.app/#pricing']) {
    assert.throws(() => sitemapURLs(`<loc>${url}</loc>`));
  }
  assert.throws(() => sitemapURLs(''));
  assert.throws(() => sitemapURLs('<loc>https://donup.app/</loc><loc>https://donup.app/</loc>'));
});
