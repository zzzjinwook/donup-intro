import { escapeHTML as escape, pageURL } from './i18n.mjs';

export const guideRoute = 'guides/start-budgeting';
export const guideQuestions = guide => guide.faq.map((item, index) => ({ id: 'guide-' + (index + 1), question: item.question, answer: [item.answer] }));

export function renderGuide(guide, locale, t, updated) {
  if (!guide.title || !guide.answer || !guide.sections.length || !guide.faq.length) throw new Error('Incomplete guide');
  const ids = guide.sections.map(section => section.id);
  if (new Set(ids).size !== ids.length || ids.some(id => !/^[a-z][a-z0-9-]*$/.test(id))) throw new Error('Invalid guide section ID');
  return `<article class="guide-article"><header class="support-hero"><p class="eyebrow">DonUp · ${escape(t('도움말'))}</p><h1>${escape(guide.title)}</h1><p class="guide-answer">${escape(guide.answer)}</p><p class="guide-date"><time datetime="${escape(updated)}">${escape(updated)}</time> · DonUp</p></header>
<figure class="guide-screens"><div>${[['home-pink-light', '홈에서 한눈에'], ['budget-mint-light', '예산을 지켜요'], ['statistics-skyblue-light', '소비 흐름을 읽어요']].map(([key, label]) => `<img src="/assets/screens/iphone16promax/${key}.webp" alt="DonUp · ${escape(t(label))}" width="717" height="1484" loading="lazy" />`).join('')}</div><figcaption>${escape(guide.imageAlt)}</figcaption></figure>
<nav class="guide-toc" aria-label="${escape(t('목차'))}"><h2>${escape(t('목차'))}</h2><ol>${guide.sections.map(section => `<li><a href="#${section.id}">${escape(section.title)}</a></li>`).join('')}</ol></nav>
${guide.sections.map(section => `<section id="${section.id}"><h2>${escape(section.title)}</h2>${section.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</section>`).join('')}
<section class="guide-faq"><h2>${escape(t('자주 묻는 질문'))}</h2>${guideQuestions(guide).map(item => `<details class="support-faq" id="faq-${item.id}"><summary>${escape(item.question)}</summary><div class="faq-answer"><p>${escape(item.answer[0])}</p></div></details>`).join('')}</section>
<aside class="guide-download"><a class="pill pill-dark" href="https://apps.apple.com/app/id6770472441">App Store · ${escape(t('앱 다운로드'))}</a><p><a href="${pageURL(locale)}#pricing">${escape(t('무료와 Pro 비교'))}</a> · <a href="${pageURL(locale, 'support')}">${escape(t('도움말'))}</a> · <a href="${pageURL(locale, 'security')}">${escape(t('개인정보 보호'))}</a></p></aside></article>`;
}
