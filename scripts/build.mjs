import { cp, mkdir, rm, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const publicFiles = ['index.html', 'styles.css', 'script.js', 'legal.css', 'support.css', 'support.js', 'security.html', '404.html', '_headers', 'assets/donup-app-icon.png', 'assets/donup-share-v1.png'];
const imageTypes = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.gif', '.ico']);

// Publish only named web files and images, never repository or agent configuration.
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
  ...(await collectImages('assets/illustrations')).filter(path => path.endsWith('.webp'))];
for (const path of files) {
  if ((await stat(join(root, path))).size > 25 * 1024 * 1024) {
    throw new Error(`Cloudflare Pages 25 MiB limit exceeded: ${path}`);
  }
}
await rm(output, { recursive: true, force: true });
for (const path of files) {
  await mkdir(dirname(join(output, path)), { recursive: true });
  await cp(join(root, path), join(output, path));
}
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const support = JSON.parse(await readFile(join(root, 'support-content.json'), 'utf8'));
const ids = new Set();
for (const category of support.categories) {
  for (const id of [category.id, `${category.id}-title`, ...category.items.map(item => `faq-${item.id}`)]) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error(`Invalid or duplicate help ID: ${id}`);
    ids.add(id);
  }
}
const faq = (item, className) => `<details class="${className}" id="faq-${item.id}"><summary>${escape(item.question)}</summary><div class="faq-answer">${item.answer.map(paragraph => `<p>${escape(paragraph)}</p>`).join('\n')}</div></details>`;
const supportContent = `<nav class="support-nav" aria-label="도움말 주제">${support.categories.map(category => `<a href="#${category.id}">${escape(category.title)}</a>`).join('')}</nav>
<div class="support-sections">${support.categories.map(category => `<section class="support-category" id="${category.id}" data-category="${category.id}" aria-labelledby="${category.id}-title"><header><h2 id="${category.id}-title">${escape(category.title)}</h2><p class="description">${escape(category.description)}</p></header>${category.items.map(item => faq(item, 'support-faq')).join('\n')}</section>`).join('\n')}</div>`;
for (const [file, marker, content] of [
  ['support.html', '<!-- SUPPORT_CONTENT -->', supportContent],
  ['index.html', '<!-- HOME_FAQ -->', support.categories.flatMap(category => category.items).filter(item => item.featured).map(item => faq(item, 'faq-item')).join('\n')],
]) {
  const template = await readFile(join(root, file), 'utf8');
  if (template.split(marker).length !== 2) throw new Error(`Expected exactly one ${marker} in ${file}`);
  await writeFile(join(output, file), template.replace(marker, content));
}
const documents = JSON.parse(await readFile(join(root, 'legal-content.json'), 'utf8'));
for (const language of ['ko', 'en']) {
  const korean = language === 'ko';
  const prefix = korean ? '/' : '/en/';
  for (const kind of ['privacy', 'terms']) {
    const document = documents[language][kind];
    const template = await readFile(join(root, `${kind}.html`), 'utf8');
    const contentsLabel = korean ? '목차' : 'Contents';
    const content = `<header class="legal-head"><h1>${escape(document.title)}</h1><p class="legal-date">${escape(document.effectiveDate)}</p><p class="legal-lead">${escape(document.subtitle)}</p></header>
<nav class="legal-toc" aria-labelledby="contents-title"><h2 id="contents-title">${contentsLabel}</h2><ol>${document.sections.map((section, index) => `<li><a href="#section-${index + 1}">${escape(section.title)}</a></li>`).join('')}</ol></nav>
${document.sections.map((section, index) => `<section class="legal-section" id="section-${index + 1}" aria-labelledby="heading-${index + 1}"><h2 id="heading-${index + 1}">${escape(section.title)}</h2>${section.body.map(paragraph => `<p>${escape(paragraph)}</p>`).join('\n')}</section>`).join('\n')}`;
    const tokens = {
      LANG: language, TITLE: escape(document.title), SUBTITLE: escape(document.subtitle),
      CANONICAL: `https://donup.app${prefix}${kind}`,
      KO_CURRENT: korean ? 'aria-current="page"' : '', EN_CURRENT: korean ? '' : 'aria-current="page"',
      LOCALE_PREFIX: prefix, PRIVACY_LABEL: korean ? '개인정보 처리방침' : 'Privacy Policy',
      TERMS_LABEL: korean ? '이용약관' : 'Terms of Service', SKIP_LABEL: korean ? '본문으로 건너뛰기' : 'Skip to content',
      HOME_LABEL: korean ? 'DonUp 홈' : 'DonUp home', LANGUAGE_LABEL: korean ? '문서 언어' : 'Document language',
      DOCUMENTS_LABEL: korean ? '문서' : 'Documents',
      SUPPORT_LABEL: korean ? '도움말' : 'Help',
      CONTACT_LABEL: korean ? '문의하기' : 'Contact',
      SECURITY_LABEL: korean ? '개인정보 보호' : 'Privacy',
      SITE_NAV_LABEL: korean ? '주요 메뉴' : 'Site navigation',
    };
    if (template.split('<!-- LEGAL_CONTENT -->').length !== 2) throw new Error(`Expected one document placeholder: ${kind}`);
    const html = template.replace('<!-- LEGAL_CONTENT -->', content).replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
      if (!(key in tokens)) throw new Error(`Unknown legal template token: ${key}`);
      return tokens[key];
    });
    const destination = join(output, prefix, `${kind}.html`);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
}
// HTML must not reuse cached CSS/JS from an earlier deployment.
const versions = Object.fromEntries(await Promise.all(publicFiles.filter(file => /\.(css|js)$/.test(file)).map(async file =>
  [file, createHash('sha256').update(await readFile(join(output, file))).digest('hex').slice(0, 12)]
)));
for (const file of ['index.html', 'support.html', 'security.html', 'privacy.html', 'terms.html', 'en/privacy.html', 'en/terms.html', '404.html']) {
  const path = join(output, file);
  let html = await readFile(path, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (canonical) {
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)[1];
    const image = 'https://donup.app/assets/donup-share-v1.png';
    html = html.replace('</head>', `  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="DonUp" />
  <meta property="og:locale" content="${file.startsWith('en/') ? 'en_US' : 'ko_KR'}" />
  <meta property="og:url" content="${canonical[1]}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="DonUp — 말하면 기록되는 가계부" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>`);
  }
  await writeFile(path, html.replace(/\b(src|href)="((?:\.\/|\/)?[\w-]+\.(?:css|js))"/g, (_, attribute, url) => {
    const version = versions[url.replace(/^\.?\//, '')];
    if (!version) throw new Error(`Missing asset version: ${url}`);
    return `${attribute}="${url}?v=${version}"`;
  }));
}
console.log(`Built ${files.length + 5} public files in dist/`);
