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
// 언어별 URL은 항상 같은 본문을 제공한다. 자동 이동 대신 언어 메뉴로 선택한다.
