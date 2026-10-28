import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { locales, prefix, pageURL, escapeHTML } from './i18n.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = file => JSON.parse(readFileSync(join(root, file), 'utf8'));

test('all five languages produce complete linked pages, localized controls and real screenshot assets', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root });
  const dist = join(root, 'dist');
  const source = json('i18n/source.json');
  const supportKo = json('support-content.json');
  const legal = json('legal-content.json');
  const screenshotMap = json('i18n/screenshots.json');
  const pages = ['index', 'support', 'security', 'privacy', 'terms', '404'];
  for (const locale of Object.keys(locales)) {
    const dictionary = locale === 'ko' ? source : json(`i18n/${locale}.json`);
    assert.deepEqual(Object.keys(dictionary).sort(), Object.keys(source).sort());
    for (const [key, value] of Object.entries(dictionary)) {
      assert.ok(value.trim(), `${locale}: ${key}`);
      assert.deepEqual(value.match(/\{[a-z]+\}/g) ?? [], key.match(/\{[a-z]+\}/g) ?? [], `${locale}: lost interpolation`);
    }
    const support = locale === 'ko' ? supportKo : json(`i18n/support-${locale}.json`);
    assert.deepEqual(support.categories.map(c => [c.id, c.items.map(item => [item.id, item.featured, item.answer.length])]), supportKo.categories.map(c => [c.id, c.items.map(item => [item.id, item.featured, item.answer.length])]));
    const docs = legal[locale] ?? json(`i18n/legal-${locale}.json`);
    for (const page of pages) {
      const file = join(dist, prefix(locale), `${page}.html`);
      const html = readFileSync(file, 'utf8');
      assert.ok(html.includes(`<html lang="${locale}"`));
      assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}|SUPPORT_CONTENT|HOME_FAQ|LEGAL_CONTENT/);
      assert.ok(html.includes('class="language-menu"'));
      for (const target of Object.keys(locales)) assert.ok(html.includes(`href="${pageURL(target, page === 'index' ? '' : page)}" hreflang="${target}"`));
      assert.ok(html.includes(`data-autoplay-play="${escapeHTML(dictionary['자동 넘김 재생'])}"`));
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
      assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${locale}/${page}`);
      for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor), `${file}: #${anchor}`);
      for (const [, resource] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
        if (/^[a-z]+:|^\/\//i.test(resource)) continue;
        const path = resource.split(/[?#]/)[0];
        if (!path) continue;
        const local = path.startsWith('/') ? resolve(dist, path.slice(1)) : resolve(dirname(file), path);
        assert.ok(local === dist || local.startsWith(dist + '/'));
        assert.ok(existsSync(local) || existsSync(local + '.html'), `Missing ${file}: ${resource}`);
        const version = resource.match(/\?v=([a-f0-9]+)/)?.[1];
        if (/\.(css|js)$/.test(path)) assert.equal(version, createHash('sha256').update(readFileSync(local)).digest('hex').slice(0, 12));
      }
      if (page !== '404') {
        const canonical = `https://donup.app${pageURL(locale, page === 'index' ? '' : page)}`;
        assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
        assert.ok(html.includes(`property="og:url" content="${canonical}"`));
        assert.ok(html.includes(`property="og:locale" content="${locales[locale].og}"`));
        assert.equal((html.match(/property="og:image"/g) ?? []).length, 1);
        for (const target of Object.keys(locales)) assert.ok(html.includes(`hreflang="${target}" href="https://donup.app${pageURL(target, page === 'index' ? '' : page)}"`));
      }
      if (page === 'index') {
        assert.equal((html.match(/class="pill pill-coming" type="button" disabled/g) ?? []).length, 2);
        assert.ok(html.includes(`href="${pageURL(locale, 'support')}#contact"`));
        if (locale !== 'ko') {
          assert.doesNotMatch(html.replace(/<a href="\/" hreflang="ko"[^>]*>한국어<\/a>/g, ''), /[가-힣]/, `${locale}: untranslated home text`);
          for (const key of ['home-pink-light', 'history-mint-light', 'budget-mint-light', 'statistics-skyblue-light', 'donworry-pink-light', 'automation-pink-dark', 'home-pink-dark', 'home-skyblue-light']) {
            assert.ok(screenshotMap[locale][key].startsWith(`/assets/screens/iphone16promax/${locale}/`));
            assert.ok(html.includes(screenshotMap[locale][key]));
          }
        }
      }
      if (page === 'support') {
        assert.ok(html.includes('value="support@donup.app" readonly'));
        assert.ok(html.includes('to=support%40donup.app'));
        const items = support.categories.flatMap(category => category.items);
        assert.equal((html.match(/class="support-faq"/g) ?? []).length, items.length);
        for (const item of items) {
          assert.ok(html.includes(`<summary>${escapeHTML(item.question)}</summary>`));
          for (const paragraph of item.answer) assert.ok(html.includes(`<p>${escapeHTML(paragraph)}</p>`));
        }
      }
      if (['privacy', 'terms'].includes(page)) {
        const doc = docs[page], original = legal[locale === 'ko' ? 'ko' : 'en'][page];
        assert.deepEqual(doc.sections.map(s => s.body.length), original.sections.map(s => s.body.length));
        assert.equal((html.match(/class="legal-section"/g) ?? []).length, page === 'privacy' ? 14 : 10);
        assert.ok(html.includes('support@donup.app'));
        for (const section of doc.sections) for (const paragraph of section.body) assert.ok(html.includes(`<p>${escapeHTML(paragraph)}</p>`));
      }
    }
    const png = readFileSync(join(dist, `assets/donup-share-${locale === 'ko' ? 'v1' : locale}.png`));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
    assert.ok(png.length < 5 * 1024 * 1024);
  }
  const inspect = directory => {
    for (const name of readdirSync(directory)) {
      assert.ok(!name.startsWith('.'), `Private file: ${name}`);
      const file = join(directory, name);
      if (statSync(file).isDirectory()) inspect(file);
      else assert.ok(statSync(file).size < 25 * 1024 * 1024);
    }
  };
  inspect(dist);
  for (const path of ['i18n', 'scripts', 'CAPTURE_NOTES.md', 'package.json', 'social-card.html']) assert.ok(!existsSync(join(dist, path)));
  assert.equal((readFileSync(join(dist, 'sitemap.xml'), 'utf8').match(/<loc>/g) ?? []).length, 25);
});
