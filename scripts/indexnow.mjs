import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { origin } from './seo.mjs';

export function changedURLs(current, previous) {
  return [...new Set([...Object.keys(current), ...Object.keys(previous)])]
    .filter(url => current[url] !== previous[url]);
}

export function sitemapURLs(xml) {
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (!urls.length || urls.length > 10000 || new Set(urls).size !== urls.length) throw new Error('Invalid sitemap URL count');
  for (const value of urls) {
    const url = new URL(value);
    if (url.origin !== origin || url.search || url.hash || !/^\/[a-zA-Z0-9/-]*$/.test(url.pathname)) throw new Error('Invalid canonical URL: ' + value);
  }
  return urls;
}

export function pageRevision(html) {
  const revisions = [...html.matchAll(/<meta name="donup-page-revision" content="([a-f0-9]{64})"\s*\/>/g)];
  if (revisions.length !== 1) throw new Error('Missing or duplicate deployed page revision');
  return revisions[0][1];
}

async function publish() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const cache = join(root, '.cache/indexnow.json');
  const { indexNowKey: key } = JSON.parse(await readFile(join(root, 'content/search-publishing.json'), 'utf8'));
  if (!/^[a-f0-9]{32}$/.test(key)) throw new Error('Invalid ownership key');
  const current = {};
  for (const url of sitemapURLs(await readFile(join(root, 'dist/sitemap.xml'), 'utf8'))) {
    const path = new URL(url).pathname;
    const html = await readFile(join(root, 'dist', path, path.endsWith('/') ? 'index.html' : '') + (path.endsWith('/') ? '' : '.html'), 'utf8');
    current[url] = pageRevision(html);
  }
  let previous = {};
  try { previous = JSON.parse(await readFile(cache, 'utf8')).pages; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const urls = changedURLs(current, previous);
  if (!urls.length) { console.log('IndexNow: no changed pages.'); return; }
  const keyLocation = `${origin}/${key}.txt`;
  const verification = await fetch(keyLocation, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (verification.status !== 200 || (await verification.text()).trim() !== key) throw new Error('Deploy the ownership key before submitting');
  // Never announce a local build that has not reached the production domain.
  for (const url of urls) {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
    if (!current[url]) {
      if (![404, 410].includes(response.status)) throw new Error('Removed URL is still live: ' + url);
    } else if (response.status !== 200 || pageRevision(await response.text()) !== current[url]) {
      throw new Error('Production does not match this build: ' + url);
    }
  }
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'donup.app', key, keyLocation, urlList: urls }), signal: AbortSignal.timeout(30000),
  });
  if (![200, 202].includes(response.status)) throw new Error(`IndexNow HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
  const result = { submittedAt: new Date().toISOString(), status: response.status, urls, pages: current };
  await mkdir(join(root, '.cache'), { recursive: true });
  await writeFile(cache + '.tmp', JSON.stringify(result, null, 2) + '\n');
  await rename(cache + '.tmp', cache);
  console.log(`IndexNow: ${urls.length} URL(s) received (HTTP ${response.status}). Indexing is not guaranteed.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await publish();
