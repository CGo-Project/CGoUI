// Localized entry pages redirect to the canonical page. Keeping one live document
// avoids rebuilding HTML through document.write, which is incompatible with Vite HMR.
const requestedLocale = window.__CGO_LOCALE__ || new URLSearchParams(location.search).get('locale');
const locale = ['zh', 'en', 'ja', 'ko', 'zh-HK', 'zh-TW'].includes(requestedLocale)
  ? requestedLocale
  : 'en';
const sourceHref = window.__CGO_LOCALE_SOURCE__;

if (!sourceHref) {
  throw new Error('CGoUI localized page is missing __CGO_LOCALE_SOURCE__.');
}

const target = new URL(sourceHref, location.href);
target.searchParams.set('locale', locale);
target.hash = location.hash;
location.replace(target.href);
