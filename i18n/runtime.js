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
const sourceUrl = new URL(window.__CGO_LOCALE_SOURCE__ || location.href, location.href);
const siteRoot = new URL(window.__CGO_I18N_SITE_ROOT__ || './', sourceUrl);
const translatedRoots = new WeakSet();
const translatedTextNodes = new WeakMap();
const translatedAttributes = new WeakMap();
const pendingRoots = new Set();
const switcherId = 'cgo-i18n-language-switcher';
const HAN_RE = /[\u3400-\u9fff]/;

const entriesByInitial = new Map();
let directTranslationSources = new Set();
let dictLoaded = locale === 'zh';

// 必须在任何 await 之前同步劫持 attachShadow，确保字典加载期间注册的 ShadowRoot 也能被捕获并在就绪后翻译。
if (locale !== 'zh' && !Element.prototype.__cgoI18nAttachShadowPatched) {
  const originalAttachShadow = Element.prototype.attachShadow;
  Object.defineProperty(Element.prototype, '__cgoI18nAttachShadowPatched', {
    value: true,
    configurable: true,
  });
  Element.prototype.attachShadow = function patchedAttachShadow(init) {
    const root = originalAttachShadow.call(this, init);
    queueMicrotask(() => {
      if (dictLoaded) observeRoot(root);
      else pendingRoots.add(root);
    });
    return root;
  };
}

async function loadDictionary(targetLocale) {
  if (targetLocale === 'zh') return;
  try {
    const dictUrl = new URL(`./locales/${encodeURIComponent(targetLocale)}.json`, import.meta.url);
    const res = await fetch(dictUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dict = await res.json();
    const sorted = Object.entries(dict)
      .filter(([src, dst]) => src && typeof dst === 'string')
      .sort((a, b) => b[0].length - a[0].length);

    for (const row of sorted) {
      const initial = row[0][0];
      const bucket = entriesByInitial.get(initial) || [];
      bucket.push(row);
      entriesByInitial.set(initial, bucket);
    }

    directTranslationSources = new Set(
      sorted
        .filter(([src]) => !HAN_RE.test(src))
        .map(([src]) => src),
    );
  } catch (err) {
    console.warn(`[CGoUI i18n] Failed to load locale dictionary (${targetLocale}):`, err);
  } finally {
    dictLoaded = true;
  }
}

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
  if (!input || typeof input !== 'string' || locale === 'zh') return input;
  let original = input;
  let protectedCode = null;
  if (code) {
    protectedCode = protectCodeLiterals(original);
    original = protectedCode.value;
  }

  const parts = [];
  let cursor = 0;
  while (cursor < original.length) {
    const candidates = entriesByInitial.get(original[cursor]) || [];
    const match = candidates.find((row) => original.startsWith(row[0], cursor));
    if (match) {
      parts.push(match[1]);
      cursor += match[0].length;
    } else {
      parts.push(original[cursor]);
      cursor += 1;
    }
  }
  let result = parts.join('');
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
  if (locale === 'zh') return;
  const current = node.nodeValue;
  if (!current || (!HAN_RE.test(current) && !directTranslationSources.has(current.trim()))) return;
  if (translatedTextNodes.get(node) === current) return;
  const parent = node.parentElement;
  if (parent && (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(parent.tagName) || parent.closest?.('[data-cgo-i18n-switch]'))) return;
  const code = inCodeContext(node);
  const next = translateString(current, { code });
  translatedTextNodes.set(node, next);
  if (next !== current) node.nodeValue = next;
}

function translateAttribute(element, name) {
  if (locale === 'zh') return;
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

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateElementAttributes(root);
    if (root.shadowRoot) observeRoot(root.shadowRoot);
  }

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
}

function observeRoot(root) {
  if (locale === 'zh' || !root || translatedRoots.has(root)) return;
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
  const existingSelect = document.getElementById('cgo-i18n-language-select');
  if (existingSelect) {
    if (existingSelect.__cgoI18nBound && existingSelect.value === locale) return;
    if (existingSelect.value !== locale) {
      existingSelect.value = locale;
    }
    if (!existingSelect.__cgoI18nBound) {
      existingSelect.__cgoI18nBound = true;
      const onChange = (e) => {
        const next = e.detail?.value || existingSelect.value;
        if (next && next !== locale) {
          location.href = localizedUrl(next);
        }
      };
      existingSelect.addEventListener('cgo-change', onChange);
      existingSelect.addEventListener('change', onChange);
    }
    return;
  }

  if (document.getElementById(switcherId) || !document.body) return;

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

  const select = document.createElement('cgo-toolbar-select');
  select.id = 'cgo-i18n-language-select';
  select.dataset.cgoI18nSwitch = 'select';
  select.setAttribute('aria-label', LANGUAGE_SWITCHER_LABELS[locale]);
  select.title = LANGUAGE_SWITCHER_LABELS[locale];
  select.value = locale;
  select.style.width = '140px';
  for (const targetLocale of SUPPORTED_LOCALES) {
    const option = document.createElement('cgo-toolbar-option');
    option.setAttribute('value', targetLocale);
    option.textContent = LANGUAGE_LABELS[targetLocale];
    select.append(option);
  }
  select.__cgoI18nBound = true;
  const onChange = (e) => {
    const next = e.detail?.value || select.value;
    if (next && next !== locale) {
      location.href = localizedUrl(next);
    }
  };
  select.addEventListener('cgo-change', onChange);
  select.addEventListener('change', onChange);
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
  if (locale !== 'zh' && HAN_RE.test(document.title)) {
    document.title = translateString(document.title);
  }
  if (locale !== 'zh') {
    for (const meta of document.querySelectorAll('meta[content]')) {
      translateElementAttributes(meta);
    }
  }
  addAlternateLinks();
}

function reportUntranslatedEnglish() {
  if (locale !== 'en' || new URLSearchParams(location.search).get('i18n_debug') !== '1') return;
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

if (locale !== 'zh') {
  await loadDictionary(locale);
  refreshDocumentMetadata();
  observeRoot(document.documentElement);
  for (const root of pendingRoots) observeRoot(root);
  pendingRoots.clear();
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
} else {
  addAlternateLinks();
  installLanguageSwitcher();
  window.addEventListener('load', installLanguageSwitcher);
}

window.CGO_I18N = Object.freeze({
  locale,
  translate: translateString,
  source: sourceUrl.href,
  switchTo(targetLocale) {
    location.href = localizedUrl(normalizeLocale(targetLocale));
  },
});
