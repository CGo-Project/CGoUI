import { EXPANDED_TRANSLATIONS } from './catalog-expanded.js';
import { EXTRA_TRANSLATIONS } from './catalog-extra.js';
import { GAP_TRANSLATIONS } from './catalog-gap.js';

const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'ko', 'zh-HK', 'zh-TW'];
const LOCALE_ALIASES = {
  'zh-cn': 'zh',
  'zh-hans': 'zh',
  'zh-hk': 'zh-HK',
  'zh-hant-hk': 'zh-HK',
  'zh-tw': 'zh-TW',
  'zh-hant-tw': 'zh-TW',
};

function normalizeLocale(value) {
  const raw = String(value || '').trim();
  if (SUPPORTED_LOCALES.includes(raw)) return raw;
  const normalized = raw.toLowerCase();
  if (LOCALE_ALIASES[normalized]) return LOCALE_ALIASES[normalized];
  if (normalized === 'en-us' || normalized === 'en-gb') return 'en';
  if (normalized === 'ja-jp') return 'ja';
  if (normalized === 'ko-kr') return 'ko';
  return 'zh';
}

const requestedLocale = window.__CGO_LOCALE__ || new URLSearchParams(location.search).get('locale');
const locale = normalizeLocale(requestedLocale);
const localeIndex = SUPPORTED_LOCALES.indexOf(locale);
const sourceUrl = new URL(window.__CGO_LOCALE_SOURCE__ || location.href, location.href);
const siteRoot = new URL(window.__CGO_I18N_SITE_ROOT__ || './', sourceUrl);
const translatedRoots = new WeakSet();
const translatedTextNodes = new WeakMap();
const translatedAttributes = new WeakMap();
const switcherId = 'cgo-i18n-language-switcher';
const HAN_RE = /[\u3400-\u9fff]/;

// Keep targeted runtime overrides first: the generated catalogue may contain an older
// partial translation for the same source string (for example, a group title with an
// English suffix), while component-emitted strings live only in the supplemental list.
// The gap catalogue is deliberately loaded here so newly audited code examples are
// available on a cold page load as well as after a Vite hot update.
const entries = [...EXTRA_TRANSLATIONS, ...GAP_TRANSLATIONS, ...EXPANDED_TRANSLATIONS]
  .filter((row) => row[0] && row[localeIndex] !== undefined)
  .sort((a, b) => b[0].length - a[0].length);
const directTranslationSources = new Set(
  EXTRA_TRANSLATIONS
    .filter((row) => row[0] && !HAN_RE.test(row[0]))
    .map((row) => row[0]),
);

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
  const normalizedLocale = normalizeLocale(targetLocale);
  const url = new URL(relativePath, siteRoot);
  if (normalizedLocale === 'zh') url.searchParams.delete('locale');
  else url.searchParams.set('locale', normalizedLocale);
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
  if (locale === 'zh') return result;
  if (locale === 'en') {
    result = result
      .replace(/市郊S(\d+)线/g, 'Suburban Line S$1')
      .replace(/S(\d+)线/g, 'Line S$1')
      .replace(/(\d+)号线/g, 'Line $1')
      .replace(/第(\d+)步/g, 'Step $1')
      .replace(/第(\d+)项/g, 'Item $1');
  } else if (locale === 'ja') {
    result = result
      .replace(/市郊S(\d+)线/g, '郊外鉄道S$1線')
      .replace(/S(\d+)线/g, 'S$1線')
      .replace(/(\d+)号线/g, '$1号線')
      .replace(/第(\d+)步/g, 'ステップ$1')
      .replace(/第(\d+)项/g, '項目$1');
  } else if (locale === 'ko') {
    result = result
      .replace(/市郊S(\d+)线/g, '교외 S$1호선')
      .replace(/S(\d+)线/g, 'S$1호선')
      .replace(/(\d+)号线/g, '$1호선')
      .replace(/第(\d+)步/g, '$1단계')
      .replace(/第(\d+)项/g, '$1번 항목');
  } else if (locale === 'zh-HK') {
    result = result
      .replace(/市郊S(\d+)线/g, '市郊S$1線')
      .replace(/S(\d+)线/g, 'S$1線')
      .replace(/(\d+)号线/g, '$1號線')
      .replace(/第(\d+)步/g, '第$1步')
      .replace(/第(\d+)项/g, '第$1項');
  } else {
    result = result
      .replace(/市郊S(\d+)线/g, '市郊S$1線')
      .replace(/S(\d+)线/g, 'S$1線')
      .replace(/(\d+)号线/g, '$1號線')
      .replace(/第(\d+)步/g, '第$1步')
      .replace(/第(\d+)项/g, '第$1項');
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
  const current = node.nodeValue;
  if (!current || (!HAN_RE.test(current) && !directTranslationSources.has(current.trim()))) return;
  const seen = translatedTextNodes.get(node);
  const parent = node.parentElement;
  if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(parent.tagName)) return;
  const code = inCodeContext(node);
  const next = translateString(current, { code });
  // A node can be observed once before a dynamic route finishes inserting its
  // translation catalogue. Retry a cached no-op when the current text still
  // contains a known source fragment; translated Japanese/HK/TW text remains
  // stable because the second pass returns the same string.
  if (seen === current && next === current) return;
  translatedTextNodes.set(node, next);
  if (next !== current) node.nodeValue = next;
}

function translateAttribute(element, name) {
  if (!element.hasAttribute?.(name)) return;
  const current = element.getAttribute(name);
  if (!current || (!HAN_RE.test(current) && !directTranslationSources.has(current.trim()))) return;
  let seen = translatedAttributes.get(element);
  if (!seen) {
    seen = new Map();
    translatedAttributes.set(element, seen);
  }
  if (seen.get(name) === current) return;
  const next = translateString(current);
  seen.set(name, next);
  if (next !== current) element.setAttribute(name, next);
}

function translateElementAttributes(element) {
  for (const name of translatableAttributes) {
    translateAttribute(element, name);
  }

  if (element.matches?.('meta[content]')) {
    translateAttribute(element, 'content');
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
      if (element.href !== current.href) element.href = current.href;
      return;
    }

    let resolved;
    try {
      resolved = new URL(raw, sourceUrl);
    } catch {
      return;
    }
    if (resolved.origin !== siteRoot.origin) return;
    const rel = getRelativePath(resolved);
    if (!localizedPagePaths.has(rel)) return;
    const target = localizedUrl(locale, rel, resolved.hash || '');
    if (element.href !== target) element.href = target;
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
    ['ko', localizedUrl('ko', sourceRelativePath, '')],
    ['zh-HK', localizedUrl('zh-HK', sourceRelativePath, '')],
    ['zh-TW', localizedUrl('zh-TW', sourceRelativePath, '')],
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

const LANGUAGE_LABELS = {
  zh: '简体中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  'zh-HK': '繁體中文（香港）',
  'zh-TW': '繁體中文（台灣）',
};

const LANGUAGE_SWITCHER_LABELS = {
  zh: '选择语言',
  en: 'Select language',
  ja: '言語を選択',
  ko: '언어 선택',
  'zh-HK': '選擇語言',
  'zh-TW': '選擇語言',
};

function installLanguageSwitcher() {
  if (document.getElementById(switcherId)) return;
  if (!document.body) return;

  const wrapper = document.createElement('nav');
  wrapper.id = switcherId;
  wrapper.setAttribute('aria-label', LANGUAGE_SWITCHER_LABELS[locale]);
  wrapper.dataset.cgoI18nSwitch = 'container';
  Object.assign(wrapper.style, {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    zIndex: '1500',
  });

  const select = document.createElement('select');
  select.id = 'cgo-i18n-language-select';
  select.dataset.cgoI18nSwitch = 'select';
  select.setAttribute('aria-label', LANGUAGE_SWITCHER_LABELS[locale]);
  select.title = LANGUAGE_SWITCHER_LABELS[locale];
  select.value = locale;
  for (const targetLocale of SUPPORTED_LOCALES) {
    const option = document.createElement('option');
    option.value = targetLocale;
    option.textContent = LANGUAGE_LABELS[targetLocale];
    option.selected = targetLocale === locale;
    select.append(option);
  }
  Object.assign(select.style, {
    minHeight: '30px',
    maxWidth: '180px',
    padding: '3px 26px 3px 9px',
    borderRadius: '7px',
    border: '1px solid var(--border-color, #d9e0e5)',
    background: 'var(--card-bg, #fff)',
    color: 'var(--text-main, #00263b)',
    font: '600 12px/1.2 system-ui, sans-serif',
    cursor: 'pointer',
  });
  select.addEventListener('change', () => {
    location.href = localizedUrl(select.value);
  });
  wrapper.append(select);

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
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
  if (HAN_RE.test(document.title)) document.title = translateString(document.title);
  for (const meta of document.querySelectorAll('meta[content]')) translateElementAttributes(meta);
  addAlternateLinks();
}

function reportUntranslatedEnglish() {
  if (locale === 'zh') return;
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
    location.href = localizedUrl(normalizeLocale(targetLocale));
  },
});
