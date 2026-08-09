import { CORE_TRANSLATIONS } from './catalog-core.js';
import { FOUNDATION_TRANSLATIONS } from './catalog-foundation.js';
import { DEMO_TRANSLATIONS } from './catalog-demos.js';

const locale = window.__CGO_LOCALE__ === 'ja' ? 'ja' : 'en';
const localeIndex = locale === 'ja' ? 2 : 1;
const sourceUrl = new URL(window.__CGO_LOCALE_SOURCE__ || location.href, location.href);
const siteRoot = new URL('../', import.meta.url);
const translatedRoots = new WeakSet();
const switcherId = 'cgo-i18n-language-switcher';
const HAN_RE = /[\u3400-\u9fff]/;

const entries = [...CORE_TRANSLATIONS, ...FOUNDATION_TRANSLATIONS, ...DEMO_TRANSLATIONS]
  .filter((row) => row[0] && row[localeIndex])
  .sort((a, b) => b[0].length - a[0].length);

const translatableAttributes = [
  'title',
  'placeholder',
  'aria-label',
  'alt',
  'label',
  'hint',
  'desc',
  'action',
  'notice-title',
  'content',
  'cat-name',
  'subtitle',
];

const sourceRelativePath = getRelativePath(sourceUrl);
const localizedPagePaths = new Set([
  'index.html',
  'cdn_demo.html',
  'test_no_css.html',
  'examples/metro-demo/index.html',
]);

// Install before CGoUI registers elements when possible, so future open Shadow Roots are
// observed from their first render. Existing roots are discovered by scanRoot() below.
const originalAttachShadow = Element.prototype.attachShadow;
if (!Element.prototype.__cgoI18nAttachShadowPatched) {
  Object.defineProperty(Element.prototype, '__cgoI18nAttachShadowPatched', {
    value: true,
    configurable: true,
  });
  Element.prototype.attachShadow = function patchedAttachShadow(init) {
    const root = originalAttachShadow.call(this, init);
    queueMicrotask(() => observeRoot(root));
    return root;
  };
}

function getRelativePath(url) {
  const rootPath = siteRoot.pathname.endsWith('/') ? siteRoot.pathname : `${siteRoot.pathname}/`;
  if (url.origin === siteRoot.origin && url.pathname.startsWith(rootPath)) {
    return decodeURIComponent(url.pathname.slice(rootPath.length)) || 'index.html';
  }
  return 'index.html';
}

function localizedUrl(targetLocale, relativePath = sourceRelativePath, hash = location.hash) {
  if (targetLocale === 'zh') {
    const url = new URL(relativePath, siteRoot);
    url.hash = hash || '';
    return url.href;
  }
  const url = new URL(`${targetLocale}/${relativePath}`, siteRoot);
  url.hash = hash || '';
  return url.href;
}

function protectCodeLiterals(value) {
  const protectedValues = [];
  let result = value;
  const protect = (pattern) => {
    result = result.replace(pattern, (match) => {
      const token = `__CGO_I18N_PROTECTED_${protectedValues.length}__`;
      protectedValues.push(match);
      return token;
    });
  };

  // These are behavior-bearing aliases. Translate the visible label, but keep the copied
  // attribute value exactly as the component expects it.
  protect(/line=(['"])昌平线\1/g);
  protect(/data-line=(['"])(?:2号线|4号线大兴线|10号线|大兴机场线)\1/g);

  return {
    value: result,
    restore(translated) {
      return protectedValues.reduce(
        (text, item, index) => text.replace(`__CGO_I18N_PROTECTED_${index}__`, item),
        translated,
      );
    },
  };
}

function applyFallbackPatterns(value) {
  let result = value;
  if (locale === 'en') {
    result = result
      .replace(/市郊S(\d+)线/g, 'Suburban Line S$1')
      .replace(/S(\d+)线/g, 'Line S$1')
      .replace(/(\d+)号线/g, 'Line $1')
      .replace(/第(\d+)步/g, 'Step $1')
      .replace(/第(\d+)项/g, 'Item $1');
  } else {
    result = result
      .replace(/市郊S(\d+)线/g, '郊外鉄道S$1線')
      .replace(/S(\d+)线/g, 'S$1線')
      .replace(/(\d+)号线/g, '$1号線')
      .replace(/第(\d+)步/g, 'ステップ$1')
      .replace(/第(\d+)项/g, '項目$1');
  }
  return result;
}

function translateString(input, { code = false } = {}) {
  if (!input || typeof input !== 'string') return input;
  let original = input;
  let protectedCode = null;
  if (code) {
    protectedCode = protectCodeLiterals(original);
    original = protectedCode.value;
  }

  let result = original;
  for (const row of entries) {
    if (result.includes(row[0])) result = result.split(row[0]).join(row[localeIndex]);
  }
  result = applyFallbackPatterns(result);
  if (code && protectedCode) result = protectedCode.restore(result);
  return result;
}

function inCodeContext(node) {
  let parent = node.parentElement;
  if (!parent && node.getRootNode() instanceof ShadowRoot) parent = node.getRootNode().host;
  return Boolean(parent?.closest?.('pre, code'));
}

function translateTextNode(node) {
  if (!node.nodeValue || !HAN_RE.test(node.nodeValue)) return;
  const parent = node.parentElement;
  if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(parent.tagName)) return;
  const next = translateString(node.nodeValue, { code: inCodeContext(node) });
  if (next !== node.nodeValue) node.nodeValue = next;
}

function translateElementAttributes(element) {
  for (const name of translatableAttributes) {
    if (!element.hasAttribute?.(name)) continue;
    const current = element.getAttribute(name);
    if (!current || !HAN_RE.test(current)) continue;
    const next = translateString(current);
    if (next !== current) element.setAttribute(name, next);
  }

  if (element.matches?.('meta[content]')) {
    const current = element.getAttribute('content');
    if (current && HAN_RE.test(current)) element.setAttribute('content', translateString(current));
  }

  rewriteElementLink(element);
}

function rewriteElementLink(element) {
  if (element.hasAttribute?.('data-cgo-i18n-switch')) return;

  if (element.matches?.('a[href]')) {
    const raw = element.getAttribute('href');
    if (!raw || /^(?:mailto:|tel:|javascript:)/i.test(raw)) return;

    if (raw.startsWith('#')) {
      const current = new URL(location.href);
      current.hash = raw;
      element.href = current.href;
      return;
    }

    let resolved;
    try {
      resolved = new URL(raw, document.baseURI);
    } catch {
      return;
    }
    if (resolved.origin !== siteRoot.origin) return;
    const rel = getRelativePath(resolved);
    if (!localizedPagePaths.has(rel)) return;
    element.href = localizedUrl(locale, rel, resolved.hash || '');
  }

  if (element.hasAttribute?.('onclick')) {
    const current = element.getAttribute('onclick');
    if (!current || !current.includes('location.href')) return;
    const target = localizedUrl(locale, 'index.html', '');
    const next = current.replace(
      /location\.href\s*=\s*(['"])\.\/index\.html\1/g,
      `location.href=${JSON.stringify(target)}`,
    );
    if (next !== current) element.setAttribute('onclick', next);
  }
}

function scanRoot(root) {
  if (!root) return;

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root);
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) translateElementAttributes(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
    else if (node.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(node);
      if (node.shadowRoot) observeRoot(node.shadowRoot);
    }
    node = walker.nextNode();
  }

  if (root instanceof ShadowRoot) {
    for (const element of root.querySelectorAll('*')) {
      if (element.shadowRoot) observeRoot(element.shadowRoot);
    }
  }
}

function observeRoot(root) {
  if (!root || translatedRoots.has(root)) return;
  translatedRoots.add(root);
  scanRoot(root);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        translateTextNode(mutation.target);
        continue;
      }
      if (mutation.type === 'attributes') {
        translateElementAttributes(mutation.target);
        continue;
      }
      for (const added of mutation.addedNodes) scanRoot(added);
    }
    installLanguageSwitcher();
  });

  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...translatableAttributes, 'href', 'onclick'],
  });
}

function addAlternateLinks() {
  if (!document.head || document.head.querySelector('link[data-cgo-i18n-alternate]')) return;
  const alternates = [
    ['zh-CN', localizedUrl('zh', sourceRelativePath, '')],
    ['en', localizedUrl('en', sourceRelativePath, '')],
    ['ja', localizedUrl('ja', sourceRelativePath, '')],
  ];
  for (const [lang, href] of alternates) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = href;
    link.dataset.cgoI18nAlternate = '';
    document.head.append(link);
  }
}

function languageLink(targetLocale, label) {
  const anchor = document.createElement('a');
  anchor.href = localizedUrl(targetLocale);
  anchor.textContent = label;
  anchor.dataset.cgoI18nSwitch = targetLocale;
  anchor.setAttribute('aria-label', targetLocale === 'zh' ? '中文' : targetLocale === 'en' ? 'English' : '日本語');
  Object.assign(anchor.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '28px',
    padding: '3px 8px',
    borderRadius: '999px',
    border: '1px solid var(--border-color, #d9e0e5)',
    background: targetLocale === locale ? 'var(--primary-color, #00263b)' : 'var(--card-bg, #fff)',
    color: targetLocale === locale ? '#fff' : 'var(--text-main, #00263b)',
    textDecoration: 'none',
    font: '600 11px/1.2 system-ui, sans-serif',
    whiteSpace: 'nowrap',
  });
  return anchor;
}

function installLanguageSwitcher() {
  if (document.getElementById(switcherId)) return;
  if (!document.body) return;

  const wrapper = document.createElement('nav');
  wrapper.id = switcherId;
  wrapper.setAttribute('aria-label', locale === 'ja' ? '言語を選択' : 'Language');
  wrapper.dataset.cgoI18nSwitch = 'container';
  Object.assign(wrapper.style, {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    zIndex: '1500',
  });
  wrapper.append(
    languageLink('zh', '中文'),
    languageLink('en', 'EN'),
    languageLink('ja', '日本語'),
  );

  const docsHeader = document.querySelector('.header-right');
  if (docsHeader) {
    docsHeader.insertBefore(wrapper, docsHeader.firstChild);
    return;
  }

  const demoHeader = document.querySelector('.header-bar, .demo-header');
  if (demoHeader) {
    demoHeader.append(wrapper);
    return;
  }

  Object.assign(wrapper.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    padding: '5px',
    borderRadius: '999px',
    background: 'color-mix(in srgb, var(--card-bg, #fff) 92%, transparent)',
    boxShadow: '0 4px 18px rgba(0,0,0,.12)',
    backdropFilter: 'blur(10px)',
  });
  document.body.append(wrapper);
}

function refreshDocumentMetadata() {
  document.documentElement.lang = locale === 'ja' ? 'ja' : 'en';
  if (HAN_RE.test(document.title)) document.title = translateString(document.title);
  for (const meta of document.querySelectorAll('meta[content]')) translateElementAttributes(meta);
  addAlternateLinks();
}

function reportUntranslatedEnglish() {
  if (locale !== 'en') return;
  const candidates = new Set();
  const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (HAN_RE.test(node.nodeValue || '') && !parent?.closest?.('script, style, noscript, template')) {
      const text = node.nodeValue.trim().replace(/\s+/g, ' ');
      if (text) candidates.add(text.slice(0, 220));
    }
    node = walker.nextNode();
  }
  if (candidates.size) {
    console.info('[CGoUI i18n] Remaining Chinese text candidates:', [...candidates].slice(0, 60));
  }
}

refreshDocumentMetadata();
observeRoot(document.documentElement);
installLanguageSwitcher();

window.addEventListener('hashchange', () => {
  queueMicrotask(() => {
    scanRoot(document.documentElement);
    installLanguageSwitcher();
  });
});

window.addEventListener('load', () => {
  refreshDocumentMetadata();
  scanRoot(document.documentElement);
  installLanguageSwitcher();
  setTimeout(reportUntranslatedEnglish, 300);
});

// Useful for maintainers when a new Chinese string is added to the canonical docs.
window.CGO_I18N = Object.freeze({
  locale,
  translate: translateString,
  source: sourceUrl.href,
  switchTo(targetLocale) {
    location.href = localizedUrl(targetLocale === 'ja' ? 'ja' : targetLocale === 'en' ? 'en' : 'zh');
  },
});
