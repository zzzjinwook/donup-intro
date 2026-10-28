import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { translator, translateHTML, pageURL, languageMenu } from './i18n.mjs';

test('rendered copy escapes HTML and translates normalized attributes and text', () => {
  const t = translator({ '도움말': 'Help & support', '안내 문구': '<safe>' });
  assert.equal(translateHTML('<p aria-label="도움말">\n 안내   문구 </p>', t), '<p aria-label="Help &amp; support">&lt;safe&gt;</p>');
  assert.throws(() => t('번역 누락'), /Missing translation/);
  assert.equal(translateHTML('<p>설정 &gt; 기록</p>', translator({ '설정 &gt; 기록': 'Settings &gt; Entries' })), '<p>Settings &gt; Entries</p>');
  assert.equal(pageURL('ko', 'support'), '/support');
  assert.equal(pageURL('zh-Hant', 'support'), '/zh-Hant/support');
  const menu = languageMenu('ja', 'privacy', 'Language');
  assert.ok(menu.includes('href="/ja/privacy" hreflang="ja" lang="ja" aria-current="page"'));
});

const script = readFileSync(new URL('../language.js', import.meta.url), 'utf8');
function preferred(languages, saved, pathname = '/') {
  let destination;
  runInNewContext(script, {
    document: { querySelectorAll: () => [], addEventListener() {} },
    localStorage: { getItem: () => saved },
    navigator: { languages },
    location: { pathname, search: '?from=share', hash: '#download', replace: value => { destination = value; } },
  });
  return destination;
}
test('home language follows stored preference and supported browser locales', () => {
  assert.equal(preferred(['en-US'], 'ko'), undefined);
  assert.equal(preferred(['en-US']), '/en/?from=share#download');
  assert.equal(preferred(['zh-HK']), '/zh-Hant/?from=share#download');
  assert.equal(preferred(['zh-CN']), '/zh-Hans/?from=share#download');
  assert.equal(preferred(['fr', 'ja-JP']), '/ja/?from=share#download');
  assert.equal(preferred(['ko-KR']), undefined);
  assert.equal(preferred(['ja-JP'], null, '/en/privacy'), undefined);
});
