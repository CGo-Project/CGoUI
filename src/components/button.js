import { LitElement, html, css } from 'lit';
import './icon.js';
import { hairlineRimLightRules } from '../styles/glass-shared.js';

/**
 * <cgo-button variant="info" size="sm" icon="save" loading>保存</cgo-button>
 * variant: primary | info(默认) | dark | danger | success | warning | ghost
 * size:    sm | (默认) | lg | xl
 * 属性:    icon, icon-pos(left|right), disabled, loading, full, icon-only, pill, active, dot, type, color, text-color, icon-color
 * 事件:    原生 click 透传（点击 host 即可）
 */
export class CgoButton extends LitElement {
    static properties = {
        variant: { type: String, reflect: true },
        size: { type: String },
        icon: { type: String },
        iconPos: { type: String, attribute: 'icon-pos' },
        disabled: { type: Boolean, reflect: true },
        loading: { type: Boolean, reflect: true },
        full: { type: Boolean, reflect: true },
        iconOnly: { type: Boolean, attribute: 'icon-only', reflect: true },
        pill: { type: Boolean, reflect: true },
        active: { type: Boolean, reflect: true },
        dot: { type: Boolean, reflect: true },
        type: { type: String },
        color: { type: String },
        textColor: { type: String, attribute: 'text-color' },
        iconColor: { type: String, attribute: 'icon-color' },
    };

    static styles = css`
        :host {
            position: relative;
            display: inline-flex;
            vertical-align: middle;
        }
        :host([disabled]),
        :host([loading]) {
            pointer-events: none;
        }
        .btn-dot {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #ff3b30;
            box-shadow: 0 0 0 2px var(--bg-body, var(--bg-color, #ffffff));
            pointer-events: none;
            z-index: 5;
        }
        :host([full]) {
            display: flex;
            width: 100%;
        }
        button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: var(--radius-sm, 6px);
            border: none;
            cursor: pointer;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            font-size: var(--text-md, 0.9rem);
            font-weight: 500;
            line-height: 1;
            height: 34px;
            box-sizing: border-box;
            width: 100%;
            white-space: nowrap;
            user-select: none;
            overflow: hidden;
            isolation: isolate;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1),
                opacity var(--dur-fast, 140ms) ease;
        }

        /* 卡片同款精致 1px 双轴微光描边 (Layer 2 Masked 1px Hairline Rim Light) */
        button::before {
            ${hairlineRimLightRules}
        }
        @media (hover: hover) and (pointer: fine) {
            button:hover:not([disabled])::before {
                opacity: 0.75;
            }
        }

        :host([variant='primary']),
        :host([variant='danger']),
        :host([variant='success']),
        :host([variant='warning']),
        :host([variant='dark']) {
            color: #ffffff !important;
        }

        /* 保证按钮文字和图标在 Layer 3 (z-index: 3) 绝对锐利清晰 */
        button > *,
        .btn-label,
        ::slotted(*) {
            position: relative;
            z-index: 3;
            color: inherit;
        }

        .btn-label {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* 按压微触感反馈 */
        button:active:not([disabled]) {
            transform: scale(0.98);
        }

        /* 焦点环指示器 */
        button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px var(--cgo-focus-ring-offset, var(--bg-color, #ffffff)), 0 0 0 4px var(--primary-color, #006098);
        }

        :host([disabled]) button,
        :host([loading]) button {
            opacity: 0.55;
            cursor: not-allowed;
            pointer-events: none;
            transform: none !important;
            box-shadow: none;
        }

        /* ── 变体 1：Primary 主要按钮 ── */
        .v-primary {
            background-color: var(--primary-color, #006098);
            color: #ffffff !important;
            box-shadow: var(--cgo-shadow-control, 0 1px 2px rgba(0, 96, 152, 0.2));
        }
        .v-primary.is-active {
            background-color: var(--primary-hover, #004f80);
            color: #ffffff !important;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* ── 变体 2：Info 次级按钮 ── */
        .v-info {
            background-color: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #00263b);
            box-shadow: var(--cgo-shadow-control, 0 1px 2px rgba(0, 0, 0, 0.04));
        }
        .v-info.is-active {
            background-color: var(--cgo-btn-info-active, #dee2e6);
        }

        /* ── 变体 3：Dark 深色按钮 ── */
        .v-dark {
            background-color: #1a1a1c;
            color: #f0f2f5;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        /* ── 变体 4：Danger 危险按钮 ── */
        .v-danger {
            background-color: var(--danger-color, #ea4335);
            color: #ffffff;
            box-shadow: 0 1px 2px rgba(234, 67, 53, 0.2);
        }

        /* ── 变体 5：Success 成功按钮 ── */
        .v-success {
            background-color: var(--success-color, #34a853);
            color: #ffffff;
            box-shadow: 0 1px 2px rgba(52, 168, 83, 0.2);
        }

        /* ── 变体 6：Warning 警示按钮 ── */
        .v-warning,
        .v-warn {
            background-color: var(--warning-color, #f59e0b);
            color: #ffffff;
            box-shadow: 0 1px 2px rgba(245, 158, 11, 0.2);
        }

        /* ── 变体 7：Ghost 幽灵按钮 ── */
        .v-ghost {
            background-color: transparent;
            color: var(--primary-color, #006098);
            box-shadow: none;
        }
        .v-ghost::before {
            display: none;
        }

        /* ── 自定义色按钮 ── */
        .v-custom {
            background-color: var(--cgo-button-bg);
            color: var(--cgo-button-fg, var(--btn-text, #fff));
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        @media (hover: hover) and (pointer: fine) {
            .v-primary:hover {
                background-color: var(--primary-hover, #004f80);
                color: #ffffff !important;
                box-shadow: 0 2px 5px rgba(0, 96, 152, 0.25);
            }
            .v-info:hover {
                background-color: var(--btn-info-hover, #e9ecef);
                color: var(--text-main, #00263b);
                box-shadow: var(--cgo-shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.06));
            }
            .v-dark:hover {
                background-color: #292a2e;
                color: #ffffff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
            }
            .v-danger:hover {
                background-color: var(--danger-hover, #d33828);
                box-shadow: 0 2px 5px rgba(234, 67, 53, 0.28);
            }
            .v-success:hover {
                background-color: var(--success-hover, #2b9348);
                box-shadow: 0 2px 5px rgba(52, 168, 83, 0.28);
            }
            .v-warning:hover,
            .v-warn:hover {
                background-color: #d97706;
                box-shadow: 0 2px 5px rgba(245, 158, 11, 0.28);
            }
            .v-ghost:hover {
                background-color: var(--info-bg, #e7f3fb);
                color: var(--primary-hover, #004f80);
            }
            .v-custom:hover {
                filter: brightness(0.92);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
            }
        }

        /* 尺寸 */
        .s-sm {
            padding: 4px 10px;
            font-size: var(--text-sm, 12px);
            height: 28px;
        }
        .s-lg {
            padding: 10px 20px;
            font-size: 1rem;
            height: 44px;
        }
        .s-xl {
            padding: 14px 28px;
            font-size: 1.05rem;
            height: 52px;
        }

        /* 纯图标 */
        :host([icon-only]) button {
            width: 34px;
            height: 34px;
            padding: 0;
        }
        :host([icon-only]) .s-sm {
            width: 28px;
            height: 28px;
        }
        :host([icon-only]) .s-lg {
            width: 44px;
            height: 44px;
        }
        :host([icon-only]) .s-xl {
            width: 52px;
            height: 52px;
        }

        /* 胶囊形：只控制几何与激活态高光，不覆盖 primary/danger/success 等变体底色 */
        :host([pill]) button {
            height: 36px;
            padding: 0 18px;
            border-radius: var(--radius-full, 9999px);
            font-weight: 500;
        }
        :host([pill]) button.v-info.is-active {
            background-color: var(--primary-color, #006098);
            color: #ffffff;
            box-shadow: 0 1px 2px rgba(0, 96, 152, 0.2);
        }
        @media (hover: hover) and (pointer: fine) {
            :host([pill]) button.v-info.is-active:hover {
                background-color: var(--primary-hover, #004f80);
                color: #ffffff;
                box-shadow: 0 2px 5px rgba(0, 96, 152, 0.25);
            }
        }
        :host([pill]) .s-sm {
            height: 30px;
            padding: 0 14px;
        }

        .spin {
            width: 1.1em;
            height: 1.1em;
            border: 2px solid currentColor;
            border-top-color: transparent;
            border-radius: 50%;
            animation: cgo-spin 0.7s linear infinite;
        }
        @keyframes cgo-spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;

    constructor() {
        super();
        this.variant = 'info';
        this.size = '';
        this.icon = '';
        this.iconPos = 'left';
        this.disabled = false;
        this.loading = false;
        this.full = false;
        this.iconOnly = false;
        this.pill = false;
        this.active = false;
        this.dot = false;
        this.type = 'button';
        this.color = '';
        this.textColor = '';
        this.iconColor = '';
    }

    connectedCallback() {
        super.connectedCallback();
        this._onFormActionClick = (e) => {
            if (this.disabled || this.loading) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }
            if (e.defaultPrevented) return;
            if (this.type === 'submit') {
                const form = this.closest('form');
                if (form) {
                    if (typeof form.requestSubmit === 'function') {
                        form.requestSubmit();
                    } else {
                        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                    }
                }
            } else if (this.type === 'reset') {
                const form = this.closest('form');
                if (form) form.reset();
            }
        };
        this.addEventListener('click', this._onFormActionClick, true);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._onFormActionClick) {
            this.removeEventListener('click', this._onFormActionClick, true);
        }
    }

    updated(changed) {
        if (changed.has('color') || changed.has('textColor')) {
            if (this.color) {
                this.style.setProperty('--cgo-button-bg', this.color);
                this.style.setProperty('--cgo-button-border', this.color);
                this.style.setProperty('--cgo-button-fg', this.textColor || 'var(--btn-text, #fff)');
            } else {
                this.style.removeProperty('--cgo-button-bg');
                this.style.removeProperty('--cgo-button-border');
                this.style.removeProperty('--cgo-button-fg');
            }
        }
    }

    render() {
        const rawVariant = (this.variant === 'secondary' || this.variant === 'glass') ? 'info' : (this.variant || 'info');
        const variant = this.color ? 'custom' : rawVariant;
        const cls = `v-${variant} ${this.size ? 's-' + this.size : ''} ${this.active ? 'is-active' : ''}`;
        const iconEl = this.icon
            ? html`<cgo-icon name=${this.icon} size="18" color=${this.iconColor || ''}></cgo-icon>`
            : null;
        const label = html`<span class="btn-label"><slot></slot></span>`;
        return html`
            <button class=${cls} type=${this.type} ?disabled=${this.disabled || this.loading}>
                ${this.loading ? html`<span class="spin"></span>` : null}
                ${!this.loading && this.iconPos !== 'right' ? iconEl : null}
                ${this.iconOnly && this.icon ? null : label}
                ${!this.loading && this.iconPos === 'right' ? iconEl : null}
            </button>
            ${this.dot ? html`<span class="btn-dot" part="dot" aria-hidden="true"></span>` : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-button') || customElements.define('cgo-button', CgoButton);
}
