import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('deployment includes only public files and all local page resources', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root });
  const dist = join(root, 'dist');
  assert.deepEqual(readdirSync(dist).sort(), ['404.html', '_headers', 'assets', 'en', 'index.html', 'legal.css', 'privacy.html', 'script.js', 'security.html', 'styles.css', 'support.css', 'support.html', 'support.js', 'terms.html']);
  for (const file of ['index.html', 'styles.css', 'legal.css', 'support.html', 'support.css', 'security.html', 'privacy.html', 'terms.html', 'en/privacy.html', 'en/terms.html']) {
    const content = readFileSync(join(dist, file), 'utf8');
    if (file.endsWith('.html')) {
      for (const [, resource, version] of content.matchAll(/(?:src|href)="((?:\.\/|\/)?[\w-]+\.(?:css|js))(?:\?v=([^" ]+))?"/g)) {
        const asset = readFileSync(join(dist, resource.replace(/^\.?\//, '')));
        assert.equal(version, createHash('sha256').update(asset).digest('hex').slice(0, 12), `Stale cache key: ${file} -> ${resource}`);
      }
      const ids = [...content.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(new Set(ids).size, ids.length, `Duplicate element ID in ${file}`);
      for (const [, anchor] of content.matchAll(/href="#([^"]+)"/g)) {
        assert.ok(ids.includes(anchor), `Missing anchor ${anchor} in ${file}`);
      }
    }
    const references = [...content.matchAll(/(?:src|href)=["']([^"'#]+)["']|url\(["']?([^"')]+)["']?\)/g)];
    for (const match of references) {
      const resource = match[1] ?? match[2];
      if (/^(?:[a-z]+:|\/\/|#)/i.test(resource)) continue;
      const local = resource.startsWith('/')
        ? resolve(dist, resource.slice(1).split(/[?#]/)[0])
        : resolve(dirname(join(dist, file)), resource.split(/[?#]/)[0]);
      if (local === dist) continue;
      assert.ok(local.startsWith(dist + '/'), `Resource escapes public directory: ${resource}`);
      assert.ok(existsSync(local) || existsSync(local + '.html'), `Missing public resource: ${resource} in ${file}`);
    }
  }
  const inspect = (directory) => {
    for (const name of readdirSync(directory)) {
      assert.ok(!name.startsWith('.'), `Private file published: ${name}`);
      const path = join(directory, name);
      if (statSync(path).isDirectory()) inspect(path);
      else assert.ok(statSync(path).size <= 25 * 1024 * 1024);
    }
  };
  inspect(dist);

  const documents = JSON.parse(readFileSync(join(root, 'legal-content.json'), 'utf8'));
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const support = JSON.parse(readFileSync(join(root, 'support-content.json'), 'utf8'));
  const helpHTML = readFileSync(join(dist, 'support.html'), 'utf8');
  const homeHTML = readFileSync(join(dist, 'index.html'), 'utf8');
  const shareImage = readFileSync(join(dist, 'assets/donup-share-v1.png'));
  assert.equal(shareImage.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(shareImage.readUInt32BE(16), 1200);
  assert.equal(shareImage.readUInt32BE(20), 630);
  assert.ok(shareImage.length < 5 * 1024 * 1024);
  for (const file of ['index.html', 'support.html', 'security.html', 'privacy.html', 'terms.html', 'en/privacy.html', 'en/terms.html']) {
    const html = readFileSync(join(dist, file), 'utf8');
    assert.equal((html.match(/property="og:image"/g) || []).length, 1);
    assert.ok(html.includes('property="og:image" content="https://donup.app/assets/donup-share-v1.png"'));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.ok(html.includes(`property="og:url" content="${canonical}"`));
  }
  // Contact entry points must open the on-site chooser without requiring a mail handler.
  for (const file of ['index.html', 'security.html', 'privacy.html', 'terms.html', 'en/privacy.html', 'en/terms.html']) {
    const html = readFileSync(join(dist, file), 'utf8');
    assert.ok(html.includes('href="/support#contact"'), `Missing contact route in ${file}`);
    assert.doesNotMatch(html, /href="mailto:/);
  }
  assert.match(helpHTML, /<details class="contact-options" id="contact">\s*<summary class="pill pill-dark">메일로 문의하기<\/summary>/);
  assert.ok(helpHTML.includes('value="support@donup.app" readonly'));
  assert.ok(helpHTML.includes('href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=support%40donup.app"'));
  const questions = support.categories.flatMap(category => category.items);
  assert.equal((helpHTML.match(/class="support-faq"/g) || []).length, questions.length);
  assert.doesNotMatch(helpHTML + homeHTML, /SUPPORT_CONTENT|HOME_FAQ/);
  for (const category of support.categories) {
    assert.ok(helpHTML.includes(`href="#${category.id}"`));
    assert.ok(helpHTML.includes(`id="${category.id}-title"`));
    for (const item of category.items) {
      for (const html of item.featured ? [helpHTML, homeHTML] : [helpHTML]) {
        assert.ok(html.includes(`id="faq-${item.id}"`));
        assert.ok(html.includes(`<summary>${escape(item.question)}</summary>`));
        for (const paragraph of item.answer) assert.ok(html.includes(`<p>${escape(paragraph)}</p>`));
      }
    }
  }
  for (const language of ['ko', 'en']) {
    for (const [kind, count] of [['privacy', 14], ['terms', 10]]) {
      const prefix = language === 'ko' ? '/' : '/en/';
      const html = readFileSync(join(dist, prefix, `${kind}.html`), 'utf8');
      const document = documents[language][kind];
      assert.ok(html.includes(`<html lang="${language}">`));
      assert.ok(html.includes(`href="https://donup.app${prefix}${kind}"`));
      assert.doesNotMatch(html, /LEGAL_CONTENT|\{\{[A-Z_]+\}\}|<script\b/);
      assert.equal(document.sections.length, count);
      assert.equal((html.match(/class="legal-section"/g) || []).length, count);
      for (const [index, section] of document.sections.entries()) {
        assert.ok(html.includes(`href="#section-${index + 1}"`));
        assert.ok(html.includes(`<h2 id="heading-${index + 1}">${escape(section.title)}</h2>`));
        for (const paragraph of section.body) assert.ok(html.includes(`<p>${escape(paragraph)}</p>`), `Missing paragraph in ${language}/${kind}`);
      }
      assert.equal((html.match(/<p>/g) || []).length, document.sections.reduce((sum, section) => sum + section.body.length, 0));
    }
  }
});
