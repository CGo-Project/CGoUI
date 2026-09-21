import clrCssText from '../styles/cgo_clr.css?inline';

/*!
 * CGo UI — 主题引擎（明暗切换 + iframe 同步）
 * 移植自 cgoui/cgo_theme.js，保持完全一致的行为：
 *   - data-theme 属性应用到 <html>
 *   - 顶层窗口向所有 iframe 广播主题；子窗口监听 message 同步
 *   - localStorage 按工具前缀隔离；宿主可通过配置处理嵌入式页面
 *   - 系统主题变化在未手动设置时跟随
 */

// 与旧版保持同步的「需独立存储主题」工具名单
const VALID_APPS = ['vitool', 'wall', 'stasign', 'staline', 'project', 'cgoauth', 'mc', 'enmap', 'guide', 'timetable'];

export function autoStorageKey() {
    let prefix = '';
    try {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        if (
            (filename === 'index' || filename === 'real') &&
            (path.includes('/scmap') || path.includes('/scmap_original') || path.includes('/scmap_test'))
        ) {
            return 'scmap_app-theme';
        }
        if (VALID_APPS.includes(filename)) prefix = filename + '_';
    } catch (e) {}
    return prefix + 'app-theme';
}

let _storageKey = autoStorageKey();
export function setStorageKey(key) {
    if (key) _storageKey = key;
}
export function getStorageKey() {
    return _storageKey;
}

export function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // 通知所有 theme-toggle 组件更新图标
    document.querySelectorAll('cgo-theme-toggle').forEach((el) => el._sync && el._sync(theme));
    // 兼容旧版 id="theme-toggle-btn" 按钮内的图标
    updateLegacyIcon(theme);
    if (window.self === window.top) {
        document.querySelectorAll('iframe').forEach((iframe) => {
            try {
                iframe.contentWindow && iframe.contentWindow.postMessage({ type: 'theme-change', theme }, '*');
            } catch (e) {}
        });
    }
}

export function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

export function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(_storageKey, next);
    applyTheme(next);
    return next;
}

export function resetToSystem() {
    localStorage.removeItem(_storageKey);
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(sys);
    return sys;
}

function checkEmbedMode() {
    let hide = false;
    const config = typeof window !== 'undefined' && window.CGoUIConfig ? window.CGoUIConfig : {};
    try {
        const embed = config.embed || {};
        if (embed.hideHeader === true) hide = true;
        if (embed.queryParam && embed.queryValue && new URLSearchParams(window.location.search).get(embed.queryParam) === embed.queryValue) {
            hide = true;
        }
    } catch (e) {}
    try {
        if (typeof config.shouldHideHeader === 'function' && config.shouldHideHeader({ window })) hide = true;
    } catch (e) {}
    if (hide) {
        const style = document.createElement('style');
        style.innerText = '.tool-header, .bottom-bar, .status-bar { display: none !important; }';
        document.head.appendChild(style);
        document.documentElement.classList.add('is-iframe-vitool-hidden');
    }
}

function initMessageListener() {
    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'theme-change') applyTheme(e.data.theme);
    });
    if (window.self !== window.top) {
        try {
            const parentTheme = window.parent.document.documentElement.getAttribute('data-theme');
            if (parentTheme) setTimeout(() => applyTheme(parentTheme), 50);
        } catch (e) {
            try {
                window.parent.postMessage({ type: 'theme-request' }, '*');
            } catch (_) {}
        }
    }
}

/**
 * 兼容旧版 cgo_theme.js：绑定页面里 id="theme-toggle-btn" 的传统按钮。
 * 点击切换、长按 800ms 恢复系统、更新按钮内 .btn-icon 的太阳/月亮图标。
 */
const ICON_SUN = ICONS_SUN_PATH();
const ICON_MOON = ICONS_MOON_PATH();
function ICONS_SUN_PATH() {
    return '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
}
function ICONS_MOON_PATH() {
    return '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
}

function updateLegacyIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    const svg = btn.querySelector('.btn-icon');
    if (svg) svg.innerHTML = theme === 'dark' ? ICON_MOON : ICON_SUN;
}

export function bindLegacyThemeButton() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn || btn._cgoThemeBound) return;
    btn._cgoThemeBound = true;
    updateLegacyIcon(currentTheme());
    let pressTimer = null,
        isLongPress = false;
    btn.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isLongPress = false;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            resetToSystem();
            if (navigator.vibrate) navigator.vibrate(50);
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

let _inited = false;
let _currentThemeColorConfig = null;

export function autoThemeColorStorageKey() {
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
    } catch (e) {}
    return prefix + 'cgo_theme_color_config';
}

let _themeColorStorageKey = autoThemeColorStorageKey();

export function setThemeColorStorageKey(key) {
    if (key) _themeColorStorageKey = key;
}

export function getThemeColorStorageKey() {
    return _themeColorStorageKey;
}

/* ───────── 色彩工具函数 (Hex / RGB / HSL 转换与衍生计算) ───────── */
export function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let c = hex.trim().replace(/^#/, '');
    if (c.length === 3) c = c.split('').map((char) => char + char).join('');
    if (c.length !== 6) return null;
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

/**
 * 根据输入的基础主题色，自动推导生成全套衍生颜色：
 * 1. primary: 明度低的 primary 颜色 (Light Mode)
 * 2. primaryHover: 明度稍低的 primary hover 颜色 (Light Mode)
 * 3. darkPrimary: 明度再高一点的暗色模式 primary 颜色 (Dark Mode)
 * 4. darkPrimaryHover: 明度高一点的暗色模式 primary hover 颜色 (Dark Mode)
 * 5. textMain: 靠近黑色的同色系 text main 颜色
 * 6. textLight: 有一点明度升高的 text light 颜色
 * 7. darkTextLight: 适合的 text light 深色主题颜色
 */
export function generateThemePalette(baseColor) {
    if (!baseColor) return null;
    const rgb = hexToRgb(baseColor);
    if (!rgb) return null;
    const [h, s, l] = rgbToHsl(...rgb);

    // 默认深蓝色原配色对比特例处理（若输入 #00263b 精确匹配原有体系）
    if (baseColor.toLowerCase() === '#00263b') {
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

    // 1. primary (Light Mode): 检查选定颜色，如果过于浅 (如 #25d3ff, l > 48%)，按比例压暗以确保 Primary 按钮上白字对比度
    let pL;
    if (l > 48) {
        pL = Math.max(30, Math.min(38, Math.round(l * 0.62)));
    } else {
        pL = Math.min(48, Math.max(32, l));
    }
    const pS = Math.min(98, Math.max(60, s));
    const primary = hslToHex(h, pS, pL);

    // 2. primaryHover (Light Mode): 在鲜艳 primary 基础上稍微加深一档作为触感反馈 hover (L: pL - 7%)
    const pHoverL = Math.max(24, pL - 7);
    const primaryHover = hslToHex(h, pS, pHoverL);

    // 3. darkPrimary (Dark Mode): 暗色模式下高亮通透的 primary 颜色 (L: 45%~62%)
    const dPL = Math.min(62, Math.max(45, (l > 48 ? l * 0.8 : pL + 12)));
    const dPS = Math.min(98, Math.max(65, s));
    const darkPrimary = hslToHex(h, dPS, dPL);

    // 4. darkPrimaryHover (Dark Mode): 暗色模式下更高亮提纯的 primary hover 颜色 (L: dPL + 8%)
    const dPHoverL = Math.min(72, dPL + 8);
    const darkPrimaryHover = hslToHex(h, dPS, dPHoverL);

    // 5. textMain: 靠近黑色的同色系 text main 颜色 (Hue 同色, Saturation 高, Lightness ≈ 11%)
    const tmS = Math.min(100, Math.max(50, s));
    const textMain = hslToHex(h, tmS, 11);

    // 6. darkTextMain: 暗色模式极浅同色系文字 (Hue 同色, Saturation ≈ 8%-22%, Lightness ≈ 91%)
    const dtmS = Math.min(22, Math.max(8, Math.round(s * 0.2)));
    const darkTextMain = hslToHex(h, dtmS, 91);

    // 7. textLight: 有一点明度升高的 text light 颜色 (Hue 同色, Saturation ≈ 15%-25%, Lightness ≈ 42%)
    const tlS = Math.min(30, Math.max(12, Math.round(s * 0.3)));
    const textLight = hslToHex(h, tlS, 42);

    // 8. darkTextLight: 适合的 text light 深色主题颜色 (Hue 同色, Saturation ≈ 15%-22%, Lightness ≈ 72%)
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

    const palette = {
        ...generated,
        ...overrides,
    };

    _currentThemeColorConfig = {
        baseColor,
        overrides,
        palette,
    };

    try {
        localStorage.setItem(_themeColorStorageKey, JSON.stringify(_currentThemeColorConfig));
    } catch (e) {}

    applyThemeColorCSS(palette);
    return palette;
}

export function resetThemeColor() {
    _currentThemeColorConfig = null;
    try {
        localStorage.removeItem(_themeColorStorageKey);
    } catch (e) {}

    const el = document.getElementById('cgo-theme-color-style');
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

export function getThemeColor() {
    return _currentThemeColorConfig;
}

function applyThemeColorCSS(palette) {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('cgo-theme-color-style');
    if (!el) {
        el = document.createElement('style');
        el.id = 'cgo-theme-color-style';
        document.head.appendChild(el);
    }

    el.textContent = `
:root {
  --primary-color: ${palette.primary};
  --primary-hover: ${palette.primaryHover};
  --text-main: ${palette.textMain};
  --text-light: ${palette.textLight};
  --text-color: var(--text-main);
  --table-head-text: ${palette.textMain};
}
[data-theme='dark'] {
  --primary-color: ${palette.darkPrimary};
  --primary-hover: ${palette.darkPrimaryHover};
  --text-main: ${palette.darkTextMain || palette.textMain};
  --text-light: ${palette.darkTextLight};
  --table-head-text: ${palette.darkTextMain || palette.textMain};
}
`;
}

export function injectLiquidGlassFilter() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('glass-distortion') || document.getElementById('cgo-glass-svg')) return;
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
                <feDisplacementMap in="SourceGraphic" in2="softMap" scale="100" xChannelSelector="R" yChannelSelector="G" />
            </filter>
        </defs>
    `;
    const attach = () => {
        if (!document.getElementById('glass-distortion') && !document.getElementById('cgo-glass-svg')) {
            (document.body || document.documentElement).appendChild(svg);
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
    } else if (mode === 'liquid') {
        document.documentElement.setAttribute('glass-mode', 'liquid');
    } else if (!mode) {
        document.documentElement.removeAttribute('glass-mode');
    }
}

export function getGlassMode() {
    if (typeof document === 'undefined') return 'flat';
    return (
        document.documentElement.getAttribute('glass-mode') ||
        getComputedStyle(document.documentElement).getPropertyValue('--cgo-glass-default')?.trim() ||
        'flat'
    );
}

export function setDefaultGlassMode(mode) {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--cgo-glass-default', mode);
}

export function initTheme() {
    if (_inited) return;
    _inited = true;

    // 自动向全局 <head> 注入 CGoUI 的颜色变量系统 (clr css)
    try {
        if (typeof document !== 'undefined' && !document.getElementById('cgo-clr-style')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'cgo-clr-style';
            styleEl.textContent = clrCssText;
            document.head.prepend(styleEl);
        }
    } catch (e) {
        console.warn('Failed to auto-inject cgo_clr.css:', e);
    }

    // 自动确保 Liquid Glass 光学折射 SVG 滤镜管线就绪
    injectLiquidGlassFilter();

    checkEmbedMode();
    initMessageListener();
    const q = window.matchMedia('(prefers-color-scheme: dark)');
    const preferred = () => localStorage.getItem(_storageKey) || (q.matches ? 'dark' : 'light');
    applyTheme(preferred());
    q.addEventListener('change', (e) => {
        if (!localStorage.getItem(_storageKey)) applyTheme(e.matches ? 'dark' : 'light');
    });

    // 恢复本地存储的自定义主题色（按页面/应用隔离键）
    try {
        const savedColorConfig = localStorage.getItem(_themeColorStorageKey);
        if (savedColorConfig) {
            const parsed = JSON.parse(savedColorConfig);
            if (parsed && parsed.baseColor) {
                setThemeColor(parsed.baseColor, parsed.overrides || {});
            }
        }
    } catch (e) {}
}

