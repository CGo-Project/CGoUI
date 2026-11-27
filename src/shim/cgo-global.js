/*!
 * CGo UI — window.CGO / window.ToolTheme 兼容垫片
 *
 * 重建 cgo_icons.js / cgo_ctrl.js / cgo_theme.js 暴露的兼容 API。
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
    setBgMode,
    getBgMode,
    setDefaultBgMode,
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
let hasProgrammaticConfig = false;

function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^(?:\/|\.\/|\.\.\/|#)/.test(trimmed)) return trimmed;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : '';
    } catch {
        return '';
    }
}

export function configureGlobalShim(config = {}) {
    const safe = config && typeof config === 'object' ? config : {};
    hasProgrammaticConfig = true;
    const branding = { ...DEFAULT_SHIM_CONFIG.branding, ...(safe.branding && typeof safe.branding === 'object' ? safe.branding : {}) };
    const links = Array.isArray(branding.links)
        ? branding.links
              .filter((link) => link && typeof link.href === 'string' && sanitizeUrl(link.href))
              .map((link) => ({ ...link, href: sanitizeUrl(link.href) }))
        : [];
    shimConfig = {
        ...DEFAULT_SHIM_CONFIG,
        ...safe,
        branding: { ...branding, links },
        isEmbeddedApp: typeof safe.isEmbeddedApp === 'function' ? safe.isEmbeddedApp : DEFAULT_SHIM_CONFIG.isEmbeddedApp,
    };
    return shimConfig;
}

function getShimConfig(global) {
    if (!hasProgrammaticConfig && global && global.CGoUIConfig) {
        return configureGlobalShim(global.CGoUIConfig);
    }
    return shimConfig;
}

/* ───────── 图标 API ───────── */
function icon(name, opts) {
    return buildSvg(name, opts || {});
}

function iconBtn(label, iconName, btnClass, iconPos) {
    btnClass = btnClass || 'btn btn-info';
    iconPos = iconPos || 'left';
    const svgStr = icon(iconName, { class: 'btn-icon' });
    const labelHtml = label ? '<span>' + esc(label) + '</span>' : '';
    const content = iconPos === 'right' ? labelHtml + svgStr : svgStr + labelHtml;
    return '<button class="' + esc(btnClass) + '">' + content + '</button>';
}

function renderIcons(root) {
    if (typeof document === 'undefined') return;
    root = root || document.body;
    if (!root || typeof root.querySelectorAll !== 'function') return;
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
    if (typeof document === 'undefined' || !document.body) return;
    if (document.getElementById('cgo-icon-sprite')) return;
    let defs = '';
    Object.keys(ICONS).forEach((n) => {
        const e = ICONS[n];
        const fill = e.type === 'stroke' ? 'none' : 'currentColor';
        defs +=
            '<symbol id="cgo-icon-' +
            esc(n) +
            '" viewBox="' +
            esc(e.viewBox || '0 0 24 24') +
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
    if (typeof name !== 'string' || !Object.hasOwn(ICONS, name)) return '';
    const size = opts.size !== undefined ? opts.size : 20;
    const sizeStr = esc(typeof size === 'number' ? size + 'px' : size);
    const entry = ICONS[name];
    const isStroke = entry && entry.type === 'stroke';
    const cls = esc('cgo-svg-icon' + (isStroke ? ' cgo-stroke-icon' : '') + (opts.class ? ' ' + opts.class : ''));
    return (
        '<svg class="' +
        cls +
        '" xmlns="http://www.w3.org/2000/svg" width="' +
        sizeStr +
        '" height="' +
        sizeStr +
        '" aria-hidden="true"><use href="#cgo-icon-' +
        esc(name) +
        '"/></svg>'
    );
}

/* ───────── 下拉菜单（Top Layer Popover + 动态视口锚点定位）───────── */
const _activeDropdownPopovers = new Set();
let _dropdownOverlaySyncBound = false;
let _dropdownResizeObserver = null;
let _dropdownRepositionRaf = null;

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
    if (_dropdownRepositionRaf) return;
    _dropdownRepositionRaf = requestAnimationFrame(() => {
        _dropdownRepositionRaf = null;
        _activeDropdownPopovers.forEach((content) => {
            if (!document.contains(content) || !content.classList.contains('show')) {
                _activeDropdownPopovers.delete(content);
                if (_dropdownResizeObserver && content._cgoResizeObserved) {
                    _dropdownResizeObserver.unobserve(content);
                    content._cgoResizeObserved = false;
                }
                return;
            }
            positionDropdownOverlay(content);
        });
        repositionOpenSubmenus();
        if (_activeDropdownPopovers.size === 0) _detachDropdownOverlaySync();
    });
}

function _isEventInsideActiveDropdown(e) {
    if (!e) return false;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : null;
    for (const content of _activeDropdownPopovers) {
        if (path && path.includes(content)) return true;
        if (e.target && typeof Node !== 'undefined' && e.target instanceof Node && (e.target === content || content.contains(e.target))) {
            return true;
        }
    }
    return false;
}

function _onWindowScroll(e) {
    if (_isEventInsideActiveDropdown(e)) return;
    _repositionAllActiveDropdowns();
}

function _ensureDropdownOverlaySync() {
    if (_dropdownOverlaySyncBound || typeof window === 'undefined') return;
    _dropdownOverlaySyncBound = true;
    window.addEventListener('resize', _repositionAllActiveDropdowns, { passive: true });
    window.addEventListener('scroll', _onWindowScroll, { capture: true, passive: true });
    if (typeof ResizeObserver !== 'undefined' && !_dropdownResizeObserver) {
        _dropdownResizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const el = entry.target;
                if (el && el.classList?.contains('show')) {
                    _repositionAllActiveDropdowns();
                    break;
                }
            }
        });
    }
}

function _detachDropdownOverlaySync() {
    if (!_dropdownOverlaySyncBound || typeof window === 'undefined') return;
    _dropdownOverlaySyncBound = false;
    window.removeEventListener('resize', _repositionAllActiveDropdowns);
    window.removeEventListener('scroll', _onWindowScroll, true);
    if (_dropdownRepositionRaf) {
        cancelAnimationFrame(_dropdownRepositionRaf);
        _dropdownRepositionRaf = null;
    }
}

function _escapeCssId(id) {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(id);
    }
    return String(id).replace(/["\\]/g, '\\$&');
}

function getSubmenuTrigger(flyout) {
    if (!flyout) return null;
    if (flyout.id) {
        try {
            const byControl = document.querySelector(`.dropdown-submenu-trigger[aria-controls="${_escapeCssId(flyout.id)}"]`);
            if (byControl) return byControl;
        } catch {
            /* 忽略异常 id 选择器 */
        }
    }
    const prev = flyout.previousElementSibling;
    return prev?.classList?.contains('dropdown-submenu-trigger') ? prev : null;
}

function getSubmenuFlyout(trigger) {
    if (!trigger) return null;
    const targetId = trigger.getAttribute('aria-controls');
    if (targetId) {
        const byId = document.getElementById(targetId);
        if (byId?.classList?.contains('dropdown-submenu-flyout')) return byId;
    }
    const next = trigger.nextElementSibling;
    return next?.classList?.contains('dropdown-submenu-flyout') ? next : null;
}

function isSubmenuOpen(flyout) {
    if (!flyout) return false;
    try {
        if (typeof flyout.matches === 'function' && flyout.matches(':popover-open')) return true;
    } catch {
        /* 忽略不支持 :popover-open 的环境 */
    }
    return flyout.classList.contains('show');
}

function getSubmenuItems(flyout) {
    const surface = flyout?.querySelector('.dropdown-submenu-surface') || flyout;
    if (!surface) return [];
    return Array.from(surface.querySelectorAll('a, button')).filter((el) => {
        if (el.hidden || el.style.display === 'none') return false;
        if (el.disabled || el.classList.contains('permission-disabled') || el.getAttribute('aria-disabled') === 'true') {
            return false;
        }
        return true;
    });
}

function syncSubmenuTriggerVisibility(dropdownContent) {
    if (!dropdownContent) return;
    dropdownContent.querySelectorAll('.dropdown-submenu-trigger').forEach((trigger) => {
        const flyout = getSubmenuFlyout(trigger);
        if (!flyout) return;
        const surface = flyout.querySelector('.dropdown-submenu-surface') || flyout;
        const hasVisibleChild = Array.from(surface.querySelectorAll('a, button')).some(
            (el) => !el.hidden && el.style.display !== 'none',
        );
        trigger.hidden = !hasVisibleChild;
        trigger.style.display = hasVisibleChild ? '' : 'none';
    });
}

function clearSubmenuBridge(flyout) {
    if (!flyout) return;
    clearTimeout(flyout._cgoBridgeTimer);
    flyout._cgoBridgeTimer = null;
    if (flyout._cgoBridgeMoveHandler) {
        flyout.removeEventListener('pointermove', flyout._cgoBridgeMoveHandler);
        flyout._cgoBridgeMoveHandler = null;
    }
    flyout._cgoBridgeState = null;
    flyout.removeAttribute('data-bridge');
}

function isPointInSafeTriangle(px, py, apex, cornerA, cornerB) {
    if (!apex || !cornerA || !cornerB) return false;
    const crossSign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    const pt = { x: px, y: py };
    const d1 = crossSign(pt, apex, cornerA);
    const d2 = crossSign(pt, cornerA, cornerB);
    const d3 = crossSign(pt, cornerB, apex);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
}

function isPointerProtectedBySubmenuBridge(flyout, clientX, clientY) {
    const state = flyout?._cgoBridgeState;
    if (!state || !isSubmenuOpen(flyout)) return false;
    if (Date.now() > state.expiresAt) {
        clearSubmenuBridge(flyout);
        return false;
    }
    const REVERSAL_SLOP = 6;
    if (
        state.pointerIsLeftOfFlyout
            ? clientX < state.lastX - REVERSAL_SLOP
            : clientX > state.lastX + REVERSAL_SLOP
    ) {
        clearSubmenuBridge(flyout);
        return false;
    }
    if (!isPointInSafeTriangle(clientX, clientY, state.apex, state.cornerA, state.cornerB)) {
        return false;
    }
    if (state.pointerIsLeftOfFlyout ? clientX > state.lastX : clientX < state.lastX) {
        state.lastX = clientX;
    }
    state.expiresAt = Date.now() + 400;
    clearTimeout(flyout._cgoBridgeTimer);
    flyout._cgoBridgeTimer = setTimeout(() => clearSubmenuBridge(flyout), 400);
    return true;
}

function closeSubmenu(flyout, { restoreFocus = false } = {}) {
    if (!flyout) return;
    clearSubmenuBridge(flyout);
    flyout.classList.remove('show');
    flyout.style.positionArea = '';
    flyout.style.left = '';
    flyout.style.top = '';
    flyout.style.maxWidth = '';
    if (typeof flyout.hidePopover === 'function') {
        try {
            if (flyout.matches(':popover-open')) flyout.hidePopover();
        } catch {
            /* 忽略 popover 状态异常 */
        }
    }
    const trigger = getSubmenuTrigger(flyout);
    if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
        if (restoreFocus && typeof trigger.focus === 'function') {
            trigger.focus();
        }
    }
}

function closeAllSubmenus(root = document, exceptFlyout = null) {
    if (typeof document === 'undefined') return;
    (root || document).querySelectorAll('.dropdown-submenu-flyout').forEach((flyout) => {
        if (exceptFlyout && flyout === exceptFlyout) return;
        if (isSubmenuOpen(flyout) || flyout.getAttribute('data-bridge') !== null || flyout._cgoBridgeState) {
            closeSubmenu(flyout);
        } else {
            const trigger = getSubmenuTrigger(flyout);
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
    });
}

function closeTopmostSubmenu() {
    if (typeof document === 'undefined') return false;
    const openFlyouts = Array.from(document.querySelectorAll('.dropdown-submenu-flyout')).filter((el) =>
        isSubmenuOpen(el),
    );
    if (openFlyouts.length === 0) return false;
    closeSubmenu(openFlyouts[openFlyouts.length - 1], { restoreFocus: true });
    return true;
}

let submenuAnchorSeq = 0;

function ensureSubmenuAnchorPair(trigger, flyout) {
    const supportsAnchor =
        typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('position-area', 'block-end');
    if (!supportsAnchor) return false;
    const supportsSource = typeof ToggleEvent !== 'undefined' && 'source' in ToggleEvent.prototype;
    if (!supportsSource) {
        if (!trigger.dataset.cgoAnchorName) {
            const safeId = trigger.id || `auto-${++submenuAnchorSeq}`;
            trigger.dataset.cgoAnchorName = `--cgo-sub-${safeId}`;
        }
        const anchorName = trigger.dataset.cgoAnchorName;
        trigger.style.setProperty('anchor-name', anchorName);
        flyout.style.setProperty('position-anchor', anchorName);
    }
    return true;
}

function applySubmenuFallbackCoords(trigger, flyout) {
    flyout.style.positionArea = 'none';
    flyout.style.position = 'fixed';
    flyout.style.inset = 'auto';
    flyout.style.margin = '0';
    flyout.style.maxWidth = '';
    const tRect = trigger.getBoundingClientRect();
    const fRect = flyout.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
    const vh = window.innerHeight || document.documentElement.clientHeight || 768;
    const pad = 8;
    const gap = 8;
    let left = tRect.right + gap;
    let top = tRect.top;
    let placedBelow = false;
    if (left + fRect.width > vw - pad) {
        const leftSide = tRect.left - fRect.width - gap;
        if (leftSide >= pad) {
            left = leftSide;
        } else {
            placedBelow = true;
            left = Math.max(pad, Math.min(tRect.left + 16, vw - fRect.width - pad));
            top = tRect.bottom + 4;
            flyout.style.maxWidth = `calc(100vw - ${Math.round(left + pad)}px)`;
        }
    }
    if (!placedBelow && top + fRect.height > vh - pad) {
        top = Math.max(pad, vh - fRect.height - pad);
    } else if (placedBelow && top + fRect.height > vh - pad) {
        const aboveTop = tRect.top - fRect.height - 4;
        if (aboveTop >= pad) top = aboveTop;
        else top = Math.max(pad, vh - fRect.height - pad);
    }
    flyout.style.left = `${Math.round(left)}px`;
    flyout.style.top = `${Math.round(top)}px`;
}

function positionSubmenuFlyout(trigger, flyout) {
    if (!trigger || !flyout) return;
    if (ensureSubmenuAnchorPair(trigger, flyout)) {
        const tRect = trigger.getBoundingClientRect();
        const fRect = flyout.getBoundingClientRect();
        if (fRect.width > 0 && fRect.height > 0 && tRect.width > 0 && tRect.height > 0) {
            const horizGap = Math.max(0, fRect.left - tRect.right, tRect.left - fRect.right);
            const vertGap = Math.max(0, fRect.top - tRect.bottom, tRect.top - fRect.bottom);
            if (horizGap <= 48 && vertGap <= 48) {
                return;
            }
        }
    }
    applySubmenuFallbackCoords(trigger, flyout);
}

function repositionOpenSubmenus() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.dropdown-submenu-flyout').forEach((flyout) => {
        if (!isSubmenuOpen(flyout)) return;
        const trigger = getSubmenuTrigger(flyout);
        if (trigger) positionSubmenuFlyout(trigger, flyout);
    });
}

function startSubmenuBridge(flyout, event, triggerEl = null) {
    if (!flyout || !isSubmenuOpen(flyout)) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
    if (event.relatedTarget && flyout.contains(event.relatedTarget)) return;
    const rect = flyout.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const trigger = triggerEl || getSubmenuTrigger(flyout);
    const origin = trigger?._cgoLastPointer || { x: event.clientX, y: event.clientY };
    const pointerIsLeftOfFlyout = origin.x < rect.left;
    const pointerIsRightOfFlyout = origin.x > rect.right;
    if (!pointerIsLeftOfFlyout && !pointerIsRightOfFlyout) return;

    const BRIDGE_SLACK = 8;
    const VERTICAL_SLACK = 10;
    const nearEdgeX = pointerIsLeftOfFlyout ? rect.left : rect.right;
    const apex = {
        x: origin.x + (pointerIsLeftOfFlyout ? -BRIDGE_SLACK : BRIDGE_SLACK),
        y: origin.y,
    };
    const cornerA = { x: nearEdgeX, y: rect.top - VERTICAL_SLACK };
    const cornerB = { x: nearEdgeX, y: rect.bottom + VERTICAL_SLACK };

    clearSubmenuBridge(flyout);

    if (!isPointInSafeTriangle(event.clientX, event.clientY, apex, cornerA, cornerB)) {
        return;
    }

    flyout._cgoBridgeState = {
        pointerIsLeftOfFlyout,
        lastX: event.clientX,
        apex,
        cornerA,
        cornerB,
        expiresAt: Date.now() + 400,
    };

    flyout.style.setProperty('--pointer-x', `${origin.x - rect.left}px`);
    flyout.style.setProperty('--pointer-y', `${origin.y - rect.top}px`);
    flyout.setAttribute('data-bridge', '');

    const extend = ({ target, clientX }) => {
        const state = flyout._cgoBridgeState;
        const REVERSAL_SLOP = 6;
        if (
            !state ||
            target !== flyout ||
            (pointerIsLeftOfFlyout ? clientX < state.lastX - REVERSAL_SLOP : clientX > state.lastX + REVERSAL_SLOP)
        ) {
            clearSubmenuBridge(flyout);
            return;
        }
        if (pointerIsLeftOfFlyout ? clientX > state.lastX : clientX < state.lastX) {
            state.lastX = clientX;
        }
        state.expiresAt = Date.now() + 400;
        clearTimeout(flyout._cgoBridgeTimer);
        flyout._cgoBridgeTimer = setTimeout(() => clearSubmenuBridge(flyout), 400);
    };
    flyout._cgoBridgeMoveHandler = extend;
    flyout._cgoBridgeTimer = setTimeout(() => clearSubmenuBridge(flyout), 400);
    flyout.addEventListener('pointermove', extend);
}

function openSubmenu(trigger, flyout, { focusFirst = false, byHover = false } = {}) {
    if (!trigger || !flyout) return;
    const parentMenu = trigger.closest('.dropdown-content');
    closeAllSubmenus(parentMenu || document, flyout);

    flyout.style.positionArea = '';
    flyout.style.left = '';
    flyout.style.top = '';
    flyout.style.maxWidth = '';
    ensureSubmenuAnchorPair(trigger, flyout);

    if (typeof flyout.showPopover === 'function') {
        try {
            if (!flyout.matches(':popover-open')) {
                try {
                    flyout.showPopover({ source: trigger });
                } catch {
                    flyout.showPopover();
                }
            }
        } catch {
            flyout.classList.add('show');
        }
    } else {
        flyout.classList.add('show');
    }
    flyout.classList.add('show');
    trigger.setAttribute('aria-expanded', 'true');
    if (byHover) {
        flyout._cgoOpenedByHoverAt = Date.now();
    }
    positionSubmenuFlyout(trigger, flyout);

    if (focusFirst) {
        const items = getSubmenuItems(flyout);
        if (items.length > 0 && typeof items[0].focus === 'function') {
            items[0].focus({ preventScroll: true });
        }
    }
}

function setupSubmenuFocusgroupFallback(surface) {
    if (!surface || surface._cgoFocusgroupBound || 'focusGroup' in HTMLElement.prototype) return;
    surface._cgoFocusgroupBound = true;
    surface.setAttribute('role', 'menu');
    surface.querySelectorAll('a, button').forEach((item) => {
        if (!item.hasAttribute('role')) item.setAttribute('role', 'menuitem');
    });
    surface.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
        const items = getSubmenuItems(surface.closest('.dropdown-submenu-flyout') || surface);
        if (items.length === 0) return;
        const current = items.indexOf(document.activeElement);
        let nextIdx = 0;
        if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = items.length - 1;
        else if (current < 0) nextIdx = e.key === 'ArrowUp' ? items.length - 1 : 0;
        else nextIdx = (current + (e.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
        e.preventDefault();
        e.stopPropagation();
        items[nextIdx]?.focus({ preventScroll: true });
    });
}

function initSubmenuContainer(dropdownContainer, dropdownContent, dropdownBtn) {
    if (!dropdownContent) return;
    const triggers = dropdownContent.querySelectorAll('.dropdown-submenu-trigger');
    if (triggers.length === 0) return;

    triggers.forEach((trigger) => {
        if (trigger._cgoSubmenuBound) return;
        trigger._cgoSubmenuBound = true;
        const flyout = getSubmenuFlyout(trigger);
        if (!flyout) return;
        const surface = flyout.querySelector('.dropdown-submenu-surface') || flyout;
        setupSubmenuFocusgroupFallback(surface);

        let hoverTimer = null;
        trigger.addEventListener('pointerenter', (e) => {
            trigger._cgoLastPointer = { x: e.clientX, y: e.clientY };
            if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
            if (trigger.disabled || trigger.classList.contains('permission-disabled')) return;
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                const parentOpen = dropdownContent.classList.contains('show') || Boolean(dropdownContainer?.open);
                if (parentOpen) {
                    openSubmenu(trigger, flyout, { byHover: true });
                }
            }, 80);
        });
        trigger.addEventListener('pointermove', (e) => {
            trigger._cgoLastPointer = { x: e.clientX, y: e.clientY };
        });
        trigger.addEventListener('pointerleave', (e) => {
            clearTimeout(hoverTimer);
            if (isSubmenuOpen(flyout)) {
                startSubmenuBridge(flyout, e, trigger);
            }
        });
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearTimeout(hoverTimer);
            if (trigger.disabled || trigger.classList.contains('permission-disabled')) return;
            const canHover = Boolean(window.matchMedia && window.matchMedia('(hover: hover)').matches);
            if (isSubmenuOpen(flyout)) {
                if (canHover) return;
                closeSubmenu(flyout);
            } else {
                openSubmenu(trigger, flyout);
            }
        });
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                openSubmenu(trigger, flyout, { focusFirst: true });
            }
        });

        if (!flyout._cgoFlyoutBound) {
            flyout._cgoFlyoutBound = true;
            flyout.addEventListener('click', (e) => {
                e.stopPropagation();
                const leafItem = e.target?.closest?.('a, button:not(.dropdown-submenu-trigger)');
                if (!leafItem || leafItem.disabled || leafItem.classList?.contains('permission-disabled') || leafItem.getAttribute('aria-disabled') === 'true') {
                    return;
                }
                closeAllSubmenus(dropdownContainer || dropdownContent);
                if (dropdownContent.classList?.contains('dropdown-content')) {
                    dropdownContent.classList.remove('show');
                    dropdownContainer?.classList?.remove('is-open');
                    if (dropdownBtn) dropdownBtn.setAttribute('aria-expanded', 'false');
                    syncDropdownOverlay(dropdownContent, dropdownBtn || null);
                }
                if (typeof dropdownContainer?.close === 'function') dropdownContainer.close();
            });
            surface.addEventListener('pointerenter', () => {
                clearSubmenuBridge(flyout);
            });
            flyout.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    e.stopPropagation();
                    closeSubmenu(flyout, { restoreFocus: true });
                } else if (e.key === 'Tab') {
                    _closeAll(document);
                    if (typeof dropdownContainer?.close === 'function') dropdownContainer.close();
                }
            });
        }
    });

    if (!dropdownContent._cgoSubmenuParentMoveBound) {
        dropdownContent._cgoSubmenuParentMoveBound = true;
        dropdownContent.addEventListener('pointermove', (e) => {
            const overItem = e.target?.closest?.('a, button.dropdown-item, button.dropdown-submenu-trigger');
            if (!overItem || overItem.closest('.dropdown-submenu-flyout')) return;
            const hitEl = document.elementFromPoint(e.clientX, e.clientY);
            if (hitEl && !overItem.contains(hitEl)) return;
            dropdownContent.querySelectorAll('.dropdown-submenu-flyout').forEach((flyout) => {
                if (!isSubmenuOpen(flyout)) return;
                if (getSubmenuTrigger(flyout) === overItem) {
                    clearSubmenuBridge(flyout);
                    return;
                }
                if (isPointerProtectedBySubmenuBridge(flyout, e.clientX, e.clientY)) return;
                closeSubmenu(flyout);
            });
        });
    }
}

function initAllSubmenus(root = document) {
    if (typeof document === 'undefined') return;
    const scope = root || document;
    const dropdownContainers = [];
    if (scope.matches?.('.dropdown')) dropdownContainers.push(scope);
    if (typeof scope.querySelectorAll === 'function') {
        dropdownContainers.push(...scope.querySelectorAll('.dropdown'));
    }
    dropdownContainers.forEach((dropdownContainer) => {
        const dropdownBtn = dropdownContainer.querySelector(':scope > .dropbtn, .dropbtn');
        const dropdownContent = dropdownContainer.querySelector(':scope > .dropdown-content, .dropdown-content');
        if (dropdownContent) {
            initSubmenuContainer(dropdownContainer, dropdownContent, dropdownBtn);
        }
    });
    const cgoDropdowns = [];
    if (scope.matches?.('cgo-dropdown')) cgoDropdowns.push(scope);
    if (typeof scope.querySelectorAll === 'function') {
        cgoDropdowns.push(...scope.querySelectorAll('cgo-dropdown'));
    }
    cgoDropdowns.forEach((cgoDrop) => {
        initSubmenuContainer(cgoDrop, cgoDrop, cgoDrop.querySelector('[slot="trigger"]'));
    });
}

function syncDropdownOverlay(content, trigger) {
    if (!content || content.dataset.cgoauthManaged === 'react') return;
    const isOpen = content.classList.contains('show');
    if (isOpen) {
        if (trigger) content._cgoAnchorTrigger = trigger;
        const parentDropdown = content.closest?.('.dropdown');
        if (parentDropdown) parentDropdown.classList.add('is-open');
        initSubmenuContainer(parentDropdown, content, trigger || content._cgoAnchorTrigger);
        syncSubmenuTriggerVisibility(content);
        if (content.id !== 'clock-menu' && typeof content.showPopover === 'function') {
            if (content.getAttribute('popover') !== 'manual') {
                content.setAttribute('popover', 'manual');
            }
            try {
                if (!content.matches(':popover-open')) content.showPopover();
            } catch {}
        }
        _activeDropdownPopovers.add(content);
        _ensureDropdownOverlaySync();
        if (_dropdownResizeObserver && !content._cgoResizeObserved) {
            content._cgoResizeObserved = true;
            try {
                _dropdownResizeObserver.observe(content);
            } catch {}
        }
        positionDropdownOverlay(content, trigger);
        requestAnimationFrame(() => positionDropdownOverlay(content, trigger));
    } else {
        closeAllSubmenus(content);
        _activeDropdownPopovers.delete(content);
        if (_dropdownResizeObserver && content._cgoResizeObserved) {
            content._cgoResizeObserved = false;
            try {
                _dropdownResizeObserver.unobserve(content);
            } catch {}
        }
        if (_activeDropdownPopovers.size === 0) _detachDropdownOverlaySync();
        const parentDropdown = content.closest?.('.dropdown');
        if (parentDropdown) parentDropdown.classList.remove('is-open');
        if (typeof content.hidePopover === 'function') {
            try {
                if (content.matches(':popover-open')) content.hidePopover();
            } catch {}
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
            closeAllSubmenus(el);
            el.classList.remove('show');
            syncDropdownOverlay(el);
        }
    });
    if (!exclude) {
        closeAllSubmenus(scope);
    }
}
function initDropdowns(root) {
    if (typeof document === 'undefined') return;
    root = root || document;
    _installDropdownClassObserver();
    root.querySelectorAll('.dropdown').forEach((dropdown) => {
        const trigger = dropdown.querySelector('.dropbtn');
        const content = dropdown.querySelector('.dropdown-content');
        if (!trigger || !content) return;
        initSubmenuContainer(dropdown, content, trigger);
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
                closeAllSubmenus(content);
                content.classList.remove('show');
                syncDropdownOverlay(content, trigger);
            }
        });
        if (!content._cgoMenuClickBound) {
            content._cgoMenuClickBound = true;
            content.addEventListener('click', (e) => {
                const path = e.composedPath ? e.composedPath() : [];
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
                if (e.target?.closest?.('.dropdown-submenu-trigger')) {
                    return;
                }
                const actionItem = e.target?.closest?.('a, button.dropdown-item');
                if (actionItem) {
                    closeAllSubmenus(content);
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
                        el.classList.contains('dropdown-submenu-flyout') ||
                        el.classList.contains('dropdown-notice-center') ||
                        el.classList.contains('cgopush-center-panel')),
            );
            if (!insideOpenDropdown) {
                _closeAll(document);
            }
        });
        target.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && closeTopmostSubmenu()) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    initAllSubmenus(root);
}

/* ───────── 主题设置行 + select 绑定 ───────── */
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
    if (!selectElement || selectElement._cgoThemeSelectBound) return;
    selectElement._cgoThemeSelectBound = true;
    const storageKey = getStorageKey();
    let saved = null;
    try {
        saved = window.localStorage.getItem(storageKey);
    } catch {}
    const initialValue = saved === 'light' ? 'light' : saved === 'dark' ? 'dark' : 'system';
    selectElement.setAttribute('value', initialValue);
    selectElement.addEventListener('cgo-change', (e) => {
        const value = e.detail?.value;
        if (value === 'system') {
            try {
                window.localStorage.removeItem(storageKey);
            } catch {}
            let dark = false;
            try {
                dark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
            } catch {}
            applyTheme(dark ? 'dark' : 'light');
        } else if (value === 'light' || value === 'dark') {
            try {
                window.localStorage.setItem(storageKey, value);
            } catch {}
            applyTheme(value);
        }
    });
}

/* ───────── 帮助弹窗 ───────── */
function showHelpModal(options) {
    if (typeof document === 'undefined') return;
    options = options || {};
    const title = options.title || '帮助与选项';
    const subtitle = options.subtitle || '';
    const config = getShimConfig(typeof window !== 'undefined' ? window : undefined);
    const branding = { ...config.branding, ...(options.branding || {}) };
    const safeIconPath = sanitizeUrl(options.iconPath || '');
    const iconHtml = safeIconPath ? '<img src="' + esc(safeIconPath) + '" class="help-icon-img" alt="Logo">' : '';
    const beianPath = sanitizeUrl(options.beianPath || branding.beianPath || '');
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
    closeBtn.type = 'button';
    closeBtn.className = 'dialog-close-btn';
    closeBtn.innerHTML = '&times;';
    const container = document.createElement('div');
    container.className = 'help-container';

    const headerHtml =
        '<div class="help-header">' +
        iconHtml +
        '<div class="help-title-group"><h3>' +
        esc(title) +
        '</h3>' +
        (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') +
        '</div></div>';
    const footerLinks = Array.isArray(branding.links)
        ? branding.links
              .filter((link) => link && link.href && link.label && sanitizeUrl(link.href))
              .map(
                  (link) =>
                      '<a href="' +
                      esc(sanitizeUrl(link.href)) +
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
    const footerHtml =
        branding.copyright || footerLinks || beianHtml
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

    overlay.style.opacity = '1';
    dialog.style.opacity = '1';
    dialog.style.transform = 'translate(-50%, -50%)';

    const themeSelect = dialog.querySelector('#js-theme-select');
    if (themeSelect) bindThemeSelect(themeSelect);

    const close = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
    };
    closeBtn.addEventListener('click', close);
    setTimeout(() => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    }, 100);
}

/* ───────── 验证码放大交互 ───────── */
function bindCaptchaZoom(zoomBtn, container, options) {
    if (typeof document === 'undefined') return null;
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
export function installGlobalShim(global = typeof window !== 'undefined' ? window : undefined) {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !global) return;
    getShimConfig(global);
    const CGO = global.CGO || {};
    CGO.Icons = ICONS;
    CGO.icon = icon;
    CGO.iconBtn = iconBtn;
    CGO.renderIcons = renderIcons;
    CGO.injectSprite = injectSprite;
    CGO.use = use;
    CGO.iconList = iconNames;
    CGO.initDropdowns = initDropdowns;
    CGO.initSubmenus = initAllSubmenus;
    CGO.submenu = {
        initAllSubmenus,
        openSubmenu,
        closeSubmenu,
        closeAllSubmenus,
        closeTopmostSubmenu,
        startSubmenuBridge,
        isPointInSafeTriangle,
    };
    CGO.positionDropdownOverlay = positionDropdownOverlay;
    CGO.syncDropdownOverlay = syncDropdownOverlay;
    CGO.getThemeSettingHTML = getThemeSettingHTML;
    CGO.bindThemeSelect = bindThemeSelect;
    CGO.showToast = showToast;
    CGO.showNoticePopup = showNoticePopup;
    CGO.showHelpModal = showHelpModal;
    CGO.generateCaptcha = generateCaptcha;
    CGO.bindCaptchaZoom = bindCaptchaZoom;
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
        setBgMode,
        getBgMode,
        setDefaultBgMode,
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
    CGO.setBgMode = setBgMode;
    CGO.getBgMode = getBgMode;
    CGO.setDefaultBgMode = setDefaultBgMode;
    CGO.initImgIconWrappers = initImgIconWrappers;
    global.CGO = CGO;

    global.ToolTheme = global.ToolTheme || {};
    global.ToolTheme.applyTheme = applyTheme;
    global.ToolTheme.setThemeColor = setThemeColor;
    global.ToolTheme.resetThemeColor = resetThemeColor;
    global.ToolTheme.getThemeColor = getThemeColor;
    global.ToolTheme.generateThemePalette = generateThemePalette;
    global.ToolTheme.setThemeColorStorageKey = setThemeColorStorageKey;
    global.ToolTheme.getThemeColorStorageKey = getThemeColorStorageKey;

    if (!global._cgoShimAutorunBound) {
        global._cgoShimAutorunBound = true;
        const autorun = () => {
            renderIcons();
            initDropdowns(document);
            bindLegacyThemeButton();
            initImgIconWrappers(document);
            autoUpgradeHeader(document);
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autorun, { once: true });
        } else {
            autorun();
        }
    }
}

export function initImgIconWrappers(root = typeof document !== 'undefined' ? document : null) {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !root) return;
    const markLoaded = (wrapper, img) => {
        wrapper.classList.add('loaded');
        if (img) img.classList.add('loaded');
    };
    const bindWrapper = (wrapper) => {
        if (!wrapper || wrapper.classList.contains('loaded')) return;
        const img = wrapper.querySelector('img');
        if (!img || img._cgoImgBound) return;
        img._cgoImgBound = true;
        if (img.complete) {
            markLoaded(wrapper, img);
        } else {
            img.addEventListener('load', () => markLoaded(wrapper, img), { once: true });
            img.addEventListener('error', () => markLoaded(wrapper, img), { once: true });
        }
    };

    root.querySelectorAll('.img-icon-wrapper').forEach(bindWrapper);

    if (typeof MutationObserver !== 'undefined' && root === document && !document._cgoImgIconObserver) {
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
        const target = document.documentElement || document.body;
        if (target) {
            observer.observe(target, { childList: true, subtree: true });
            document._cgoImgIconObserver = observer;
        }
    }
}
