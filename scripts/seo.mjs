import { locales, pageURL, escapeHTML } from './i18n.mjs';

export const origin = 'https://donup.app';
export const storeURL = 'https://apps.apple.com/app/id6770472441';
const plain = value => String(value).replace(/&(amp|lt|gt|quot|#39);/g,
  (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[entity]);

// Only information shown on the page: no invented reviews, ratings or paid offers.
export function structuredData({ locale, page, title, description, image, logo, questions = [], pageName, modified, article }) {
  const url = origin + pageURL(locale, page === 'index' ? '' : page);
  const home = origin + pageURL(locale);
  const publisher = { '@id': origin + '/#publisher' };
  const website = { '@id': origin + '/#website' };
  const graph = [
    { '@type': 'Organization', ...publisher, name: 'DonUp', url: origin + '/', logo, email: 'support@donup.app',
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: 'support@donup.app',
        url: origin + '/support#contact' } },
    { '@type': 'WebSite', ...website, name: 'DonUp', alternateName: ['돈업', 'Donup'], url: origin + '/', inLanguage: Object.keys(locales), publisher },
    { '@type': page === 'support' ? ['WebPage', 'FAQPage'] : 'WebPage', '@id': url + '#webpage', url,
      name: plain(title), description: plain(description), inLanguage: locale, isPartOf: website,
      ...(modified ? { dateModified: modified } : {}),
      primaryImageOfPage: { '@type': 'ImageObject', url: image },
      ...(page === 'index' ? { mainEntity: { '@id': home + '#app' } } : {}),
      ...(page === 'support' ? { mainEntity: questionEntities(questions, url) } : {}),
      ...(page !== 'index' ? { breadcrumb: { '@id': url + '#breadcrumb' } } : {}),
    },
  ];
  if (page === 'index') {
    graph.push({ '@type': 'MobileApplication', '@id': home + '#app', name: 'DonUp', alternateName: '돈업',
      url: home, description: plain(description), applicationCategory: 'FinanceApplication',
      operatingSystem: 'iOS 26.0 or later', inLanguage: Object.keys(locales),
      downloadUrl: storeURL, installUrl: storeURL, sameAs: [storeURL], image, publisher,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW', url: storeURL },
    });
    graph.push({ '@type': 'FAQPage', '@id': home + '#faq', isPartOf: { '@id': url + '#webpage' },
      inLanguage: locale, mainEntity: questionEntities(questions, home) });
  } else {
    graph.push({ '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'DonUp', item: home },
      { '@type': 'ListItem', position: 2, name: plain(pageName ?? title.replace(/\s*\|\s*DonUp$/, '')), item: url },
    ] });
  }
  if (article) {
    graph.find(node => node['@id'] === url + '#webpage').mainEntity = { '@id': url + '#article' };
    graph.push({ '@type': 'Article', '@id': url + '#article', headline: article.locales[locale].title,
      description: plain(description), inLanguage: locale, mainEntityOfPage: { '@id': url + '#webpage' },
      datePublished: article.published, dateModified: article.updated, author: publisher, publisher, image });
    graph.push({ '@type': 'FAQPage', '@id': url + '#faq', isPartOf: { '@id': url + '#webpage' }, inLanguage: locale, mainEntity: questionEntities(questions, url) });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function answerText(item) {
  return [...item.answer, ...(item.facts ?? []).map(fact => `${fact.label}: ${fact.value}`), ...(item.steps ?? []).map((step, index) => `${index + 1}. ${step}`)].map(plain).join('\n\n');
}

function questionEntities(questions, url) {
  return questions.map(item => ({ '@type': 'Question', '@id': `${url}#faq-${item.id}`, name: plain(item.question),
    acceptedAnswer: { '@type': 'Answer', text: answerText(item) } }));
}

export const jsonLDScript = data => `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029')}</script>`;

export function sitemap(pages, modified = {}) {
  for (const date of Object.values(modified)) if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Invalid editorial update date');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pages.flatMap(page => Object.keys(locales).map(locale => {
    const route = page === 'index' ? '' : page;
    const alternates = [...Object.keys(locales), 'x-default'].map(code =>
      `<xhtml:link rel="alternate" hreflang="${code}" href="${origin}${pageURL(code === 'x-default' ? 'ko' : code, route)}" />`).join('');
    return `<url><loc>${escapeHTML(origin + pageURL(locale, route))}</loc>${modified[page] ? `<lastmod>${modified[page]}</lastmod>` : ''}${alternates}</url>`;
  })).join('')}</urlset>\n`;
}

export function helpFeed(locale, title, items) {
  for (const item of items) if (!/^\d{4}-\d{2}-\d{2}$/.test(item.updated) || new Date(item.updated).toISOString().slice(0, 10) !== item.updated) throw new Error('Invalid help update date');
  const url = origin + pageURL(locale, 'feed.xml');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeHTML('DonUp — ' + title)}</title><link>${origin}${pageURL(locale, 'support')}</link><description>${escapeHTML(title)}</description><language>${locale}</language><atom:link href="${url}" rel="self" type="application/rss+xml"/>${items.map(item => `<item><title>${escapeHTML(item.question)}</title><link>${origin}${pageURL(locale, item.route ?? 'support')}${item.route ? '' : '#faq-' + item.id}</link><guid isPermaLink="true">${origin}${pageURL(locale, item.route ?? 'support')}${item.route ? '' : '#faq-' + item.id}</guid><pubDate>${new Date(item.updated + 'T00:00:00+09:00').toUTCString()}</pubDate><description>${escapeHTML(answerText(item))}</description></item>`).join('')}</channel></rss>\n`;
}

export function llmsText() {
  return `# DonUp (돈업)\n\n> Official website for DonUp, a personal finance app for iPhone and iPad, for recording income and expenses, budgets and spending statistics.\n\nDonUp supports iOS 26.0 and later on iPhone, and iPadOS 26.0 and later on iPad. The app is free to download; Pro features are optional. Android is coming soon. AI features require optional data-use consent. Contact: support@donup.app.\n\n## Official pages by language\n\n${Object.entries(locales).map(([code, value]) => `### ${value.name}\n- [App overview and pricing](${origin}${pageURL(code)}): Features and Free/Pro comparison.\n- [Help and FAQ](${origin}${pageURL(code, 'support')}): Account, recording, budgets, backup, DonWorry, sharing and subscriptions.\n- [Getting started with budgeting](${origin}${pageURL(code, 'guides/start-budgeting')}): First-job budgets, couples’ shared ledgers and optional AI input.\n- [Help updates RSS](${origin}${pageURL(code, 'feed.xml')}): Recent changes to official help answers.\n- [Privacy and security](${origin}${pageURL(code, 'security')})\n- [Privacy policy](${origin}${pageURL(code, 'privacy')})\n- [Terms](${origin}${pageURL(code, 'terms')})\n`).join('\n')}\n## Download\n\n- [App Store](${storeURL})\n\nPrices and trial eligibility vary by country and account. The current App Store purchase screen provides the final terms.\n`;
}
