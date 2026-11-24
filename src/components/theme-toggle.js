import { LitElement, html, css } from 'lit';
import { hairlineRimLightRules } from '../styles/glass-shared.js';
import { ICONS } from '../icons/icons.js';
import { currentTheme, toggleTheme, resetToSystem, setStorageKey } from '../theme.js';

/**
 * <cgo-theme-toggle storage-key="app-theme"></cgo-theme-toggle>
 * 主题切换按钮：点击切换明暗，长按 800ms 恢复跟随系统。
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
            vertical-align: middle;
        }
        button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            padding: 0;
            border-radius: var(--radius-xs, 4px);
            border: none;
            background: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #00263b);
            cursor: pointer;
            box-sizing: border-box;
            isolation: isolate;
            overflow: hidden;
            box-shadow: var(--cgo-shadow-control, 0 1px 2px rgba(0, 0, 0, 0.04));
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1);
            -webkit-tap-highlight-color: transparent;
        }

        /* 液态玻璃 Layer 2 精致 1px 双轴微光描边 */
        button::before {
            ${hairlineRimLightRules}
        }

        @media (hover: hover) and (pointer: fine) {
            button:hover {
                background: var(--btn-info-hover, #e9ecef);
                box-shadow: var(--cgo-shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.06));
            }
            button:hover::before {
                opacity: 0.75;
            }
        }

        button:active {
            transform: scale(0.98);
            transition: transform 100ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 纯平 flat 模式回退 */
        :host([glass-mode='flat']) button::before,
        :host([glass-mode='none']) button::before {
            display: none;
        }
        :host([glass-mode='flat']) button,
        :host([glass-mode='none']) button {
            border: 1px solid var(--border-color, #dee2e6);
            box-shadow: none;
        }

        svg {
            position: relative;
            z-index: 3;
            width: 20px;
            height: 20px;
            fill: currentColor;
            pointer-events: none;
            transition:
                opacity 140ms ease-out,
                transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        svg.icon-enter {
            animation: iconEnter 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes iconEnter {
            from {
                opacity: 0;
                transform: rotate(-60deg) scale(0.88);
            }
            to {
                opacity: 1;
                transform: rotate(0deg) scale(1);
            }
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
            transition:
                opacity 160ms cubic-bezier(0.16, 1, 0.3, 1),
                transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
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
        this._tipTimer = null;
        this._animTimer = null;
        this._isLongPress = false;
        this._iconAnimating = false;
        this._onThemeChange = (e) => {
            const nextTheme = e?.detail?.theme || currentTheme();
            if (nextTheme !== this._theme) {
                this._sync(nextTheme);
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.storageKey) setStorageKey(this.storageKey);
        this._theme = currentTheme();
        if (typeof window !== 'undefined') {
            window.addEventListener('cgo-theme-change', this._onThemeChange);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._cancel();
        if (this._tipTimer) {
            clearTimeout(this._tipTimer);
            this._tipTimer = null;
        }
        if (this._animTimer) {
            clearTimeout(this._animTimer);
            this._animTimer = null;
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('cgo-theme-change', this._onThemeChange);
        }
    }

    _sync(theme) {
        if (this._animTimer) clearTimeout(this._animTimer);
        this._iconAnimating = true;
        this._theme = theme;
        this.requestUpdate();
        this._animTimer = setTimeout(() => {
            this._iconAnimating = false;
            this._animTimer = null;
            this.requestUpdate();
        }, 300);
    }

    _start = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        this._cancel();
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
        if (this._tipTimer) clearTimeout(this._tipTimer);
        this._tipTimer = setTimeout(() => {
            this._tip = '';
            this._tipTimer = null;
            this.requestUpdate();
        }, 2000);
    }

    render() {
        const path = this._theme === 'dark' ? ICONS['moon'].d : ICONS['sun'].d;
        const tpl = document.createElement('template');
        tpl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" class="${this._iconAnimating ? 'icon-enter' : ''}">${path}</svg>`;
        return html`
            <button
                type="button"
                title="切换明暗 · 长按恢复系统"
                aria-label="切换明暗模式"
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
