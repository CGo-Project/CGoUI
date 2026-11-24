/**
 * Shared floating-menu controller for <cgo-dropdown>, <cgo-admin-select>, and <cgo-toolbar-select>.
 * Provides global mutual exclusion, Escape/outside-click dismissal, Top Layer Popover support,
 * and rAF-throttled viewport positioning while at least one menu is open.
 */

const _openEntries = new Map(); // host -> { menuEl, triggerEl, opts }
let _listenersBound = false;
let _rafId = null;

function _position(host, entry) {
    const { menuEl, triggerEl, opts = {} } = entry;
    if (!menuEl || !triggerEl || !host.isConnected) return;
    const r = triggerEl.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;

    const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
    const vh = window.innerHeight || document.documentElement.clientHeight || 768;
    const gap = opts.gap ?? 8;
    const pad = opts.pad ?? 8;
    const matchTriggerWidth = Boolean(opts.matchTriggerWidth);
    const align = opts.align || 'left';

    if (matchTriggerWidth) {
        const minW = Math.max(opts.minWidth ?? 160, Math.round(r.width));
        menuEl.style.minWidth = `${minW}px`;
        menuEl.style.width = `${Math.round(r.width)}px`;
    }

    const menuW = menuEl.offsetWidth || opts.minWidth || 190;
    const menuH = Math.min(menuEl.offsetHeight || 220, opts.maxHeight ?? 420);

    const downTop = r.bottom + gap;
    const upBottom = vh - r.top + gap;
    const fitsDown = downTop + menuH <= vh - pad || vh - downTop >= r.top;

    if (fitsDown) {
        menuEl.style.top = `${Math.round(downTop)}px`;
        menuEl.style.bottom = 'auto';
    } else {
        menuEl.style.top = 'auto';
        menuEl.style.bottom = `${Math.round(upBottom)}px`;
    }

    menuEl.style.right = 'auto';
    let left;
    if (align === 'right') {
        left = r.right - menuW;
    } else if (align === 'center') {
        left = r.left + r.width / 2 - menuW / 2;
    } else {
        left = r.left;
    }
    const clampedLeft = Math.max(pad, Math.min(left, vw - menuW - pad));
    menuEl.style.left = `${Math.round(clampedLeft)}px`;

    const availH = fitsDown ? Math.max(120, vh - downTop - pad) : Math.max(120, r.top - gap - pad);
    menuEl.style.maxHeight = `${Math.round(Math.min(opts.maxHeight ?? 360, availH))}px`;
}

function _repositionAll() {
    if (_rafId) return;
    _rafId = requestAnimationFrame(() => {
        _rafId = null;
        for (const [host, entry] of _openEntries.entries()) {
            if (!host.isConnected) {
                _openEntries.delete(host);
                continue;
            }
            _position(host, entry);
        }
        if (_openEntries.size === 0) _unbindGlobalListeners();
    });
}

function _onOutsideClick(e) {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    for (const host of [..._openEntries.keys()]) {
        if (!path.includes(host)) {
            host.close?.();
        }
    }
}

function _onKeyDown(e) {
    if (e.key !== 'Escape') return;
    for (const host of [..._openEntries.keys()]) {
        host.close?.();
    }
}

function _bindGlobalListeners() {
    if (_listenersBound || typeof window === 'undefined' || typeof document === 'undefined') return;
    _listenersBound = true;
    document.addEventListener('click', _onOutsideClick);
    document.addEventListener('keydown', _onKeyDown);
    window.addEventListener('resize', _repositionAll, { passive: true });
    window.addEventListener('scroll', _repositionAll, { capture: true, passive: true });
}

function _unbindGlobalListeners() {
    if (!_listenersBound || typeof window === 'undefined' || typeof document === 'undefined') return;
    _listenersBound = false;
    document.removeEventListener('click', _onOutsideClick);
    document.removeEventListener('keydown', _onKeyDown);
    window.removeEventListener('resize', _repositionAll);
    window.removeEventListener('scroll', _repositionAll, true);
    if (_rafId) {
        cancelAnimationFrame(_rafId);
        _rafId = null;
    }
}

export function closeOtherFloatingMenus(currentHost) {
    for (const host of [..._openEntries.keys()]) {
        if (host !== currentHost) {
            host.close?.();
        }
    }
}

export function openFloatingMenu(host, menuEl, triggerEl, opts = {}) {
    closeOtherFloatingMenus(host);
    if (menuEl && typeof menuEl.showPopover === 'function') {
        try {
            if (menuEl.getAttribute('popover') !== 'manual') {
                menuEl.setAttribute('popover', 'manual');
            }
            if (!menuEl.matches(':popover-open')) menuEl.showPopover();
        } catch {}
    }
    const entry = { menuEl, triggerEl, opts };
    _openEntries.set(host, entry);
    _bindGlobalListeners();
    _position(host, entry);
    requestAnimationFrame(() => {
        if (_openEntries.has(host)) _position(host, entry);
    });
}

export function closeFloatingMenu(host, menuEl) {
    _openEntries.delete(host);
    if (menuEl && typeof menuEl.hidePopover === 'function') {
        try {
            if (menuEl.matches(':popover-open')) menuEl.hidePopover();
        } catch {}
    }
    if (_openEntries.size === 0) _unbindGlobalListeners();
}
