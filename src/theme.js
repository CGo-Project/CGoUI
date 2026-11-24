import clrCssText from '../styles/cgo_clr.css?inline';

/*!
 * CGo UI — 主题引擎（明暗切换 + iframe 同步）
 *   - data-theme 属性应用到 <html>
 *   - 顶层窗口向同源/白名单 iframe 广播主题；子窗口监听 message 同步
 *   - localStorage 按工具前缀隔离；宿主可通过配置处理嵌入式页面
 *   - 系统主题变化在未手动设置时跟随
 */

const VALID_APPS = ['vitool', 'wall', 'stasign', 'staline', 'project', 'cgoauth', 'mc', 'enmap', 'guide', 'timetable'];

function safeGetStorage(key) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSetStorage(key, value) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(key, value);
    } catch {}
}

function safeRemoveStorage(key) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.removeItem(key);
    } catch {}
}

function prefersDark() {
    try {
        return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : false;
    } catch {
        return false;
    }
}

function _autoPageKey(suffix) {
    let prefix = '';
    try {
        if (typeof window !== 'undefined' && window.location && window.location.pathname) {
            const path = window.location.pathname;
            const normalized = path
                .replace(/\.html$/, '')
                .replace(/\/index$/, '')
                .replace(/^\//, '')
                .replace(/\/$/, '');
            prefix = normalized ? normalized.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' : 'root_';
        }
    } catch {}
    return prefix + suffix;
}

export function autoStorageKey() {
    let prefix = '';
    try {
        if (typeof window !== 'undefined' && window.location && window.location.pathname) {
            const path = window.location.pathname;
            const filename = path.split('/').pop().replace('.html', '');
            if (
                (filename === 'index' || filename === 'real') &&
                (path.includes('/scmap') || path.includes('/scmap_original') || path.includes('/scmap_test'))
            ) {
                return 'scmap_app-theme';
            }
            if (VALID_APPS.includes(filename)) prefix = filename + '_';
        }
    } catch {}
    return prefix + 'app-theme';
}

export function autoThemeColorStorageKey() {
    return _autoPageKey('cgo_theme_color_config');
}

export function autoHeaderModeStorageKey() {
    return _autoPageKey('cgo_header_mode');
}

// 跨独立 bundle 共享单一可变主题状态（避免 cgo-ui / cgo-ui-react / theme 各自持有一份孤立状态）
const _state = (() => {
    const g = typeof globalThis !== 'undefined' ? globalThis : {};
    if (!g.__CGO_THEME_STATE__) {
        g.__CGO_THEME_STATE__ = {
            storageKey: autoStorageKey(),
            themeColorStorageKey: autoThemeColorStorageKey(),
            headerModeStorageKey: autoHeaderModeStorageKey(),
            currentThemeColorConfig: null,
            inited: false,
            glassFilterScheduled: false,
            messageBound: false,
        };
    }
    return g.__CGO_THEME_STATE__;
})();

export function setStorageKey(key) {
    if (key) _state.storageKey = key;
}
export function getStorageKey() {
    return _state.storageKey;
}

export function applyTheme(theme) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return 'light';
    const normalized = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', normalized);
    document.querySelectorAll('cgo-theme-toggle').forEach((el) => el._sync && el._sync(normalized));
    updateLegacyIcon(normalized);
    window.dispatchEvent(new CustomEvent('cgo-theme-change', { detail: { theme: normalized } }));
    if (window.self === window.top) {
        const targetOrigin =
            window.location.origin && window.location.origin !== 'null' ? window.location.origin : '*';
        document.querySelectorAll('iframe').forEach((iframe) => {
            try {
                iframe.contentWindow &&
                    iframe.contentWindow.postMessage({ type: 'theme-change', theme: normalized }, targetOrigin);
            } catch {}
        });
    }
    return normalized;
}

export function currentTheme() {
    if (typeof document === 'undefined') return 'light';
    const attr = document.documentElement.getAttribute('data-theme');
    return attr === 'dark' ? 'dark' : 'light';
}

export function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    safeSetStorage(_state.storageKey, next);
    applyTheme(next);
    return next;
}

export function resetToSystem() {
    safeRemoveStorage(_state.storageKey);
    const sys = prefersDark() ? 'dark' : 'light';
    applyTheme(sys);
    return sys;
}

function checkEmbedMode() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    let hide = false;
    const config = window.CGoUIConfig ? window.CGoUIConfig : {};
    try {
        const embed = config.embed || {};
        if (embed.hideHeader === true) hide = true;
        if (
            embed.queryParam &&
            embed.queryValue &&
            new URLSearchParams(window.location.search).get(embed.queryParam) === embed.queryValue
        ) {
            hide = true;
        }
    } catch {}
    try {
        if (typeof config.shouldHideHeader === 'function' && config.shouldHideHeader({ window })) hide = true;
    } catch {}
    if (hide && !document.getElementById('cgo-embed-hide-style')) {
        const style = document.createElement('style');
        style.id = 'cgo-embed-hide-style';
        style.textContent = '.tool-header, .bottom-bar, .status-bar { display: none !important; }';
        document.head.appendChild(style);
        document.documentElement.classList.add('is-iframe-vitool-hidden');
    }
}

function isAllowedOrigin(origin) {
    if (typeof window === 'undefined') return false;
    if (origin === window.location.origin) return true;
    const allowed = window.CGoUIConfig?.allowedOrigins;
    return Array.isArray(allowed) && allowed.includes(origin);
}

function initMessageListener() {
    if (typeof window === 'undefined' || _state.messageBound) return;
    _state.messageBound = true;
    window.addEventListener('message', (e) => {
        if (!isAllowedOrigin(e.origin) || !e.data || typeof e.data !== 'object') return;
        if (e.data.type === 'theme-change' && (e.data.theme === 'light' || e.data.theme === 'dark')) {
            applyTheme(e.data.theme);
        } else if (e.data.type === 'theme-request' && e.source && typeof e.source.postMessage === 'function') {
            try {
                const replyOrigin = e.origin && e.origin !== 'null' ? e.origin : '*';
                e.source.postMessage({ type: 'theme-change', theme: currentTheme() }, replyOrigin);
            } catch {}
        }
    });
    if (window.self !== window.top) {
        try {
            const parentTheme = window.parent.document.documentElement.getAttribute('data-theme');
            if (parentTheme === 'light' || parentTheme === 'dark') {
                setTimeout(() => applyTheme(parentTheme), 50);
            }
        } catch {
            try {
                const targetOrigin =
                    window.location.origin && window.location.origin !== 'null' ? window.location.origin : '*';
                window.parent.postMessage({ type: 'theme-request' }, targetOrigin);
            } catch {}
        }
    }
}

const ICON_SUN =
    '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
const ICON_MOON =
    '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';

function updateLegacyIcon(theme) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    const svg = btn.querySelector('.btn-icon');
    if (svg) svg.innerHTML = theme === 'dark' ? ICON_MOON : ICON_SUN;
}

export function bindLegacyThemeButton() {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn || btn._cgoThemeBound) return;
    btn._cgoThemeBound = true;
    updateLegacyIcon(currentTheme());
    let pressTimer = null,
        isLongPress = false;
    btn.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isLongPress = false;
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
            isLongPress = true;
            resetToSystem();
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
        }, 800);
    });
    const cancel = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };
    btn.addEventListener('pointerup', cancel);
    btn.addEventListener('pointerleave', cancel);
    btn.addEventListener('pointercancel', cancel);
    btn.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    btn.addEventListener('click', (e) => {
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            isLongPress = false;
            return;
        }
        toggleTheme();
    });
}

export function setThemeColorStorageKey(key) {
    if (key) _state.themeColorStorageKey = key;
}

export function getThemeColorStorageKey() {
    return _state.themeColorStorageKey;
}

/* ───────── 色彩工具函数 (Hex / RGB / HSL 转换与衍生计算) ───────── */
export function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let c = hex.trim().replace(/^#/, '');
    if (c.length === 3) c = c.split('').map((char) => char + char).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
    const num = parseInt(c, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0,
        s = 0,
        l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h, s, l) {
    if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) return '#000000';
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
        g = 0,
        b = 0;
    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    const toHex = (n) =>
        Math.round((n + m) * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const SAFE_CSS_COLOR_RE =
    /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgb|hsl)a?\(\s*[0-9.%\s,/+-]+\))$/;

function isSafeCssColor(value) {
    return typeof value === 'string' && SAFE_CSS_COLOR_RE.test(value.trim());
}

function sanitizeOverrides(overrides) {
    if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return {};
    const clean = {};
    for (const [k, v] of Object.entries(overrides)) {
        if (isSafeCssColor(v)) clean[k] = v.trim();
    }
    return clean;
}

export function generateThemePalette(baseColor) {
    if (!baseColor || typeof baseColor !== 'string') return null;
    const rgb = hexToRgb(baseColor);
    if (!rgb) return null;
    const [h, s, l] = rgbToHsl(...rgb);

    if (baseColor.trim().replace(/^#/, '').toLowerCase() === '00263b') {
        return {
            primary: '#00263b',
            primaryHover: '#004060',
            darkPrimary: '#006098',
            darkPrimaryHover: '#0070b0',
            textMain: '#00263b',
            darkTextMain: '#e5e8ea',
            textLight: '#636f75',
            darkTextLight: '#a0b0b9',
        };
    }

    let pL;
    if (l > 48) {
        pL = Math.max(30, Math.min(38, Math.round(l * 0.62)));
    } else {
        pL = Math.min(48, Math.max(32, l));
    }
    const pS = Math.min(98, Math.max(60, s));
    const primary = hslToHex(h, pS, pL);

    const pHoverL = Math.max(24, pL - 7);
    const primaryHover = hslToHex(h, pS, pHoverL);

    const dPL = Math.min(62, Math.max(45, l > 48 ? l * 0.8 : pL + 12));
    const dPS = Math.min(98, Math.max(65, s));
    const darkPrimary = hslToHex(h, dPS, dPL);

    const dPHoverL = Math.min(72, dPL + 8);
    const darkPrimaryHover = hslToHex(h, dPS, dPHoverL);

    const tmS = Math.min(100, Math.max(50, s));
    const textMain = hslToHex(h, tmS, 11);

    const dtmS = Math.min(22, Math.max(8, Math.round(s * 0.2)));
    const darkTextMain = hslToHex(h, dtmS, 91);

    const tlS = Math.min(30, Math.max(12, Math.round(s * 0.3)));
    const textLight = hslToHex(h, tlS, 42);

    const dtlS = Math.min(25, Math.max(10, Math.round(s * 0.25)));
    const darkTextLight = hslToHex(h, dtlS, 72);

    return {
        primary,
        primaryHover,
        darkPrimary,
        darkPrimaryHover,
        textMain,
        darkTextMain,
        textLight,
        darkTextLight,
    };
}

export function setThemeColor(baseColor, overrides = {}) {
    if (!baseColor) {
        resetThemeColor();
        return null;
    }

    const generated = generateThemePalette(baseColor);
    if (!generated) {
        console.warn('[CGoUI Theme] Invalid base color provided:', baseColor);
        return null;
    }

    const safeOverrides = sanitizeOverrides(overrides);
    const palette = {
        ...generated,
        ...safeOverrides,
    };

    _state.currentThemeColorConfig = {
        baseColor: baseColor.trim(),
        overrides: safeOverrides,
        palette,
    };

    safeSetStorage(_state.themeColorStorageKey, JSON.stringify(_state.currentThemeColorConfig));
    applyThemeColorCSS(palette);
    return palette;
}

export function resetThemeColor() {
    _state.currentThemeColorConfig = null;
    safeRemoveStorage(_state.themeColorStorageKey);
    if (typeof document === 'undefined') return;
    const el = document.getElementById('cgo-theme-color-style');
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

export function getThemeColor() {
    return _state.currentThemeColorConfig;
}

function applyThemeColorCSS(palette) {
    if (typeof document === 'undefined' || !palette) return;
    const p = isSafeCssColor(palette.primary) ? palette.primary : '#00263b';
    const ph = isSafeCssColor(palette.primaryHover) ? palette.primaryHover : '#004060';
    const tm = isSafeCssColor(palette.textMain) ? palette.textMain : '#00263b';
    const tl = isSafeCssColor(palette.textLight) ? palette.textLight : '#636f75';
    const dp = isSafeCssColor(palette.darkPrimary) ? palette.darkPrimary : '#006098';
    const dph = isSafeCssColor(palette.darkPrimaryHover) ? palette.darkPrimaryHover : '#0070b0';
    const dtm = isSafeCssColor(palette.darkTextMain) ? palette.darkTextMain : tm;
    const dtl = isSafeCssColor(palette.darkTextLight) ? palette.darkTextLight : '#a0b0b9';

    let el = document.getElementById('cgo-theme-color-style');
    if (!el) {
        el = document.createElement('style');
        el.id = 'cgo-theme-color-style';
        document.head.appendChild(el);
    }

    el.textContent = `
:root {
  --primary-color: ${p};
  --primary-hover: ${ph};
  --text-main: ${tm};
  --text-light: ${tl};
  --text-color: var(--text-main);
  --table-head-text: ${tm};
}
[data-theme='dark'] {
  --primary-color: ${dp};
  --primary-hover: ${dph};
  --text-main: ${dtm};
  --text-light: ${dtl};
  --table-head-text: ${dtm};
}
`;
}

export function injectLiquidGlassFilter() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('glass-distortion') || document.getElementById('cgo-glass-svg')) {
        if (!document.documentElement.style.getPropertyValue('--glass-refraction-filter')) {
            document.documentElement.style.setProperty('--glass-refraction-filter', 'url(#glass-distortion)');
        }
        return;
    }
    if (_state.glassFilterScheduled) return;
    _state.glassFilterScheduled = true;

    const attach = () => {
        if (!document.getElementById('glass-distortion') && !document.getElementById('cgo-glass-svg')) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = 'cgo-glass-svg';
            svg.setAttribute('style', 'position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none;');
            svg.setAttribute('aria-hidden', 'true');
            svg.innerHTML = `
                <defs>
                    <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
                        <feComponentTransfer in="turbulence" result="mapped">
                            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
                            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
                            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
                        </feComponentTransfer>
                        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
                        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lighting-color="white" result="specLight">
                            <fePointLight x="-200" y="-200" z="300" />
                        </feSpecularLighting>
                        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
                        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="20" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            `;
            (document.body || document.documentElement).appendChild(svg);
        }
        if (!document.documentElement.style.getPropertyValue('--glass-refraction-filter')) {
            document.documentElement.style.setProperty('--glass-refraction-filter', 'url(#glass-distortion)');
        }
    };
    if (document.body) {
        attach();
    } else {
        document.addEventListener('DOMContentLoaded', attach, { once: true });
    }
}

export function setGlassMode(mode) {
    if (typeof document === 'undefined') return;
    if (mode === 'flat' || mode === 'none') {
        document.documentElement.setAttribute('glass-mode', 'flat');
    } else if (mode === 'blur') {
        document.documentElement.setAttribute('glass-mode', 'blur');
    } else if (mode === 'liquid' || !mode) {
        document.documentElement.setAttribute('glass-mode', 'liquid');
    }
}

export function getGlassMode() {
    if (typeof document === 'undefined') return 'liquid';
    return (
        document.documentElement.getAttribute('glass-mode') ||
        getComputedStyle(document.documentElement).getPropertyValue('--cgo-glass-default')?.trim() ||
        'liquid'
    );
}

export function setDefaultGlassMode(mode) {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--cgo-glass-default', mode);
}

/* ───────── 顶栏模式（吸顶 Classic vs 悬浮 Floating） ───────── */

export function setHeaderModeStorageKey(key) {
    if (key) _state.headerModeStorageKey = key;
}

export function getHeaderModeStorageKey() {
    return _state.headerModeStorageKey;
}

export function setHeaderMode(mode) {
    if (typeof document === 'undefined') return 'floating';
    const normalized = mode === 'classic' ? 'classic' : 'floating';
    document.documentElement.setAttribute('header-mode', normalized);
    safeSetStorage(_state.headerModeStorageKey, normalized);
    if (normalized === 'floating') {
        autoUpgradeHeader(document);
    }
    document.querySelectorAll('cgo-header-toggle').forEach((el) => el._sync && el._sync(normalized));
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cgo-header-mode-change', { detail: { mode: normalized } }));
    }
    return normalized;
}

export function getHeaderMode() {
    if (typeof document === 'undefined') return 'floating';
    return (
        document.documentElement.getAttribute('header-mode') ||
        getComputedStyle(document.documentElement).getPropertyValue('--cgo-header-default')?.trim() ||
        'floating'
    );
}

export function toggleHeaderMode() {
    const next = getHeaderMode() === 'classic' ? 'floating' : 'classic';
    setHeaderMode(next);
    return next;
}

export function setDefaultHeaderMode(mode) {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--cgo-header-default', mode);
}

function ensureMobileStatusBarFill() {
    try {
        if (typeof document !== 'undefined' && document.body && !document.querySelector('.mobile-status-bar-fill')) {
            const fill = document.createElement('div');
            fill.className = 'mobile-status-bar-fill';
            fill.setAttribute('aria-hidden', 'true');
            document.body.prepend(fill);
        }
    } catch {}
}

export function autoUpgradeHeader(root = typeof document !== 'undefined' ? document : null) {
    if (!root || typeof document === 'undefined') return;

    if (root === document) {
        ensureMobileStatusBarFill();
    }

    const headers = [];
    if (root.matches && root.matches('.tool-header')) {
        headers.push(root);
    }
    if (root.querySelectorAll) {
        root.querySelectorAll('.tool-header').forEach((el) => headers.push(el));
    }

    headers.forEach((header) => {
        if (!header || header.dataset.cgoHeaderUpgraded === 'true') return;
        if (
            header.getAttribute('header-mode') === 'classic' ||
            header.classList.contains('classic-header') ||
            document.documentElement.getAttribute('header-mode') === 'classic'
        ) {
            return;
        }
        if (header.querySelector('.header-island')) return;

        const left = header.querySelector(':scope > .header-left') || header.querySelector('.header-left');
        const center = header.querySelector(':scope > .header-center') || header.querySelector('.header-center');
        const right = header.querySelector(':scope > .header-right') || header.querySelector('.header-right');

        if (!left && !center && !right) return;

        const isGlass = header.classList.contains('glass-surface');

        const leftIsland = document.createElement('div');
        leftIsland.className = 'header-island header-island-left' + (isGlass ? ' glass-surface' : '');
        if (left) leftIsland.appendChild(left);
        if (left && center) {
            const divider = document.createElement('div');
            divider.className = 'header-island-divider';
            divider.setAttribute('aria-hidden', 'true');
            leftIsland.appendChild(divider);
        }
        if (center) leftIsland.appendChild(center);

        const rightIsland = document.createElement('div');
        rightIsland.className = 'header-island header-island-right' + (isGlass ? ' glass-surface' : '');
        if (right) rightIsland.appendChild(right);

        const remainingNodes = Array.from(header.childNodes).filter(
            (node) => node !== left && node !== center && node !== right
        );

        header.innerHTML = '';
        header.appendChild(leftIsland);
        header.appendChild(rightIsland);

        remainingNodes.forEach((node) => {
            if (node.nodeType === 3 && !node.textContent.trim()) return;
            header.appendChild(node);
        });

        header.dataset.cgoHeaderUpgraded = 'true';
    });
}

/* ───────── 背景模式（纯色 Solid vs 渐变 Gradient） ───────── */

export function setBgMode(mode) {
    if (typeof document === 'undefined') return 'solid';
    const normalized = mode === 'gradient' ? 'gradient' : 'solid';
    document.documentElement.setAttribute('bg-mode', normalized);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cgo-bg-mode-change', { detail: { mode: normalized } }));
    }
    return normalized;
}

export function getBgMode() {
    if (typeof document === 'undefined') return 'solid';
    return (
        document.documentElement.getAttribute('bg-mode') ||
        getComputedStyle(document.documentElement).getPropertyValue('--cgo-bg-default')?.trim() ||
        'solid'
    );
}

export function setDefaultBgMode(mode) {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--cgo-bg-default', mode);
}

export function initTheme() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (_state.inited) return;
    _state.inited = true;

    try {
        if (!document.getElementById('cgo-clr-style')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'cgo-clr-style';
            styleEl.textContent = clrCssText;
            document.head.prepend(styleEl);
        }
    } catch (e) {
        console.warn('Failed to auto-inject cgo_clr.css:', e);
    }

    injectLiquidGlassFilter();
    checkEmbedMode();
    initMessageListener();

    const savedTheme = safeGetStorage(_state.storageKey);
    applyTheme(savedTheme || (prefersDark() ? 'dark' : 'light'));

    try {
        if (typeof window.matchMedia === 'function') {
            const q = window.matchMedia('(prefers-color-scheme: dark)');
            q.addEventListener('change', (e) => {
                if (!safeGetStorage(_state.storageKey)) applyTheme(e.matches ? 'dark' : 'light');
            });
        }
    } catch {}

    try {
        const savedColorConfig = safeGetStorage(_state.themeColorStorageKey);
        if (savedColorConfig) {
            const parsed = JSON.parse(savedColorConfig);
            if (parsed && typeof parsed === 'object' && parsed.baseColor) {
                setThemeColor(parsed.baseColor, parsed.overrides);
            }
        }
    } catch {}

    try {
        const declaredMode = document.documentElement.getAttribute('header-mode');
        if (declaredMode === 'classic') {
            setHeaderMode('classic');
        } else if (declaredMode === 'floating') {
            setHeaderMode('floating');
        } else {
            const savedHeaderMode = safeGetStorage(_state.headerModeStorageKey);
            if (savedHeaderMode) {
                setHeaderMode(savedHeaderMode);
            } else {
                const current = getHeaderMode();
                if (current) {
                    if (!document.documentElement.hasAttribute('header-mode')) {
                        document.documentElement.setAttribute('header-mode', current);
                    }
                    document.querySelectorAll('cgo-header-toggle').forEach((el) => el._sync && el._sync(current));
                }
            }
        }
    } catch {}

    try {
        const currentGlass = getGlassMode();
        if (currentGlass && !document.documentElement.hasAttribute('glass-mode')) {
            document.documentElement.setAttribute('glass-mode', currentGlass);
        }
    } catch {}

    const runHeaderUpgrade = () => {
        ensureMobileStatusBarFill();
        autoUpgradeHeader(document);
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runHeaderUpgrade, { once: true });
    } else {
        runHeaderUpgrade();
    }
    if (typeof MutationObserver !== 'undefined' && !document._cgoHeaderObserver) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if ((node.matches && node.matches('.tool-header')) || (node.querySelector && node.querySelector('.tool-header'))) {
                            autoUpgradeHeader(node);
                        }
                    }
                }
            }
        });
        const target = document.documentElement || document.body;
        if (target) {
            observer.observe(target, { childList: true, subtree: true });
            document._cgoHeaderObserver = observer;
        }
    }
}
