import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { locales, translator, escapeHTML } from './i18n.mjs';
const root = new URL('../', import.meta.url);
const template = await readFile(new URL('social-card.html', root), 'utf8');
const screenshots = JSON.parse(await readFile(new URL('i18n/screenshots.json', root), 'utf8'));
await mkdir(new URL('.local-preview/', root), { recursive: true });
for (const locale of Object.keys(locales).filter(code => code !== 'ko')) {
  if (!screenshots[locale]?.['home-pink-light'] || !screenshots[locale]?.['statistics-skyblue-light']) continue;
  const t = translator(JSON.parse(await readFile(new URL(`i18n/${locale}.json`, root), 'utf8')));
  let html = template.replace('<html lang="ko">', `<html lang="${locale}">`)
    .replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${escapeHTML(t('말하면 기록되고,'))}<br />${escapeHTML(t('쓴 돈이 바로 보이는 가계부'))}</h1>`)
    .replace(/<p class="sub">[\s\S]*?<\/p>/, `<p class="sub">${escapeHTML(t('DonUp에서 시작하세요'))}</p>`)
    .replace('font-size: 62px;', `font-size: ${locale === 'en' ? 50 : locale === 'ja' ? 54 : 60}px;`)
    .replace('word-break: keep-all;', 'word-break: normal;')
    .replaceAll('src="./assets/', 'src="/assets/')
    .replace(/\/assets\/screens\/iphone16promax\/([\w-]+)\.webp/g, (_, key) => {
      if (!screenshots[locale][key]) throw new Error(`Missing social screenshot: ${locale}/${key}`);
      return screenshots[locale][key];
    });
  await writeFile(new URL(`.local-preview/social-${locale}.html`, root), html);
}
console.log('Local preview cards prepared; capture each at 1200×630 into assets/donup-share-<locale>.png.');
