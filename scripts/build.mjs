import { cp, mkdir, rm, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { locales, prefix, pageURL, escapeHTML as escape, translator, translateHTML, languageMenu } from './i18n.mjs';
import { structuredData, jsonLDScript, sitemap, llmsText, helpFeed } from './seo.mjs';
import { guideRoute, guideQuestions, renderGuide } from './guide.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const read = file => readFile(join(root, file), 'utf8');
const json = async file => JSON.parse(await read(file));
const publicFiles = ['styles.css', 'script.js', 'legal.css', 'support.css', 'support.js', 'language.css', 'language.js', 'fonts.css', '_headers', 'assets/fonts/OFL.txt', 'assets/donup-app-icon.png', 'assets/donup-share-v1.png'];
const screenshotMap = await json('i18n/screenshots.json');
const screenshotFiles = [...new Set(Object.values(screenshotMap).flatMap(screens =>
  Object.entries(screens).flatMap(([key, path]) => [`assets/screens/iphone16promax/${key}.webp`, path.replace(/^\//, '')])))];
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
const files = [...publicFiles, 'assets/screens/donup-icon-256.png', 'assets/screens/donup-icon-256.webp', ...screenshotFiles,
  ...(await readdir(join(root, 'assets/fonts/wanted-sans-1.0.3'))).filter(name => name.endsWith('.woff2')).map(name => 'assets/fonts/wanted-sans-1.0.3/' + name),
  ...(await collectImages('assets/illustrations')).filter(path => path.endsWith('.webp')),
  ...((await readdir(join(root, 'assets'))).filter(name => /^donup-share-(en|ja|zh-Hans|zh-Hant)\.png$/.test(name)).map(name => 'assets/' + name))];
for (const file of files) if ((await stat(join(root, file))).size > 25 * 1024 * 1024) throw new Error(`Cloudflare Pages file too large: ${file}`);
await rm(output, { recursive: true, force: true });
for (const file of files) { await mkdir(dirname(join(output, file)), { recursive: true }); await cp(join(root, file), join(output, file)); }
const versionedFiles = files.filter(file => /\.(css|js)$/.test(file) || file.startsWith('assets/'));
const versions = Object.fromEntries(await Promise.all(versionedFiles.map(async file => [file, createHash('sha256').update(await readFile(join(root, file))).digest('hex').slice(0, 12)])));
const publishing = await json('content/search-publishing.json');
if (!/^[a-f0-9]{32}$/.test(publishing.indexNowKey)) throw new Error('Invalid IndexNow ownership key');
await writeFile(join(output, publishing.indexNowKey + '.txt'), publishing.indexNowKey);
const source = await json('i18n/source.json');
const legal = await json('legal-content.json');
const koreanSupport = await json('support-content.json');
const pageDates = await json('content/page-dates.json');
const entryGuide = await json('content/entry-guide.json');
pageDates[guideRoute] = entryGuide.updated;
const pages = ['index', 'support', 'security', 'privacy', 'terms', '404', guideRoute];
const templates = Object.fromEntries(await Promise.all(pages.map(async page => [page, await read(page + '.html')])));
const inlineStyles = Object.fromEntries(await Promise.all(publicFiles.filter(file => file.endsWith('.css'))
  .map(async file => [file, (await read(file)).replace(/\/\*[\s\S]*?\*\//g, comment => comment.includes('Copyright') ? comment : '').trim()])));
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
const faq = (item, className, links, t) => `<details class="${className}" id="faq-${item.id}"><summary>${escape(item.question)}</summary><div class="faq-answer">${item.answer.map(paragraph => `<p>${escape(paragraph)}</p>`).join('\n')}${item.facts?.length ? `<dl class="support-facts">${item.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('')}</dl>` : ''}${item.steps?.length ? `<h3>${escape(t('진행 순서'))}</h3><ol class="support-steps">${item.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>` : ''}${item.updated ? `<p class="help-updated">${escape(t('최종 확인: {date}')).replace('{date}', `<time datetime="${escape(item.updated)}">${escape(item.updated)}</time>`)}</p>` : ''}${links.length ? `<p class="faq-related">${links.map(link => `<a href="${escape(link.href)}">${escape(link.label)}</a>`).join(' · ')}</p>` : ''}</div></details>`;
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
  const pageNames = { support: t('도움말'), security: t('개인정보 보호'), privacy: t('개인정보 처리방침'), terms: t('이용약관') };
  const guide = entryGuide.locales[locale];
  pageNames[guideRoute] = guide.title;
  const related = {
    'free-pro': [{ href: pageURL(locale) + '#pricing', label: t('무료와 Pro 비교') }],
    pricing: [{ href: pageURL(locale) + '#pricing', label: t('무료와 Pro 비교') }],
    'ai-data': [{ href: pageURL(locale, 'security'), label: t('개인정보 보호 자세히 보기') }],
    'ai-revoke': [{ href: pageURL(locale, 'security') + '#control', label: t('개인정보 보호 자세히 보기') }],
  };
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
      else html = html.replace(/<body([^>]*)>/, `<body$1><header>${menu}</header>`);
      const supportContent = `<nav class="support-nav" aria-label="${escape(t('도움말'))}">${support.categories.map(category => `<a href="#${category.id}"><span class="support-nav-title">${escape(category.title)}</span><span class="support-nav-desc">${escape(category.description)}</span><span class="support-nav-count">${escape(t('질문 {count}개').replace('{count}', category.items.length))}</span></a>`).join('')}</nav><div class="support-sections">${support.categories.map(category => `<section class="support-category" id="${category.id}" data-category="${category.id}" aria-labelledby="${category.id}-title"><header><h2 id="${category.id}-title">${escape(category.title)}</h2><p class="description">${escape(category.description)}</p></header>${category.items.map(item => faq(item, 'support-faq', related[item.id] ?? [], t)).join('\n')}</section>`).join('\n')}</div>`;
      html = html.replace('<div data-help-content></div>', supportContent).replace('<div data-home-faq></div>', support.categories.flatMap(category => category.items).filter(item => item.featured).map(item => faq(item, 'faq-item', [{ href: pageURL(locale, 'support') + '#faq-' + item.id, label: t('도움말에서 자세히 보기') }], t)).join('\n'));
      if (page === 'support') html = html.replace(/(<h1 id="support-title">)[^<]*(<\/h1>)/, `$1${escape(support.title)}$2`).replace(/(<p class="support-lead">)[^<]*(<\/p>)/, `$1${escape(support.subtitle)}$2`);
      if (page === guideRoute) html = html.replace('__GUIDE_TITLE__', escape(guide.title + ' | DonUp')).replace('__GUIDE_DESCRIPTION__', escape(guide.description)).replace('<div data-guide-content></div>', renderGuide(guide, locale, t, entryGuide.updated));
      if (page === 'index') html = html.replace(/(<a class="text-link" href="[^"]*support">)/, `<p class="guide-discovery"><a href="${pageURL(locale, guideRoute)}">${escape(guide.title)}</a></p>$1`);
      if (page === 'support') html = html.replace('<div class="support-body">', `<div class="support-body"><aside class="guide-discovery"><a href="${pageURL(locale, guideRoute)}">${escape(guide.title)}</a><p>${escape(guide.answer)}</p></aside>`);
    }
    if (pageNames[page]) html = html.replace(/(<main\b[^>]*>)/, `$1<nav class="page-path" aria-label="${escape(t('현재 위치'))}"><ol><li><a href="${pageURL(locale)}">DonUp</a></li><li aria-current="page">${escape(pageNames[page])}</li></ol></nav>`);
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
      const imageFile = `assets/donup-share-${locale === 'ko' ? 'v1' : locale}.png`;
      const image = `https://donup.app/${imageFile}?v=${versions[imageFile]}`;
      html = html.replace('</head>', `<link rel="alternate" type="application/rss+xml" title="DonUp — ${escape(t('도움말 업데이트'))}" href="${pageURL(locale, 'feed.xml')}" />${page === 'index' && locale === 'ko' ? `<meta name="naver-site-verification" content="${escape(publishing.naverVerification)}" /><meta name="msvalidate.01" content="${escape(publishing.bingVerification)}" />` : ''}${alternates}
<link rel="alternate" hreflang="x-default" href="https://donup.app/${route}" />
<meta property="og:type" content="${page === guideRoute ? 'article' : 'website'}" /><meta property="og:site_name" content="DonUp" /><meta property="og:locale" content="${locales[locale].og}" />
<meta property="og:url" content="${canonical}" /><meta property="og:title" content="${title}" /><meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" /><meta property="og:image:type" content="image/png" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" /><meta property="og:image:alt" content="${escape(t('DonUp — 말하면 기록되는 가계부'))}" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${title}" /><meta name="twitter:description" content="${description}" /><meta name="twitter:image" content="${image}" />
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
${jsonLDScript(structuredData({ locale, page, title, description, image, pageName: pageNames[page],
  logo: `https://donup.app/assets/donup-app-icon.png?v=${versions['assets/donup-app-icon.png']}`,
  article: page === guideRoute ? entryGuide : undefined, modified: pageDates[page], questions: page === guideRoute ? guideQuestions(guide) : support.categories.flatMap(category => category.items).filter(item => page === 'support' || item.featured) }))}
</head>`);
    } else html = html.replace('</head>', '<meta name="robots" content="noindex,follow" /></head>');
    if (locale === 'ja' && page === 'index') html = html.replace('もっと便利に、Proで。</h2>', 'もっと便利に、<span class="pricing-title-phrase">Proで。</span></h2>');
    const localeFont = locales[locale].font;
    const fontAssets = '<link rel="stylesheet" href="/fonts.css" />' + (localeFont ? `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${localeFont.replaceAll(' ', '+')}:wght@100..900&amp;display=swap" />` : '');
    const commonAssets = '<link rel="stylesheet" href="/language.css" /><script src="/language.js" defer></script>' + fontAssets;
    html = html.includes('</head>') ? html.replace('</head>', commonAssets + '</head>') : html.replace('</body>', commonAssets + '</body>');
    // These small page styles avoid extra render-blocking round trips on the first visit.
    html = html.replace(/<link rel="stylesheet" href="\/([\w-]+\.css)"\s*\/>/g,
      (_, file) => `<style data-source="${file}">${inlineStyles[file]}</style>`);
    html = html.replace(/<img\b[^>]*>/g, tag => {
      if (!tag.includes('decoding=')) tag = tag.replace('<img', '<img decoding="async"');
      if (tag.includes('class="obj ') && !tag.includes('fetchpriority=')) tag = tag.replace('<img', '<img fetchpriority="low"');
      if (tag.includes('data-screen="home"') && !tag.includes('loading=')) tag = tag.replace('<img', '<img loading="lazy"');
      return tag;
    });
    html = html.replace(/\b(src|href)="((?:\/[\w-]+\.(?:css|js)|\/assets\/[^"?]+\.(?:webp|png)))"/g, (_, attr, url) => {
      const version = versions[url.slice(1)]; if (!version) throw new Error(`Missing asset version: ${url}`);
      return `${attr}="${url}?v=${version}"`;
    });
    if (/\{\{[A-Z_]+\}\}|LEGAL_CONTENT|HOME_FAQ|SUPPORT_CONTENT/.test(html)) throw new Error(`Unresolved template: ${locale}/${page}`);
    // Cloudflare transforms email markup; verify this source revision instead of transformed bytes.
    html = html.replace('</head>', `<meta name="donup-page-revision" content="${createHash('sha256').update(html).digest('hex')}" /></head>`);
    const file = join(output, prefix(locale), page + '.html');
    await mkdir(dirname(file), { recursive: true }); await writeFile(file, html); generated.push(file);
  }
  await writeFile(join(output, prefix(locale), 'feed.xml'), helpFeed(locale, t('도움말 업데이트'), [{ id: 'start-budgeting', route: guideRoute, question: guide.title, answer: [guide.answer, ...guide.sections.flatMap(section => [section.title, ...section.paragraphs])], updated: entryGuide.updated }, ...support.categories.flatMap(category => category.items).filter(item => item.updated)]));
}
await writeFile(join(output, 'sitemap.xml'), sitemap(pages.filter(page => page !== '404'), pageDates));
await writeFile(join(output, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://donup.app/sitemap.xml\n');
await writeFile(join(output, 'llms.txt'), llmsText());
console.log(`Built ${generated.length} pages in ${Object.keys(locales).length} languages.`);
