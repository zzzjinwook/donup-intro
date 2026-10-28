const languageLinks = document.querySelectorAll('.language-menu a[hreflang]');
for (const link of languageLinks) {
  link.addEventListener('click', () => {
    try { localStorage.setItem('donup.website.language', link.hreflang); } catch {}
    const destination = new URL(link.href);
    destination.hash = location.hash;
    destination.search = location.search;
    link.href = destination.href;
  });
}
document.addEventListener('click', event => {
  document.querySelectorAll('.language-menu[open]').forEach(menu => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const menu = document.querySelector('.language-menu[open]');
  if (menu) { menu.open = false; menu.querySelector('summary').focus(); }
});
// 직접 고른 언어를 우선하고, 첫 홈 방문만 브라우저 언어에 맞춘다.
if (location.pathname === '/') {
  let preferred;
  try { preferred = localStorage.getItem('donup.website.language'); } catch {}
  if (!preferred) {
    for (const language of navigator.languages ?? [navigator.language]) {
      const value = language?.toLowerCase().replaceAll('_', '-') ?? '';
      if (/^(zh|yue)(-|$)/.test(value)) { preferred = /hant|tw|hk|mo|^yue/.test(value) ? 'zh-Hant' : 'zh-Hans'; break; }
      preferred = ['ko', 'en', 'ja'].find(code => value === code || value.startsWith(code + '-'));
      if (preferred) break;
    }
  }
  if (['en', 'ja', 'zh-Hans', 'zh-Hant'].includes(preferred)) location.replace(`/${preferred}/${location.search}${location.hash}`);
}
