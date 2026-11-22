/*!
 * CGo UI — window.CGO / window.ToolTheme 兼容垫片
 *
 * 目的：让 15 个仍在使用旧全局 API 的工具「一行不动也不会坏」。
 * 这里 1:1 重建 cgo_icons.js / cgo_ctrl.js / cgo_theme.js 暴露的全部 API，
 * 签名与行为保持一致；多数函数仍操作 light DOM + 仍加载的全局 CSS。
 */
import { ICONS, buildSvg, iconNames, _escIcon as esc } from '../icons/icons.js';
import { showToast } from '../components/toast.js';
import { showNoticePopup } from '../components/notice-popup.js';
import { generateCaptcha } from '../components/captcha.js';
import {
    applyTheme,
    getStorageKey,
    bindLegacyThemeButton,
    setThemeColor,
    resetThemeColor,
    getThemeColor,
    generateThemePalette,
    setThemeColorStorageKey,
    getThemeColorStorageKey,
    injectLiquidGlassFilter,
    setGlassMode,
    getGlassMode,
    setDefaultGlassMode,
    setHeaderMode,
    getHeaderMode,
    toggleHeaderMode,
    setDefaultHeaderMode,
    setHeaderModeStorageKey,
    getHeaderModeStorageKey,
    autoUpgradeHeader,
} from '../theme.js';

const DEFAULT_SHIM_CONFIG = Object.freeze({
    branding: Object.freeze({
        copyright: '',
        links: [],
        beianPath: '',
        beianAlt: '备案图标',
    }),
    isEmbeddedApp: () => false,
});

let shimConfig = DEFAULT_SHIM_CONFIG;

/**
 * 配置宿主应用专属的兼容行为。
 *
 * CGoUI 本身不假设备案号、品牌图片或应用路由；这些信息应由宿主应用在
 * 加载 register 入口前注入，或在模块入口中显式调用此函数。
 */
export function configureGlobalShim(config = {}) {
    const branding = { ...DEFAULT_SHIM_CONFIG.branding, ...(config.branding || {}) };
    const links = Array.isArray(branding.links) ? branding.links.filter((link) => link && link.href) : [];
    shimConfig = {
        ...DEFAULT_SHIM_CONFIG,
        ...config,
        branding: { ...branding, links },
        isEmbeddedApp: typeof config.isEmbeddedApp === 'function' ? config.isEmbeddedApp : DEFAULT_SHIM_CONFIG.isEmbeddedApp,
    };
    return shimConfig;
}

function getShimConfig(global) {
    if (global && global.CGoUIConfig) return configureGlobalShim(global.CGoUIConfig);
    return shimConfig;
}

/* ───────── 图标 API（移植自 cgo_icons.js）───────── */
function icon(name, opts) {
    return buildSvg(name, opts || {});
}

function iconBtn(label, iconName, btnClass, iconPos) {
    btnClass = btnClass || 'btn btn-info';
    iconPos = iconPos || 'left';
    const svgStr = icon(iconName, { class: 'btn-icon' });
    const labelHtml = label ? '<span>' + esc(label) + '</span>' : '';
    const content = iconPos === 'right' ? labelHtml + svgStr : svgStr + labelHtml;
    return '<button class="' + btnClass + '">' + content + '</button>';
}

function renderIcons(root) {
    root = root || document.body;
    const els = root.querySelectorAll('[data-icon]');
    els.forEach((el) => {
        if (el.dataset.iconRendered) return;
        const name = el.dataset.icon;
        const size = el.dataset.iconSize || 20;
        const cls = el.dataset.iconClass || 'btn-icon';
        el.innerHTML = icon(name, { size, class: cls });
        el.dataset.iconRendered = '1';
    });
}

function injectSprite() {
    if (document.getElementById('cgo-icon-sprite')) return;
    let defs = '';
    Object.keys(ICONS).forEach((n) => {
        const e = ICONS[n];
        const fill = e.type === 'stroke' ? 'none' : 'currentColor';
        defs +=
            '<symbol id="cgo-icon-' +
            n +
            '" viewBox="' +
            (e.viewBox || '0 0 24 24') +
            '" fill="' +
            fill +
            '"' +
            (e.type === 'stroke'
                ? ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
                : '') +
            '>' +
            e.d +
            '</symbol>';
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'cgo-icon-sprite');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    svg.innerHTML = '<defs>' + defs + '</defs>';
    document.body.insertBefore(svg, document.body.firstChild);
}

function use(name, opts) {
    opts = opts || {};
    const size = opts.size !== undefined ? opts.size : 20;
    const sizeStr = typeof size === 'number' ? size + 'px' : size;
    const entry = ICONS[name];
    const isStroke = entry && entry.type === 'stroke';
    const cls = 'cgo-svg-icon' + (isStroke ? ' cgo-stroke-icon' : '') + (opts.class ? ' ' + opts.class : '');
    return (
        '<svg class="' +
        cls +
        '" xmlns="http://www.w3.org/2000/svg" width="' +
        sizeStr +
        '" height="' +
        sizeStr +
        '" aria-hidden="true"><use href="#cgo-icon-' +
        name +
        '"/></svg>'
    );
}

/* ───────── 下拉菜单（移植自 cgo_ctrl.js，升级为 Top Layer Popover + 动态视口锚点定位）───────── */
const _activeDropdownPopovers = new Set();
let _dropdownOverlaySyncBound = false;
let _dropdownResizeObserver = null;

function _findDropdownTrigger(content) {
    if (!content) return null;
    if (content._cgoAnchorTrigger && document.contains(content._cgoAnchorTrigger)) {
        return content._cgoAnchorTrigger;
    }
    const dropdown = content.closest?.('.dropdown');
    if (dropdown) {
        const btn = dropdown.querySelector(':scope > .dropbtn, :scope > button, .dropbtn');
        if (btn) return btn;
    }
    if (content.id === 'clock-menu') return document.getElementById('clock');
    return content.parentElement?.querySelector?.('.dropbtn, [aria-haspopup]') || null;
}

function positionDropdownOverlay(content, trigger) {
    if (!content || !content.classList.contains('show')) return;
    if (content.dataset.cgoauthManaged === 'react' || content.dataset.cgoAnchorManaged === 'manual') return;
    if (content.id === 'clock-menu') return;
    trigger = trigger || _findDropdownTrigger(content);
    if (!trigger) return;
    content._cgoAnchorTrigger = trigger;

    const r = trigger.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;

    const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
    const vh = window.innerHeight || document.documentElement.clientHeight || 768;
    const gap = 8;
    const pad = 10;
    const isNoticesLayout = content.classList.contains('has-notices-layout');
    const isCenteredSwitcher =
        content.classList.contains('tool-switcher-menu') || Boolean(trigger.closest('.header-center'));

    // 重置先前的水平定位以便按当前断点精确计算
    content.style.position = 'fixed';
    content.style.margin = '0';
    content.style.inset = 'auto';
    content.style.transform = 'none';

    if (vw <= 840 && isNoticesLayout) {
        const targetW = Math.min(Math.max(240, vw - 24), 380);
        const top = Math.max(8, Math.round(r.bottom + gap));
        const maxH = Math.max(220, Math.round(vh - top - 14));
        content.style.left = `${Math.round((vw - targetW) / 2)}px`;
        content.style.right = 'auto';
        content.style.top = `${top}px`;
        content.style.bottom = 'auto';
        content.style.width = `${targetW}px`;
        content.style.minWidth = `${targetW}px`;
        content.style.maxHeight = `${maxH}px`;
        return;
    }

    content.style.width = '';
    content.style.minWidth = '';
    content.style.maxHeight = '';

    const downTop = Math.max(pad, Math.round(r.bottom + gap));
    content.style.top = `${downTop}px`;
    content.style.bottom = 'auto';
    content.style.right = 'auto';
    content.style.left = '0px';

    const rect = content.getBoundingClientRect();
    const contentW = Math.max(rect.width || 0, isNoticesLayout ? 582 : 190);
    const spaceBelow = Math.max(160, vh - downTop - pad);
    const spaceAbove = Math.max(160, r.top - gap - pad);

    let left;
    if (isCenteredSwitcher) {
        left = Math.round(r.left + r.width / 2 - contentW / 2);
    } else if (
        trigger.closest('.header-left, .header-island-left, .header-toolbar-leading') &&
        !content.classList.contains('align-right')
    ) {
        left = Math.round(r.left);
    } else {
        left = Math.round(r.right - contentW);
    }
    left = Math.max(pad, Math.min(left, vw - contentW - pad));
    content.style.left = `${left}px`;

    if (!isNoticesLayout && rect.height > spaceBelow && spaceAbove > spaceBelow) {
        const usedH = Math.min(rect.height, spaceAbove);
        content.style.top = `${Math.max(pad, Math.round(r.top - gap - usedH))}px`;
        content.style.maxHeight = `${Math.round(spaceAbove)}px`;
    } else if (rect.height > spaceBelow) {
        content.style.maxHeight = `${Math.round(spaceBelow)}px`;
    }
}

function _repositionAllActiveDropdowns() {
    _activeDropdownPopovers.forEach((content) => {
        if (!document.contains(content) || !content.classList.contains('show')) {
            _activeDropdownPopovers.delete(content);
            return;
        }
        positionDropdownOverlay(content);
    });
}

function _ensureDropdownOverlaySync() {
    if (_dropdownOverlaySyncBound || typeof window === 'undefined') return;
    _dropdownOverlaySyncBound = true;
    window.addEventListener('resize', _repositionAllActiveDropdowns, { passive: true });
    window.addEventListener('scroll', _repositionAllActiveDropdowns, true);
    if (typeof ResizeObserver !== 'undefined') {
        _dropdownResizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const el = entry.target;
                if (el && el.classList?.contains('show')) {
                    positionDropdownOverlay(el);
                }
            }
        });
    }
}

function syncDropdownOverlay(content, trigger) {
    if (!content || content.dataset.cgoauthManaged === 'react') return;
    const isOpen = content.classList.contains('show');
    if (isOpen) {
        if (trigger) content._cgoAnchorTrigger = trigger;
        const parentDropdown = content.closest?.('.dropdown');
        if (parentDropdown) parentDropdown.classList.add('is-open');
        if (content.id !== 'clock-menu' && typeof content.showPopover === 'function') {
            if (content.getAttribute('popover') !== 'manual') {
                content.setAttribute('popover', 'manual');
            }
            try {
                if (!content.matches(':popover-open')) content.showPopover();
            } catch (_) {}
        }
        _activeDropdownPopovers.add(content);
        _ensureDropdownOverlaySync();
        if (_dropdownResizeObserver && !content._cgoResizeObserved) {
            content._cgoResizeObserved = true;
            try {
                _dropdownResizeObserver.observe(content);
            } catch (_) {}
        }
        positionDropdownOverlay(content, trigger);
        requestAnimationFrame(() => positionDropdownOverlay(content, trigger));
    } else {
        _activeDropdownPopovers.delete(content);
        const parentDropdown = content.closest?.('.dropdown');
        if (parentDropdown) parentDropdown.classList.remove('is-open');
        if (typeof content.hidePopover === 'function') {
            try {
                if (content.matches(':popover-open')) content.hidePopover();
            } catch (_) {}
        }
        if (content.hasAttribute('popover')) {
            content.removeAttribute('popover');
        }
        if (content.id !== 'clock-menu') {
            content.style.position = '';
            content.style.top = '';
            content.style.bottom = '';
            content.style.left = '';
            content.style.right = '';
            content.style.width = '';
            content.style.minWidth = '';
            content.style.maxHeight = '';
            content.style.margin = '';
            content.style.inset = '';
            content.style.transform = '';
        }
    }
}

function _installDropdownClassObserver() {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    if (document._cgoDropdownClassObserver) return;
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'class') {
                const el = m.target;
                if (el && el.classList && el.classList.contains('dropdown-content')) {
                    syncDropdownOverlay(el);
                }
            }
        }
    });
    const root = document.body || document.documentElement;
    if (root) {
        observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['class'] });
        document._cgoDropdownClassObserver = observer;
    }
}

function _closeAll(root, exclude) {
    const scope = root && typeof root.querySelectorAll === 'function' ? root : document;
    scope.querySelectorAll('.dropdown-content.show').forEach((el) => {
        if (el !== exclude) {
            el.classList.remove('show');
            syncDropdownOverlay(el);
        }
    });
}
function initDropdowns(root) {
    root = root || document;
    _installDropdownClassObserver();
    root.querySelectorAll('.dropdown').forEach((dropdown) => {
        const trigger = dropdown.querySelector('.dropbtn');
        const content = dropdown.querySelector('.dropdown-content');
        if (!trigger || !content) return;
        if (trigger._cgoBound) return;
        trigger._cgoBound = true;
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !content.classList.contains('show');
            _closeAll(document, willOpen ? content : null);
            if (willOpen) {
                content.classList.add('show');
                syncDropdownOverlay(content, trigger);
            } else {
                content.classList.remove('show');
                syncDropdownOverlay(content, trigger);
            }
        });
        if (!content._cgoMenuClickBound) {
            content._cgoMenuClickBound = true;
            content.addEventListener('click', (e) => {
                const path = e.composedPath ? e.composedPath() : [];
                // 点击通知中心或账号调色板等交互区内部，保持菜单展开
                if (
                    path.some(
                        (node) =>
                            node.classList &&
                            (node.classList.contains('dropdown-notice-center') ||
                                node.classList.contains('cgopush-center-panel') ||
                                node.classList.contains('auth-color-picker-panel') ||
                                node.classList.contains('auth-avatar-large') ||
                                node.classList.contains('auth-user-card')),
                    ) ||
                    path.some((node) => node.tagName === 'CGO-NOTICE-CENTER')
                ) {
                    return;
                }
                const actionItem = e.target?.closest?.('a, button.dropdown-item');
                if (actionItem) {
                    content.classList.remove('show');
                    syncDropdownOverlay(content, trigger);
                }
            });
        }
    });
    if (!root._cgoDropdownOutsideInit) {
        root._cgoDropdownOutsideInit = true;
        const target = root instanceof Document ? document : root;
        target.addEventListener('click', (e) => {
            const path = e.composedPath ? e.composedPath() : [];
            const insideOpenDropdown = path.some(
                (el) =>
                    el.classList &&
                    (el.classList.contains('dropdown-content') ||
                        el.classList.contains('dropdown') ||
                        el.classList.contains('dropdown-notice-center') ||
                        el.classList.contains('cgopush-center-panel')),
            );
            if (!insideOpenDropdown) {
                _closeAll(document);
            }
        });
    }
}

/* ───────── 主题设置行 + select 绑定（移植自 cgo_ctrl.js）───────── */
function getThemeSettingHTML(isEnglish) {
    const title = isEnglish ? 'Appearance' : '界面外观';
    const desc = isEnglish ? 'Dark or light UI style' : '软件界面的深色或浅色风格';
    const optSys = isEnglish ? 'System' : '跟随系统';
    const optLight = isEnglish ? 'Light' : '亮色';
    const optDark = isEnglish ? 'Dark' : '暗色';
    return (
        '<div class="help-setting-row"><div><h4>' +
        title +
        '</h4><p>' +
        desc +
        '</p></div>' +
        '<div style="min-width:120px"><cgo-toolbar-select id="js-theme-select">' +
        '<cgo-toolbar-option value="system">' +
        optSys +
        '</cgo-toolbar-option>' +
        '<cgo-toolbar-option value="light">' +
        optLight +
        '</cgo-toolbar-option>' +
        '<cgo-toolbar-option value="dark">' +
        optDark +
        '</cgo-toolbar-option></cgo-toolbar-select></div></div>'
    );
}

function bindThemeSelect(selectElement) {
    if (!selectElement) return;
    const storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    const initialValue = saved === 'light' ? 'light' : saved === 'dark' ? 'dark' : 'system';
    selectElement.setAttribute('value', initialValue);
    selectElement.addEventListener('cgo-change', (e) => {
        const value = e.detail.value;
        if (value === 'system') {
            localStorage.removeItem(storageKey);
            applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } else {
            localStorage.setItem(storageKey, value);
            applyTheme(value);
        }
    });
}

/* ───────── 帮助弹窗（移植自 cgo_ctrl.js，依赖仍加载的全局 CSS）───────── */
function showHelpModal(options) {
    console.log('[HelpModal] showHelpModal entry called, options:', options);
    options = options || {};
    const title = options.title || '帮助与选项';
    const subtitle = options.subtitle || '';
    const config = getShimConfig(typeof window !== 'undefined' ? window : undefined);
    const branding = { ...config.branding, ...(options.branding || {}) };
    const iconHtml = options.iconPath ? '<img src="' + options.iconPath + '" class="help-icon-img" alt="Logo">' : '';
    const beianPath = options.beianPath || branding.beianPath;
    const contentHtml = options.content || '';
    const maxWidth = options.maxWidth || '420px';
    const isEnglish = !!options.isEnglish;
    const isEmbeddedApp = options.isEmbedded === true || config.isEmbeddedApp({ options, global: window });
    const themeHtml = options.hideTheme || isEmbeddedApp ? '' : getThemeSettingHTML(isEnglish);

    const overlay = document.createElement('div');
    overlay.className = 'help-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'text-dialog help-dialog';
    dialog.style.maxWidth = maxWidth;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'dialog-close-btn';
    closeBtn.innerHTML = '&times;';
    const container = document.createElement('div');
    container.className = 'help-container';

    const headerHtml =
        '<div class="help-header">' +
        iconHtml +
        '<div class="help-title-group"><h3>' +
        title +
        '</h3>' +
        (subtitle ? '<p>' + subtitle + '</p>' : '') +
        '</div></div>';
    const footerLinks = Array.isArray(branding.links)
        ? branding.links
              .filter((link) => link && link.href && link.label)
              .map(
                  (link) =>
                      '<a href="' +
                      esc(link.href) +
                      '" target="_blank" rel="noopener noreferrer">' +
                      esc(link.label) +
                      '</a>',
              )
              .join('')
        : '';
    const beianHtml = beianPath
        ? '<div class="help-beian-group"><img src="' +
          esc(beianPath) +
          '" alt="' +
          esc(branding.beianAlt || '备案图标') +
          '" class="help-beian-icon"></div>'
        : '';
    const footerHtml = branding.copyright || footerLinks || beianHtml
        ? '<div class="help-footer"><div class="help-footer-content">' +
          (branding.copyright ? '<span>' + esc(branding.copyright) + '</span>' : '') +
          footerLinks +
          beianHtml +
          '</div></div>'
        : '';

    container.innerHTML = headerHtml + themeHtml + contentHtml + footerHtml;
    dialog.appendChild(closeBtn);
    dialog.appendChild(container);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    // 显式设置不透明度与居中定位，防止被页面外部 CSS（如 opacity: 0）覆盖导致不可见
    overlay.style.opacity = '1';
    dialog.style.opacity = '1';
    dialog.style.transform = 'translate(-50%, -50%)';

    const themeSelect = dialog.querySelector('#js-theme-select');
    if (themeSelect) bindThemeSelect(themeSelect);

    const close = (reason) => {
        console.log('[HelpModal] close called, reason:', reason, 'stack:', new Error().stack);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
    };
    closeBtn.addEventListener('click', () => close('closeBtn click'));
    // 延迟绑定 overlay 的点击事件，防止触发点击事件的“穿透”或“瞬间关闭”
    setTimeout(() => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close('overlay click');
        });
    }, 100);
}

/* ───────── 验证码放大交互（移植自 cgo_ctrl.js）───────── */
function bindCaptchaZoom(zoomBtn, container, options) {
    options = options || {};
    const duration = typeof options.duration === 'number' ? options.duration : 8000;
    const zoomClass = options.zoomClass || 'auth-captcha-zoomed';
    const btnEl = typeof zoomBtn === 'string' ? document.querySelector(zoomBtn) : zoomBtn;
    const containerEl = typeof container === 'string' ? document.querySelector(container) : container;
    if (!btnEl || !containerEl) return null;
    let timer = null;
    const reset = () => {
        containerEl.classList.remove(zoomClass);
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };
    const clickHandler = (e) => {
        e.stopPropagation();
        if (containerEl.classList.contains(zoomClass)) reset();
        else {
            containerEl.classList.add(zoomClass);
            if (timer) clearTimeout(timer);
            timer = setTimeout(reset, duration);
        }
    };
    btnEl.addEventListener('click', clickHandler);
    return {
        destroy: () => {
            btnEl.removeEventListener('click', clickHandler);
            reset();
        },
        reset,
    };
}

/**
 * 安装 window.CGO 与 window.ToolTheme 全局命名空间。
 * 幂等：重复调用安全。
 */
export function installGlobalShim(global = window) {
    getShimConfig(global);
    const CGO = global.CGO || {};
    // icons
    CGO.Icons = ICONS;
    CGO.icon = icon;
    CGO.iconBtn = iconBtn;
    CGO.renderIcons = renderIcons;
    CGO.injectSprite = injectSprite;
    CGO.use = use;
    CGO.iconList = iconNames;
    // ctrl
    CGO.initDropdowns = initDropdowns;
    CGO.positionDropdownOverlay = positionDropdownOverlay;
    CGO.syncDropdownOverlay = syncDropdownOverlay;
    CGO.getThemeSettingHTML = getThemeSettingHTML;
    CGO.bindThemeSelect = bindThemeSelect;
    CGO.showToast = showToast;
    CGO.showNoticePopup = showNoticePopup;
    CGO.showHelpModal = showHelpModal;
    CGO.generateCaptcha = generateCaptcha;
    CGO.bindCaptchaZoom = bindCaptchaZoom;
    // theme
    CGO.theme = {
        setThemeColor,
        resetThemeColor,
        getThemeColor,
        generateThemePalette,
        applyTheme,
        setThemeColorStorageKey,
        getThemeColorStorageKey,
        setGlassMode,
        getGlassMode,
        setDefaultGlassMode,
        injectLiquidGlassFilter,
        setHeaderMode,
        getHeaderMode,
        toggleHeaderMode,
        setDefaultHeaderMode,
        setHeaderModeStorageKey,
        getHeaderModeStorageKey,
        autoUpgradeHeader,
    };
    CGO.setThemeColor = setThemeColor;
    CGO.resetThemeColor = resetThemeColor;
    CGO.getThemeColor = getThemeColor;
    CGO.generateThemePalette = generateThemePalette;
    CGO.setThemeColorStorageKey = setThemeColorStorageKey;
    CGO.getThemeColorStorageKey = getThemeColorStorageKey;
    CGO.setGlassMode = setGlassMode;
    CGO.getGlassMode = getGlassMode;
    CGO.setDefaultGlassMode = setDefaultGlassMode;
    CGO.injectLiquidGlassFilter = injectLiquidGlassFilter;
    CGO.setHeaderMode = setHeaderMode;
    CGO.getHeaderMode = getHeaderMode;
    CGO.toggleHeaderMode = toggleHeaderMode;
    CGO.setDefaultHeaderMode = setDefaultHeaderMode;
    CGO.setHeaderModeStorageKey = setHeaderModeStorageKey;
    CGO.getHeaderModeStorageKey = getHeaderModeStorageKey;
    CGO.autoUpgradeHeader = autoUpgradeHeader;
    CGO.initImgIconWrappers = initImgIconWrappers;
    global.CGO = CGO;

    // 兼容 cgo_theme.js 暴露的 window.ToolTheme
    global.ToolTheme = global.ToolTheme || {};
    global.ToolTheme.applyTheme = applyTheme;
    global.ToolTheme.setThemeColor = setThemeColor;
    global.ToolTheme.resetThemeColor = resetThemeColor;
    global.ToolTheme.getThemeColor = getThemeColor;
    global.ToolTheme.generateThemePalette = generateThemePalette;
    global.ToolTheme.setThemeColorStorageKey = setThemeColorStorageKey;
    global.ToolTheme.getThemeColorStorageKey = getThemeColorStorageKey;

    // 旧版自动行为：DOM 就绪后渲染 data-icon、初始化旧 .dropdown、绑定图片渐进加载、自动升级旧标题栏
    const autorun = () => {
        renderIcons();
        initDropdowns(document);
        bindLegacyThemeButton();
        initImgIconWrappers(document);
        autoUpgradeHeader(document);
    };
    initImgIconWrappers(document);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autorun);
    } else {
        autorun();
    }
}

/**
 * 自动处理 .img-icon-wrapper 内部 img 的加载状态。
 * 当图片加载完成（或命中本地缓存）时自动添加 .loaded 类并隐藏 .icon-placeholder 占位符。
 */
export function initImgIconWrappers(root = document) {
    if (typeof window === 'undefined' || !root) return;
    const markLoaded = (wrapper, img) => {
        wrapper.classList.add('loaded');
        if (img) img.classList.add('loaded');
    };
    const bindWrapper = (wrapper) => {
        if (!wrapper || wrapper.classList.contains('loaded')) return;
        const img = wrapper.querySelector('img');
        if (!img) return;
        if (img.complete && img.naturalWidth !== 0) {
            markLoaded(wrapper, img);
        } else {
            img.addEventListener('load', () => markLoaded(wrapper, img), { once: true });
            img.addEventListener('error', () => markLoaded(wrapper, img), { once: true });
        }
    };

    root.querySelectorAll('.img-icon-wrapper').forEach(bindWrapper);

    if (typeof MutationObserver !== 'undefined' && root === document && !document._cgoImgIconObserver) {
        document._cgoImgIconObserver = true;
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches('.img-icon-wrapper')) {
                            bindWrapper(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('.img-icon-wrapper').forEach(bindWrapper);
                        }
                    }
                }
            }
        });
        observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
}

