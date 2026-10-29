import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { locales, prefix, pageURL, escapeHTML } from './i18n.mjs';
import { answerText } from './seo.mjs';
import { guideRoute, guideQuestions } from './guide.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = file => JSON.parse(readFileSync(join(root, file), 'utf8'));

test('all five languages produce complete linked pages, localized controls and real screenshot assets', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root });
  const dist = join(root, 'dist');
  const source = json('i18n/source.json');
  const supportKo = json('support-content.json');
  const legal = json('legal-content.json');
  const screenshotMap = json('i18n/screenshots.json');
  const pages = ['index', 'support', 'security', 'privacy', 'terms', '404', guideRoute];
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
      assert.equal((html.match(/<main\b/g) ?? []).length, 1);
      assert.ok(html.includes('<style data-source="fonts.css">'));
      const fontCSS = html.match(/<style data-source="fonts.css">([\s\S]*?)<\/style>/)[1];
      assert.equal((fontCSS.match(/@font-face/g) ?? []).length, 92);
      assert.doesNotMatch(fontCSS, /url\("(?:\.\/)?woff2\//);
      for (const [, font] of fontCSS.matchAll(/url\("([^"]+)"\)/g)) {
        assert.ok(font.startsWith('/assets/fonts/wanted-sans-1.0.3/'));
        assert.equal(readFileSync(join(dist, font)).subarray(0, 4).toString(), 'wOF2');
      }
      assert.ok(fontCSS.includes('Copyright (c) 2024 Wanted Lab, Inc.'));
      assert.doesNotMatch(html, /rel="stylesheet"[^>]+WantedSansVariable/);
      assert.ok(html.includes('<style data-source="language.css">'));
      assert.doesNotMatch(html, /<link rel="stylesheet" href="\/[\w-]+\.css/);
      assert.doesNotMatch(html, /<style[^>]*>undefined<\/style>/);
      for (const [, src] of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
        assert.match(src, /\.webp\?v=[a-f0-9]{12}$/, `${locale}/${page}: visible images use versioned WebP`);
      }
      const markup = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
      const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
      assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${locale}/${page}`);
      for (const [, anchor] of markup.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor), `${file}: #${anchor}`);
      for (const [, resource] of markup.matchAll(/(?:src|href)="([^"#]+)"/g)) {
        if (/^[a-z]+:|^\/\//i.test(resource)) continue;
        const path = resource.split(/[?#]/)[0];
        if (!path) continue;
        const local = path.startsWith('/') ? resolve(dist, path.slice(1)) : resolve(dirname(file), path);
        assert.ok(local === dist || local.startsWith(dist + '/'));
        assert.ok(existsSync(local) || existsSync(local + '.html'), `Missing ${file}: ${resource}`);
        const version = resource.match(/\?v=([a-f0-9]+)/)?.[1];
        if (/\.(css|js)$/.test(path) || path.startsWith('/assets/screens/iphone16promax/')) assert.equal(version, createHash('sha256').update(readFileSync(local)).digest('hex').slice(0, 12));
      }
      if (page !== '404') {
        const canonical = `https://donup.app${pageURL(locale, page === 'index' ? '' : page)}`;
        assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
        assert.ok(html.includes(`property="og:url" content="${canonical}"`));
        assert.ok(html.includes(`property="og:locale" content="${locales[locale].og}"`));
        assert.equal((html.match(/property="og:image"/g) ?? []).length, 1);
        const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
        const webpage = schema['@graph'].find(node => node['@id'] === canonical + '#webpage');
        assert.equal(webpage.url, canonical); assert.equal(webpage.inLanguage, locale);
        const breadcrumb = schema['@graph'].find(node => node['@type'] === 'BreadcrumbList');
        if (page !== 'index') {
          assert.ok(html.includes(`<nav class="page-path" aria-label="${escapeHTML(dictionary['현재 위치'])}">`));
          assert.ok(html.includes(`<li aria-current="page">${escapeHTML(breadcrumb.itemListElement[1].name)}</li>`));
          assert.equal(breadcrumb.itemListElement[1].item, canonical);
        } else assert.equal(breadcrumb, undefined);
        const structuredFAQ = schema['@graph'].find(node => [].concat(node['@type']).includes('FAQPage'));
        if (page === 'index' || page === 'support') {
          const questions = support.categories.flatMap(c => c.items).filter(item => page === 'support' || item.featured);
          assert.equal(structuredFAQ.mainEntity.length, questions.length);
          for (const question of questions) assert.ok(structuredFAQ.mainEntity.some(item => item['@id'] === canonical + '#faq-' + question.id));
        } else if (page === guideRoute) {
          const guide = json('content/entry-guide.json');
          const copy = guide.locales[locale];
          const article = schema['@graph'].find(node => node['@type'] === 'Article');
          assert.equal(article.headline, copy.title);
          assert.equal(article.datePublished, guide.published);
          assert.equal(article.dateModified, guide.updated);
          assert.ok(html.includes(`<h1>${escapeHTML(copy.title)}</h1>`));
          assert.ok(html.includes(`<p class="guide-answer">${escapeHTML(copy.answer)}</p>`));
          for (const section of copy.sections) for (const paragraph of section.paragraphs) assert.ok(html.includes(`<p>${escapeHTML(paragraph)}</p>`));
          assert.deepEqual(structuredFAQ.mainEntity.map(item => item.name), guideQuestions(copy).map(item => item.question));
          for (const item of structuredFAQ.mainEntity) assert.ok(html.includes(`<p>${escapeHTML(item.acceptedAnswer.text)}</p>`));
        } else assert.equal(structuredFAQ, undefined);
        assert.doesNotMatch(html, /font-preview|fonts\.css[^<]*@import/);
        assert.ok(html.includes('name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"'));
        for (const target of Object.keys(locales)) assert.ok(html.includes(`hreflang="${target}" href="https://donup.app${pageURL(target, page === 'index' ? '' : page)}"`));
      } else assert.ok(html.includes('name="robots" content="noindex,follow"'));
      if (page === 'index') {
        assert.ok(html.includes(`href="${pageURL(locale, guideRoute)}"`));
        for (const item of support.categories.flatMap(c => c.items).filter(item => item.featured)) {
          assert.ok(html.includes(`href="${pageURL(locale, 'support')}#faq-${item.id}"`));
        }
        assert.equal((html.match(/class="pill pill-coming" type="button" disabled/g) ?? []).length, 2);
        assert.ok(html.includes(`href="${pageURL(locale, 'support')}#contact"`));
        if (locale !== 'ko') {
          assert.doesNotMatch(html.replace(/<a href="\/" hreflang="ko"[^>]*>한국어<\/a>/g, '').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ''), /[가-힣]/, `${locale}: untranslated home text`);
          for (const key of ['home-pink-light', 'history-mint-light', 'budget-mint-light', 'statistics-skyblue-light', 'donworry-chart-pink-light', 'automation-pink-dark', 'home-pink-dark', 'home-skyblue-light']) {
            assert.ok(screenshotMap[locale][key].startsWith(`/assets/screens/iphone16promax/${locale}/`));
            assert.ok(html.includes(screenshotMap[locale][key]));
          }
        }
      }
      if (page === 'support') {
        assert.ok(html.includes(`href="${pageURL(locale, guideRoute)}"`));
        assert.ok(html.includes(`href="${pageURL(locale)}#pricing">${escapeHTML(dictionary['무료와 Pro 비교'])}</a>`));
        assert.ok(html.includes(`href="${pageURL(locale, 'security')}#control">${escapeHTML(dictionary['개인정보 보호 자세히 보기'])}</a>`));
        assert.ok(html.includes('value="support@donup.app" readonly'));
        assert.ok(html.includes('to=support%40donup.app'));
        const items = support.categories.flatMap(category => category.items);
        assert.equal((html.match(/class="support-faq"/g) ?? []).length, items.length);
        for (const item of items) {
          assert.ok(html.includes(`<summary>${escapeHTML(item.question)}</summary>`));
          for (const paragraph of item.answer) assert.ok(html.includes(`<p>${escapeHTML(paragraph)}</p>`));
          for (const fact of item.facts ?? []) assert.ok(html.includes(`<dt>${escapeHTML(fact.label)}</dt><dd>${escapeHTML(fact.value)}</dd>`));
          for (const step of item.steps ?? []) assert.ok(html.includes(`<li>${escapeHTML(step)}</li>`));
          const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
          const question = schema['@graph'].find(node => [].concat(node['@type']).includes('FAQPage')).mainEntity.find(question => question['@id'].endsWith('#faq-' + item.id));
          assert.equal(question.acceptedAnswer.text, answerText(item));
        }
        const feed = readFileSync(join(dist, prefix(locale), 'feed.xml'), 'utf8');
        assert.equal((feed.match(/<item>/g) ?? []).length, 3);
        assert.ok(feed.includes(`<language>${locale}</language>`));
        assert.ok(feed.includes(`<guid isPermaLink="true">https://donup.app${pageURL(locale, guideRoute)}</guid>`));
        for (const item of items.filter(item => item.updated)) {
          assert.ok(feed.includes(`<description>${escapeHTML(answerText(item))}</description>`));
          assert.ok(feed.includes(`https://donup.app${pageURL(locale, 'support')}#faq-${item.id}`));
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
  for (const path of ['i18n', 'scripts', '.agents', 'SEO_AUDIT.md', 'CAPTURE_NOTES.md', 'package.json', 'social-card.html']) assert.ok(!existsSync(join(dist, path)));
  assert.equal((readFileSync(join(dist, 'sitemap.xml'), 'utf8').match(/<loc>/g) ?? []).length, 30);
  assert.equal((readFileSync(join(dist, 'sitemap.xml'), 'utf8').match(/<lastmod>/g) ?? []).length, 20);
  const publishing = json('content/search-publishing.json');
  assert.equal(readFileSync(join(dist, publishing.indexNowKey + '.txt'), 'utf8'), publishing.indexNowKey);
  const home = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.ok(home.includes(`name="naver-site-verification" content="${publishing.naverVerification}"`));
  assert.ok(home.includes(`name="msvalidate.01" content="${publishing.bingVerification}"`));
});
