// Loads the canonical Chinese page into a locale-preserving wrapper and injects the shared i18n runtime.
const locale = window.__CGO_LOCALE__ === 'ja' ? 'ja' : 'en';
const sourceHref = window.__CGO_LOCALE_SOURCE__;

if (!sourceHref) {
  throw new Error('CGoUI localized page is missing __CGO_LOCALE_SOURCE__.');
}

const sourceUrl = new URL(sourceHref, location.href);
const runtimeUrl = new URL('./runtime.js', import.meta.url);

try {
  const response = await fetch(sourceUrl, { credentials: 'same-origin', cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  let html = await response.text();
  const lang = locale === 'ja' ? 'ja' : 'en';

  if (/<html\b[^>]*\blang=/i.test(html)) {
    html = html.replace(/(<html\b[^>]*\blang=)(["'])[^"']*\2/i, `$1"${lang}"`);
  } else {
    html = html.replace(/<html\b/i, `<html lang="${lang}"`);
  }

  // Make every relative stylesheet, script, image and source-page link resolve as if the
  // canonical page itself were loaded. The runtime rewrites user-facing page links back
  // into the active locale after the DOM is ready.
  const injected = [
    `<base href="${sourceUrl.href.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`,
    `<script>window.__CGO_LOCALE__=${JSON.stringify(locale)};window.__CGO_LOCALE_SOURCE__=${JSON.stringify(sourceUrl.href)};<\/script>`,
    `<script type="module" src="${runtimeUrl.href}"><\/script>`,
  ].join('\n');

  html = html.replace(/<head([^>]*)>/i, (match) => `${match}\n${injected}`);

  document.open();
  document.write(html);
  document.close();
} catch (error) {
  const copy = locale === 'ja'
    ? { title: 'ページを読み込めませんでした', body: 'CGoUIの元ページを読み込めませんでした。ネットワーク接続を確認して再読み込みしてください。' }
    : { title: 'Unable to load this page', body: 'The canonical CGoUI page could not be loaded. Check your connection and reload the page.' };
  document.documentElement.lang = locale === 'ja' ? 'ja' : 'en';
  document.body.innerHTML = `<main style="font-family:system-ui,sans-serif;max-width:720px;margin:12vh auto;padding:24px"><h1>${copy.title}</h1><p>${copy.body}</p><pre>${String(error)}</pre></main>`;
}
