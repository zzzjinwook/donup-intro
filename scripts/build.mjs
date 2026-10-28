import { cp, mkdir, rm, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { locales, prefix, pageURL, escapeHTML as escape, translator, translateHTML, languageMenu } from './i18n.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const read = file => readFile(join(root, file), 'utf8');
const json = async file => JSON.parse(await read(file));
const publicFiles = ['styles.css', 'script.js', 'legal.css', 'support.css', 'support.js', 'language.css', 'language.js', '_headers', 'assets/donup-app-icon.png', 'assets/donup-share-v1.png'];
const imageTypes = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.gif', '.ico']);
async function collectImages(directory) {
  const files = [];
  for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectImages(path));
    else if (entry.isFile() && imageTypes.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}
const files = [...publicFiles, ...await collectImages('assets/screens'),
  ...(await collectImages('assets/illustrations')).filter(path => path.endsWith('.webp')),
  ...((await readdir(join(root, 'assets'))).filter(name => /^donup-share-(en|ja|zh-Hans|zh-Hant)\.png$/.test(name)).map(name => 'assets/' + name))];
for (const file of files) if ((await stat(join(root, file))).size > 25 * 1024 * 1024) throw new Error(`Cloudflare Pages file too large: ${file}`);
await rm(output, { recursive: true, force: true });
for (const file of files) { await mkdir(dirname(join(output, file)), { recursive: true }); await cp(join(root, file), join(output, file)); }
const versions = Object.fromEntries(await Promise.all(publicFiles.filter(file => /\.(css|js)$/.test(file)).map(async file => [file, createHash('sha256').update(await read(file)).digest('hex').slice(0, 12)])));
const source = await json('i18n/source.json');
const legal = await json('legal-content.json');
const koreanSupport = await json('support-content.json');
const screenshotMap = await json('i18n/screenshots.json');
const pages = ['index', 'support', 'security', 'privacy', 'terms', '404'];
const templates = Object.fromEntries(await Promise.all(pages.map(async page => [page, await read(page + '.html')])));
const generated = [];
const runtimeKeys = {
  'autoplay-play': '자동 넘김 재생', 'autoplay-pause': '자동 넘김 멈추기',
  'question-count': '질문 {count}개', 'search-matches': '{count}개의 답을 찾았어요',
  'copy-success': '메일 주소를 복사했어요. 받는 사람에 붙여 넣어 주세요.',
  'copy-error': '브라우저가 복사를 허용하지 않았어요. 선택된 주소를 직접 복사해 주세요.',
};
const legalNotes = {
  ja: 'このページはアプリの英語版文書の翻訳です。',
  'zh-Hans': '本页为应用内英文文档的译文。',
  'zh-Hant': '本頁為 App 內英文文件的譯文。',
};
const faq = (item, className) => `<details class="${className}" id="faq-${item.id}"><summary>${escape(item.question)}</summary><div class="faq-answer">${item.answer.map(paragraph => `<p>${escape(paragraph)}</p>`).join('\n')}</div></details>`;
function localizeLinks(html, locale) {
  return html.replace(/\b(href|src)="((?:\.\/|\.\.\/|\/)[^"\s]*)"/g, (match, attribute, value) => {
    const url = value.replace(/^(?:\.\.\/|\.\/)/, '/');
    if (attribute === 'src') return `${attribute}="${url}"`;
    if (/\.(css|js|png|webp|jpg|svg|ico)(?:\?|$)/.test(url)) return `href="${url}"`;
    if (/^\/(?:en\/)?(?:privacy|terms|support|security)?(?:[#?].*)?$/.test(url)) {
      return `href="${prefix(locale)}${url.replace(/^\/(?:en\/)?/, '')}"`;
    }
    return match;
  });
}
for (const locale of Object.keys(locales)) {
  const dictionary = locale === 'ko' ? source : await json(`i18n/${locale}.json`);
  for (const key of Object.keys(source)) if (!dictionary[key]) throw new Error(`Missing ${locale}: ${key}`);
  const t = translator(dictionary);
  const support = locale === 'ko' ? koreanSupport : await json(`i18n/support-${locale}.json`);
  const documents = legal[locale] ?? await json(`i18n/legal-${locale}.json`);
  const ids = new Set();
  for (const category of support.categories) for (const id of [category.id, `${category.id}-title`, ...category.items.map(item => `faq-${item.id}`)]) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error(`Invalid help ID: ${locale}/${id}`);
    ids.add(id);
  }
  for (const page of pages) {
    const route = page === 'index' ? '' : page;
    const canonical = `https://donup.app${pageURL(locale, route)}`;
    const menu = languageMenu(locale, route, t('언어 선택'));
    let html = templates[page];
    if (page === 'privacy' || page === 'terms') {
      const document = documents[page];
      const content = `<header class="legal-head"><h1>${escape(document.title)}</h1><p class="legal-date">${escape(document.effectiveDate)}</p><p class="legal-lead">${escape(document.subtitle)}</p></header>
<nav class="legal-toc" aria-labelledby="contents-title"><h2 id="contents-title">${escape(t('목차'))}</h2><ol>${document.sections.map((section, index) => `<li><a href="#section-${index + 1}">${escape(section.title)}</a></li>`).join('')}</ol></nav>
${document.sections.map((section, index) => `<section class="legal-section" id="section-${index + 1}" aria-labelledby="heading-${index + 1}"><h2 id="heading-${index + 1}">${escape(section.title)}</h2>${section.body.map(paragraph => `<p>${escape(paragraph)}</p>`).join('\n')}</section>`).join('\n')}`;
      const labels = { PRIVACY_LABEL: '개인정보 처리방침', TERMS_LABEL: '이용약관', SKIP_LABEL: '본문으로 건너뛰기', HOME_LABEL: 'DonUp 홈', LANGUAGE_LABEL: '문서 언어', DOCUMENTS_LABEL: '문서', SUPPORT_LABEL: '도움말', CONTACT_LABEL: '문의하기', SECURITY_LABEL: '개인정보 보호', SITE_NAV_LABEL: '주요 메뉴' };
      const tokens = { LANG: locale, TITLE: document.title, SUBTITLE: document.subtitle, CANONICAL: canonical, LOCALE_PREFIX: '/', KO_CURRENT: '', EN_CURRENT: '', ...Object.fromEntries(Object.entries(labels).map(([key, label]) => [key, t(label)])) };
      html = html.replace(/<link rel="alternate"[^>]+>\s*/g, '').replace(/<nav class="legal-switch"[\s\S]*?<\/nav>/, '<!-- LANGUAGE_MENU -->');
      html = html.replace('<!-- LEGAL_CONTENT -->', '<!-- DOCUMENT_CONTENT -->').replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
        if (!(key in tokens)) throw new Error(`Unknown template token: ${key}`);
        return escape(tokens[key]);
      });
      html = localizeLinks(html, locale).replace('<!-- LANGUAGE_MENU -->', menu).replace('<!-- DOCUMENT_CONTENT -->', (legalNotes[locale] ? `<aside class="legal-translation-note">${legalNotes[locale]} <a href="/en/${page}" lang="en">English</a></aside>` : '') + content);
    } else {
      html = translateHTML(html.replace('<!-- SUPPORT_CONTENT -->', '<!--HELP-->').replace('<!-- HOME_FAQ -->', '<!--FAQ-->').replace('<!--HELP-->', '<div data-help-content></div>').replace('<!--FAQ-->', '<div data-home-faq></div>'), t);
      html = localizeLinks(html, locale);
      html = html.replace(/<html lang="ko">/, `<html lang="${locale}">`).replace(/<link rel="canonical" href="[^"]+"\s*\/>/, `<link rel="canonical" href="${canonical}" />`);
      if (page !== '404') html = html.replace(/(<a class="pill[^\"]*(?:topbar-cta|site-cta)[\s\S]*?<\/a>)/, menu + '$1');
      else html = html.replace(/<body([^>]*)>/, `<body$1>${menu}`);
      const supportContent = `<nav class="support-nav" aria-label="${escape(t('도움말'))}">${support.categories.map(category => `<a href="#${category.id}">${escape(category.title)}</a>`).join('')}</nav><div class="support-sections">${support.categories.map(category => `<section class="support-category" id="${category.id}" data-category="${category.id}" aria-labelledby="${category.id}-title"><header><h2 id="${category.id}-title">${escape(category.title)}</h2><p class="description">${escape(category.description)}</p></header>${category.items.map(item => faq(item, 'support-faq')).join('\n')}</section>`).join('\n')}</div>`;
      html = html.replace('<div data-help-content></div>', supportContent).replace('<div data-home-faq></div>', support.categories.flatMap(category => category.items).filter(item => item.featured).map(item => faq(item, 'faq-item')).join('\n'));
      if (page === 'support') html = html.replace(/(<h1 id="support-title">)[^<]*(<\/h1>)/, `$1${escape(support.title)}$2`).replace(/(<p class="support-lead">)[^<]*(<\/p>)/, `$1${escape(support.subtitle)}$2`);
    }
    html = html.replace(/<html lang="([^"]+)"/, `<html lang="$1" ${Object.entries(runtimeKeys).map(([key, value]) => `data-${key}="${escape(t(value))}"`).join(' ')}`);
    if (locale !== 'ko') html = html.replaceAll('https://apps.apple.com/kr/app/', 'https://apps.apple.com/app/');
    html = html.replace(/\/assets\/screens\/iphone16promax\/([\w-]+)\.webp/g, (match, key) => {
      if (locale === 'ko') return match;
      if (!screenshotMap[locale]?.[key]) throw new Error(`Missing screenshot: ${locale}/${key}`);
      return screenshotMap[locale][key];
    });
    if (page !== '404') {
      const alternates = Object.keys(locales).map(code => `<link rel="alternate" hreflang="${code}" href="https://donup.app${pageURL(code, route)}" />`).join('\n');
      const title = html.match(/<title>([^<]+)<\/title>/)[1];
      const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)[1];
      const image = `https://donup.app/assets/donup-share-${locale === 'ko' ? 'v1' : locale}.png`;
      html = html.replace('</head>', `${alternates}
<link rel="alternate" hreflang="x-default" href="https://donup.app/${route}" />
<meta property="og:type" content="website" /><meta property="og:site_name" content="DonUp" /><meta property="og:locale" content="${locales[locale].og}" />
<meta property="og:url" content="${canonical}" /><meta property="og:title" content="${title}" /><meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" /><meta property="og:image:type" content="image/png" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" /><meta property="og:image:alt" content="${escape(t('DonUp — 말하면 기록되는 가계부'))}" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${title}" /><meta name="twitter:description" content="${description}" /><meta name="twitter:image" content="${image}" />
</head>`);
    }
    const commonAssets = '<link rel="stylesheet" href="/language.css" /><script src="/language.js" defer></script>';
    html = html.includes('</head>') ? html.replace('</head>', commonAssets + '</head>') : html.replace('</body>', commonAssets + '</body>');
    html = html.replace(/\b(src|href)="(\/[\w-]+\.(?:css|js))"/g, (_, attr, url) => {
      const version = versions[url.slice(1)]; if (!version) throw new Error(`Missing asset version: ${url}`);
      return `${attr}="${url}?v=${version}"`;
    });
    if (/\{\{[A-Z_]+\}\}|LEGAL_CONTENT|HOME_FAQ|SUPPORT_CONTENT/.test(html)) throw new Error(`Unresolved template: ${locale}/${page}`);
    const file = join(output, prefix(locale), page + '.html');
    await mkdir(dirname(file), { recursive: true }); await writeFile(file, html); generated.push(file);
  }
}
const urls = Object.keys(locales).flatMap(locale => pages.filter(page => page !== '404').map(page => `https://donup.app${pageURL(locale, page === 'index' ? '' : page)}`));
await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`);
await writeFile(join(output, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://donup.app/sitemap.xml\n');
console.log(`Built ${generated.length} pages in ${Object.keys(locales).length} languages.`);
