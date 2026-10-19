import { LitElement, html, css } from 'lit';
import { hairlineRimLightRules } from '../styles/glass-shared.js';
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
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1);
            -webkit-tap-highlight-color: transparent;
        }

        /* 液态玻璃 Layer 2 精致 1px 双轴微光描边 (Hairline Rim Light)，跟随 4px r角 */
        button::before {
            ${hairlineRimLightRules}
        }

        @media (hover: hover) and (pointer: fine) {
            button:hover {
                background: var(--btn-info-hover, #e9ecef);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
            }
            button:hover::before {
                opacity: 0.75;
            }
        }

        /* 物理微触感反馈：按压 scale(0.98)，悬停零位移 */
        button:active {
            transform: scale(0.98);
            transition: transform 100ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 暗色主题深度适配 */
        :host([data-theme='dark']) button,
        :host-context([data-theme='dark']) button {
            background: var(--btn-info-bg, #262729);
            color: var(--text-main, #e5e8ea);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }

        :host([data-theme='dark']) button::before,
        :host-context([data-theme='dark']) button::before {
            background:
                linear-gradient(to bottom,
                    rgba(255, 255, 255, 0.33) 0,
                    rgba(255, 255, 255, 0.12) 1px,
                    rgba(255, 255, 255, 0) 6px,
                    rgba(0, 0, 0, 0.08) 100%);
        }

        @media (hover: hover) and (pointer: fine) {
            :host([data-theme='dark']) button:hover,
            :host-context([data-theme='dark']) button:hover {
                background: var(--btn-info-hover, #323438);
                color: #ffffff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
            }
        }

        /* 纯平 flat 模式回退 */
        :host([glass-mode='flat']) button::before,
        :host-context([glass-mode='flat']) button::before,
        :host([glass-mode='none']) button::before,
        :host-context([glass-mode='none']) button::before {
            display: none;
        }
        :host([glass-mode='flat']) button,
        :host-context([glass-mode='flat']) button {
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
            /* C-07: 图标切换时旋转淡入动效，利落紧凑 */
            transition:
                opacity 140ms ease-out,
                transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* C-07: 切换中：旋转 90° 缩放退出，避免极小缩放 */
        svg.icon-exit {
            opacity: 0;
            transform: rotate(90deg) scale(0.85);
        }
        /* C-07: 新图标旋转进入 */
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
        this._isLongPress = false;
        this._iconAnimating = false; /* C-07: 图标动画状态 */
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.storageKey) setStorageKey(this.storageKey);
    }

    _sync(theme) {
        this._iconAnimating = true;
        this._theme = theme;
        this.requestUpdate();
        /* C-07: 动画完成后重置动画状态 */
        setTimeout(() => { this._iconAnimating = false; this.requestUpdate(); }, 300);
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
        tpl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" class="${this._iconAnimating ? 'icon-enter' : ''}">${path}</svg>`;
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
