export const locales = {
  ko: { name: '한국어', short: 'KO', og: 'ko_KR' },
  en: { name: 'English', short: 'EN', og: 'en_US' },
  ja: { name: '日本語', short: 'JP', og: 'ja_JP', font: 'Noto Sans JP' },
  'zh-Hans': { name: '简体中文', short: '简中', og: 'zh_CN', font: 'Noto Sans SC' },
  'zh-Hant': { name: '繁體中文', short: '繁中', og: 'zh_TW', font: 'Noto Sans TC' },
};
export const prefix = locale => locale === 'ko' ? '/' : `/${locale}/`;
export const pageURL = (locale, page = '') => prefix(locale) + page;
export const escapeHTML = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export const normalize = value => value.replace(/\s+/g, ' ').trim();
const decodeEntities = value => value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[entity]);
export function translator(dictionary) {
  return value => {
    const key = normalize(value);
    if (!/[가-힣]/.test(key)) return value;
    if (typeof dictionary[key] !== 'string' || !dictionary[key].trim()) throw new Error(`Missing translation: ${key}`);
    return dictionary[key];
  };
}
export function translateHTML(html, t) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>[^<>]+</g, match => {
      const value = match.slice(1, -1);
      return /[가-힣]/.test(value) ? `>${escapeHTML(decodeEntities(t(value)))}<` : match;
    })
    .replace(/\b(alt|aria-label|placeholder|data-caption|content)="([^"]*)"/g, (match, attr, value) => /[가-힣]/.test(value) ? `${attr}="${escapeHTML(decodeEntities(t(value)))}"` : match);
}
export function languageMenu(locale, page, label) {
  return `<details class="language-menu"><summary aria-label="${escapeHTML(label)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>${locales[locale].short}</summary><nav aria-label="${escapeHTML(label)}">${Object.entries(locales).map(([code, item]) => `<a href="${pageURL(code, page)}" hreflang="${code}" lang="${code}"${code === locale ? ' aria-current="page"' : ''}>${item.name}</a>`).join('')}</nav></details>`;
}
