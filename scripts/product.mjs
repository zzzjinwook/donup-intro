import { escapeHTML as e, pageURL } from './i18n.mjs';

export const featureRoutes = ['features/recording', 'features/insights'];
const featureURL = (locale, key) => {
  const route = `features/${key}`;
  if (!featureRoutes.includes(route)) throw new Error('Unknown feature route');
  return pageURL(locale, route);
};
const lines = values => values.map(value => `<span>${e(value)}</span>`).join('');
const image = (key, alt, className = '') => `<img class="${className}" src="/assets/screens/iphone16promax/${e(key)}.webp" alt="${e(alt)}" width="717" height="1484" loading="lazy" />`;
const arrow = '<span aria-hidden="true">↗</span>';

export function featureMenu(copy, locale, page) {
  return `<details class="product-menu"><summary>${e(copy.menuShort)}<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></summary><nav aria-label="${e(copy.menu)}"><a href="${pageURL(locale)}#everyday"><strong>${e(copy.menuIntro)}</strong><span>DonUp</span></a>${[['recording', copy.menuRecord], ['insights', copy.menuInsights]].map(([key, label]) => `<a href="${featureURL(locale, key)}"${page === `features/${key}` ? ' aria-current="page"' : ''}><strong>${e(label)}</strong><span>${e(copy.pages[key].title)}</span></a>`).join('')}</nav></details>`;
}

export function sectionRail(copy) {
  const ids = ['start', 'intro', 'everyday', 'flow', 'themes', 'automation', 'privacy', 'faq', 'pricing'];
  if (copy.rail.length !== ids.length) throw new Error('Incomplete section labels');
  return `<nav class="section-rail" data-section-nav aria-label="${e(copy.railLabel)}"><ol>${ids.map((id, index) => `<li><a href="#${id}" aria-label="${e(copy.rail[index])}"><span class="section-rail-label">${e(copy.rail[index])}</span></a></li>`).join('')}</ol></nav>`;
}

export function productStory(copy, locale) {
  if (copy.steps.map(step => step.id).join(',') !== 'record,budget,insights') throw new Error('Invalid story steps');
  return `<section class="product-story" id="everyday" aria-labelledby="story-title"><div class="story-shell"><div class="story-copy"><p class="story-eyebrow">${e(copy.eyebrow)}</p><h2 id="story-title">${lines(copy.headline)}</h2><div class="story-steps">${copy.steps.map((step, index) => `<details class="story-step" name="product-story" data-story-step="${step.id}"${index === 0 ? ' open' : ''}><summary><h3>${e(step.title)}</h3></summary><p>${e(step.text)}</p><a class="story-link" href="${featureURL(locale, step.route)}">${e(step.link)} ${arrow}</a></details>`).join('')}</div></div><div class="story-media"><div class="story-orbit" aria-hidden="true"><img src="/assets/illustrations/story-record-cards-v1.webp" alt="" width="1254" height="1254" loading="lazy" /></div><div class="story-phones">${copy.steps.map((step, index) => image(step.screen, step.alt, `story-screen${index === 0 ? ' is-current' : ''}`).replace('class=', `data-story-screen="${step.id}" class=`)).join('')}</div><p class="story-sample">${e(copy.sample)}</p></div></div></section>
<section class="flow-story" id="flow" aria-labelledby="flow-title"><div class="flow-copy"><p class="flow-eyebrow">${e(copy.flowEyebrow)}</p><h2 id="flow-title">${lines(copy.flowTitle)}</h2><p>${e(copy.flowText)}</p><a class="story-link" href="${featureURL(locale, 'insights')}">${e(copy.menuInsights)} ${arrow}</a></div><div class="flow-visual"><div class="flow-scene" data-flow-scene aria-hidden="true"><div class="flow-entries">${copy.flowEntries.map((entry, index) => `<div class="flow-entry"><span class="flow-entry-dot flow-entry-dot-${index}"></span>${e(entry)}</div>`).join('')}</div><div class="flow-hub"><img src="/assets/screens/donup-icon-256.webp" alt="" width="48" height="48" /></div><div class="flow-bars">${copy.flowEntries.map(entry => `<div class="flow-bar">${e(entry)}</div>`).join('')}</div></div><p class="flow-chart-label">${e(copy.flowResult)}</p><p class="flow-note">${e(copy.flowNote)}</p><button class="flow-replay" data-flow-replay type="button"><span aria-hidden="true">↻</span> ${e(copy.replay)}</button></div></section>`;
}

export function featurePage(copy, locale, key) {
  featureURL(locale, key);
  const page = copy.pages[key];
  const other = key === 'recording' ? 'insights' : 'recording';
  return `<article><header class="product-hero"><div class="product-hero-copy"><p class="product-eyebrow">${e(page.eyebrow)}</p><h1>${lines(page.headline)}</h1><p class="product-lead">${e(page.lead)}</p><a class="pill pill-dark" href="https://apps.apple.com/app/id6770472441">${e(copy.download)}</a></div><figure class="product-hero-media"><img class="product-art" src="/assets/illustrations/${e(page.art)}.webp" alt="" width="1254" height="1254" loading="lazy" />${image(page.screen, page.alt, 'product-hero-phone')}<figcaption>${e(copy.sample)}</figcaption></figure></header><div class="product-benefits">${page.sections.map((section, index) => `<section class="product-benefit"><span class="product-number" aria-hidden="true">0${index + 1}</span><h2>${e(section.title)}</h2><p>${e(section.text)}</p><a href="${pageURL(locale, 'support')}${e(section.href)}">${e(section.link)} ${arrow}</a></section>`).join('')}</div><aside class="product-condition"><h2>${e(copy.conditions)}</h2><p>${e(page.condition)}</p></aside><nav class="product-next" aria-label="${e(copy.more)}"><a href="${featureURL(locale, other)}"><span>${e(copy.more)}</span><strong>${e(copy.pages[other].title)} ${arrow}</strong></a><a href="${pageURL(locale)}#pricing"><span>DonUp</span><strong>${e(copy.rail.at(-1))} ${arrow}</strong></a></nav></article>`;
}
