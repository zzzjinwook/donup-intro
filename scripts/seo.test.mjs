import test from 'node:test';
import assert from 'node:assert/strict';
import { structuredData, jsonLDScript, sitemap, llmsText, helpFeed } from './seo.mjs';
import { locales, pageURL } from './i18n.mjs';

const questions = [{ id: 'example', question: 'Question &amp; answer?', answer: ['One paragraph.', 'Another > paragraph.'] }];
const options = { title: 'DonUp &amp; Help', description: 'Visible description', logo: 'https://donup.app/logo.png', image: 'https://donup.app/share.png', questions };
test('localized entity data links canonical pages and exactly mirrors the visible answers', () => {
  for (const locale of Object.keys(locales)) {
    for (const page of ['index', 'support', 'privacy']) {
      const data = structuredData({ ...options, locale, page });
      const publisher = data['@graph'].find(node => node['@type'] === 'Organization');
      assert.equal(publisher.contactPoint.email, 'support@donup.app');
      assert.equal(publisher.contactPoint.url, 'https://donup.app/support#contact');
      const webpage = data['@graph'].find(node => node['@id'].endsWith('#webpage'));
      const url = 'https://donup.app' + pageURL(locale, page === 'index' ? '' : page);
      assert.equal(webpage.url, url); assert.equal(webpage.inLanguage, locale);
      assert.equal(webpage.name, 'DonUp & Help');
      const faq = data['@graph'].find(node => [].concat(node['@type']).includes('FAQPage'));
      if (page !== 'privacy') {
        assert.equal(faq.mainEntity.length, questions.length);
        assert.equal(faq.mainEntity[0].acceptedAnswer.text, questions[0].answer.join('\n\n'));
        assert.equal(faq.mainEntity[0]['@id'], url + '#faq-example');
      } else assert.equal(faq, undefined);
      assert.doesNotMatch(JSON.stringify(data), /aggregateRating|reviewCount|ratingValue/);
      const app = data['@graph'].find(node => node['@type'] === 'MobileApplication');
      if (page === 'index') {
        assert.match(app.installUrl, /id6770472441/); assert.equal(app.offers.price, '0');
        assert.equal(app.operatingSystem, 'iOS 26.0 or later');
        assert.deepEqual(app.sameAs, [app.installUrl]);
      } else assert.equal(app, undefined);
    }
  }
});
test('breadcrumb names use the visible page label instead of a search title', () => {
  const data = structuredData({ ...options, locale: 'en', page: 'support', pageName: 'Help &amp; FAQ' });
  const breadcrumb = data['@graph'].find(node => node['@type'] === 'BreadcrumbList');
  assert.equal(breadcrumb.itemListElement[1].name, 'Help & FAQ');
  assert.equal(breadcrumb.itemListElement[1].item, 'https://donup.app/en/support');
});
test('structured JSON cannot terminate its script element or inject markup', () => {
  const value = { text: '</script><img src=x onerror=alert(1)>\u2028\u2029' };
  const script = jsonLDScript(value);
  assert.equal((script.match(/<\/script>/g) || []).length, 1);
  assert.ok(!script.includes('<img'));
  assert.deepEqual(JSON.parse(script.replace(/^<script[^>]*>|<\/script>$/g, '')), value);
});
test('sitemap exposes reciprocal language URLs while excluding error pages', () => {
  const xml = sitemap(['index', 'support', 'security', 'privacy', 'terms']);
  assert.equal((xml.match(/<loc>/g) || []).length, 25);
  assert.equal((xml.match(/<xhtml:link/g) || []).length, 150);
  assert.doesNotMatch(xml, /404|lastmod/);
  assert.ok(xml.includes('hreflang="ja" href="https://donup.app/ja/privacy"'));
  assert.ok(xml.includes('hreflang="x-default" href="https://donup.app/privacy"'));
  assert.ok(llmsText().includes('https://donup.app/zh-Hant/support'));
});

test('editorial dates stay explicit and invalid feed dates cannot be published', () => {
  assert.match(sitemap(['support'], { support: '2026-10-29' }), /<lastmod>2026-10-29<\/lastmod>/);
  assert.throws(() => sitemap(['support'], { support: '2026-02-30' }));
  assert.throws(() => helpFeed('ko', 'Help', [{ ...questions[0], updated: 'not a date' }]));
  const feed = helpFeed('en', 'Help & updates', [{ ...questions[0], updated: '2026-10-29' }]);
  assert.match(feed, /Help &amp; updates/);
  assert.match(feed, /<guid isPermaLink="true">https:\/\/donup.app\/en\/support#faq-example<\/guid>/);
});
