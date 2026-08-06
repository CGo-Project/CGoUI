import { LitElement, html, css } from 'lit';
import { ICONS } from '../icons/icons.js';
import { currentTheme, toggleTheme, resetToSystem, setStorageKey, getStorageKey } from '../theme.js';

/**
 * <cgo-theme-toggle storage-key="vitool_app-theme"></cgo-theme-toggle>
 * 主题切换按钮：点击切换明暗，长按 800ms 恢复跟随系统。
 * 移植自 cgoui/cgo_theme.js 的按钮交互（解耦了固定 id，改为组件自身）。
 */
export class CgoThemeToggle extends LitElement {
    static properties = {
        storageKey: { type: String, attribute: 'storage-key' },
        _theme: { state: true },
        _tip: { state: true },
    };

    static styles = css`
        :host {
            display: inline-flex;
        }
        button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            padding: 0;
            border-radius: var(--radius-xs, 4px);
            border: 1px solid var(--border-color, #dee2e6);
            background: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #00263b);
            cursor: pointer;
            transition: all var(--transition-base, 0.2s ease);
            -webkit-tap-highlight-color: transparent;
        }
        button:hover {
            background: var(--btn-info-hover, #e9ecef);
        }
        svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
            pointer-events: none;
        }
        .tip {
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            background: rgba(0, 0, 0, 0.82);
            color: #fff;
            padding: 8px 16px;
            border-radius: var(--radius-full, 9999px);
            font-size: 13px;
            pointer-events: none;
            z-index: 11000;
            opacity: 0;
            transition: all 0.3s ease;
            white-space: nowrap;
            box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
        }
        .tip.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    `;

    constructor() {
        super();
        this.storageKey = '';
        this._theme = currentTheme();
        this._tip = '';
        this._pressTimer = null;
        this._isLongPress = false;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.storageKey) setStorageKey(this.storageKey);
    }

    _sync(theme) {
        this._theme = theme;
    }

    _start = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        this._isLongPress = false;
        this._pressTimer = setTimeout(() => {
            this._isLongPress = true;
            resetToSystem();
            this._showTip('已恢复系统明暗模式');
            if (navigator.vibrate) navigator.vibrate(50);
        }, 800);
    };
    _cancel = () => {
        if (this._pressTimer) {
            clearTimeout(this._pressTimer);
            this._pressTimer = null;
        }
    };
    _click = (e) => {
        if (this._isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            this._isLongPress = false;
            return;
        }
        toggleTheme();
    };
    _showTip(text) {
        this._tip = text;
        this.requestUpdate();
        clearTimeout(this._tipTimer);
        this._tipTimer = setTimeout(() => {
            this._tip = '';
        }, 2000);
    }

    render() {
        const path = this._theme === 'dark' ? ICONS['moon'].d : ICONS['sun'].d;
        const tpl = document.createElement('template');
        tpl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
        return html`
            <button
                title="切换明暗 · 长按恢复系统"
                @pointerdown=${this._start}
                @pointerup=${this._cancel}
                @pointerleave=${this._cancel}
                @pointercancel=${this._cancel}
                @click=${this._click}
                @contextmenu=${(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                ${tpl.content.cloneNode(true)}
            </button>
            ${this._tip
                ? html`
                      <div class="tip show">${this._tip}</div>
                  `
                : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-theme-toggle') || customElements.define('cgo-theme-toggle', CgoThemeToggle);
}
