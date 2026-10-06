import { LitElement, html, css } from 'lit';
import { getDeepActiveElement } from '../utils/focus.js';

/**
 * <cgo-tooltip text="说明文字"><button>悬停我</button></cgo-tooltip>
 * 悬停或键盘聚焦到被包裹内容上时，于上方显示气泡；按 Esc 可临时隐藏。
 * 移植自 cgo_element.css §12 的 [data-tooltip]。
 */
export class CgoTooltip extends LitElement {
    static properties = {
        text: { type: String },
        placement: { type: String },
        _focused: { state: true },
        _dismissed: { state: true },
    };

    static styles = css`
        :host {
            position: relative;
            display: inline-flex;
        }
        .bubble {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            padding: 5px 10px;
            border-radius: var(--radius-xs, 4px);
            background: rgba(0, 0, 0, 0.82);
            color: #fff;
            font-size: var(--text-sm, 12px);
            font-family: var(--font-sans, system-ui, sans-serif);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--transition-base, 0.2s ease);
            z-index: 200;
        }
        .bubble.bottom {
            bottom: auto;
            top: calc(100% + 8px);
        }
        :host(:hover) .bubble,
        .bubble.focused {
            opacity: 1;
        }
        /* Esc 临时隐藏，优先级高于悬停 / 聚焦 */
        :host(:hover) .bubble.dismissed,
        .bubble.dismissed {
            opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
            .bubble {
                transition: none;
            }
        }
    `;

    constructor() {
        super();
        this.text = '';
        this.placement = 'top';
        this._focused = false;
        this._dismissed = false;
        this._onKeydown = this._onKeydown.bind(this);
        this.addEventListener('focusin', () => {
            // 只在键盘聚焦时显示，鼠标点击后不让气泡一直挂着
            let visible = true;
            try {
                const active = getDeepActiveElement();
                if (active && active.matches) visible = active.matches(':focus-visible');
            } catch (_) {}
            this._focused = visible;
            this._dismissed = false;
            this._listenEsc(true);
        });
        this.addEventListener('focusout', () => {
            this._focused = false;
            this._dismissed = false;
            if (!this.matches(':hover')) this._listenEsc(false);
        });
        this.addEventListener('pointerenter', () => {
            this._dismissed = false;
            this._listenEsc(true);
        });
        this.addEventListener('pointerleave', () => {
            this._dismissed = false;
            if (!this._focused) this._listenEsc(false);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._listenEsc(false);
    }

    /* 仅在气泡可能可见期间监听 Esc */
    _listenEsc(on) {
        if (typeof document === 'undefined') return;
        document.removeEventListener('keydown', this._onKeydown);
        if (on) document.addEventListener('keydown', this._onKeydown);
    }

    _onKeydown(e) {
        if (e.key === 'Escape') this._dismissed = true;
    }

    render() {
        const cls = [
            'bubble',
            this.placement === 'bottom' ? 'bottom' : '',
            this._focused ? 'focused' : '',
            this._dismissed ? 'dismissed' : '',
        ]
            .filter(Boolean)
            .join(' ');
        return html`
            <slot></slot>
            ${this.text
                ? html`
                      <span class=${cls} role="tooltip">${this.text}</span>
                  `
                : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tooltip') || customElements.define('cgo-tooltip', CgoTooltip);
}
