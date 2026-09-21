import { LitElement, html, css } from 'lit';
import { ICONS } from '../icons/icons.js';
import { getHeaderMode, toggleHeaderMode, setHeaderMode, setHeaderModeStorageKey } from '../theme.js';

/**
 * <cgo-header-toggle storage-key="custom_header_mode"></cgo-header-toggle>
 * 顶栏模式切换按钮：
 * - 点击在「经典吸顶顶栏 (classic)」与「悬浮双岛菜单栏 (floating)」之间平滑切换；
 * - 长按 800ms 恢复默认吸顶模式；
 * - 自动同步页面中所有 cgo-header-toggle 实例与 localStorage。
 */
export class CgoHeaderToggle extends LitElement {
    static properties = {
        storageKey: { type: String, attribute: 'storage-key' },
        _mode: { state: true },
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
            box-sizing: border-box;
        }
        button:hover {
            background: var(--btn-info-hover, #e9ecef);
        }
        button.is-floating {
            background: var(--primary-color, #00263b);
            color: var(--btn-text, #ffffff);
            border-color: var(--primary-color, #00263b);
        }
        button.is-floating:hover {
            background: var(--primary-hover, #004060);
        }
        svg {
            width: 18px;
            height: 18px;
            fill: currentColor;
            pointer-events: none;
            transition: transform 0.2s ease;
        }
        button:active svg {
            transform: scale(0.9);
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
            box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.12));
        }
        .tip.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    `;

    constructor() {
        super();
        this.storageKey = '';
        this._mode = 'classic';
        this._tip = '';
        this._pressTimer = null;
        this._isLongPress = false;
        this._onModeChange = (e) => {
            if (e && e.detail && e.detail.mode) {
                this._mode = e.detail.mode;
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.storageKey) setHeaderModeStorageKey(this.storageKey);
        this._mode = getHeaderMode();
        if (typeof window !== 'undefined') {
            window.addEventListener('cgo-header-mode-change', this._onModeChange);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (typeof window !== 'undefined') {
            window.removeEventListener('cgo-header-mode-change', this._onModeChange);
        }
    }

    _sync(mode) {
        this._mode = mode;
        this.requestUpdate();
    }

    _start = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        this._isLongPress = false;
        this._pressTimer = setTimeout(() => {
            this._isLongPress = true;
            setHeaderMode('classic');
            this._showTip('已恢复默认吸顶顶栏');
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
        const next = toggleHeaderMode();
        this._showTip(next === 'floating' ? '已启用悬浮菜单栏' : '已恢复吸顶顶栏');
    };

    _showTip(text) {
        this._tip = text;
        this.requestUpdate();
        clearTimeout(this._tipTimer);
        this._tipTimer = setTimeout(() => {
            this._tip = '';
            this.requestUpdate();
        }, 2000);
    }

    render() {
        const isFloating = this._mode === 'floating';
        // 处于吸顶状态时显示 unpin-angle 图标提示可解脱固定为悬浮；处于悬浮状态时显示 pin-angle 提示可重新固定吸顶
        const iconDef = isFloating ? (ICONS['pin-angle'] || ICONS['pin']) : (ICONS['unpin-angle'] || ICONS['window']);
        const path = iconDef ? iconDef.d : '';
        const viewBox = (iconDef && iconDef.viewBox) || '0 0 24 24';
        const titleText = isFloating ? '切换为吸顶顶栏 · 长按重置' : '切换为悬浮菜单栏 · 长按重置';

        const tpl = document.createElement('template');
        tpl.innerHTML = `<svg viewBox="${viewBox}" aria-hidden="true">${path}</svg>`;

        return html`
            <button
                class="${isFloating ? 'is-floating' : ''}"
                title="${titleText}"
                aria-label="${titleText}"
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
    customElements.get('cgo-header-toggle') || customElements.define('cgo-header-toggle', CgoHeaderToggle);
}
