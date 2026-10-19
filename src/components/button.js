import { LitElement, html, css } from 'lit';
import './icon.js';
import { hairlineRimLightRules, hairlineRimDarkRules } from '../styles/glass-shared.js';

/**
 * <cgo-button variant="info" size="sm" icon="save" loading>保存</cgo-button>
 * variant: primary | info(默认) | dark | danger | success | ghost
 * size:    sm | (默认) | lg | xl
 * 属性:    icon, icon-pos(left|right), disabled, loading, full, icon-only, color, text-color
 * 事件:    原生 click 透传（点击 host 即可）
 */
export class CgoButton extends LitElement {
    static properties = {
        variant: { type: String },
        size: { type: String },
        icon: { type: String },
        iconPos: { type: String, attribute: 'icon-pos' },
        disabled: { type: Boolean, reflect: true },
        loading: { type: Boolean, reflect: true },
        full: { type: Boolean, reflect: true },
        iconOnly: { type: Boolean, attribute: 'icon-only', reflect: true },
        pill: { type: Boolean, reflect: true },
        active: { type: Boolean, reflect: true },
        type: { type: String },
        color: { type: String },
        textColor: { type: String, attribute: 'text-color' },
        iconColor: { type: String, attribute: 'icon-color' },
    };

    static styles = css`
        :host {
            display: inline-flex;
            vertical-align: middle;
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
            /* Emil Kowalski 规范：显式声明光学与微交互过渡，无位移浮动 */
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
            button:hover:not([disabled]):not([loading])::before {
                opacity: 0.75;
            }
        }

        :host-context([data-theme='dark']) button::before {
            ${hairlineRimDarkRules}
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

        /* 按压微触感反馈：仅在点击时产生 scale(0.98) 弹性回馈，鼠标悬停完全取消位移上升 */
        button:active:not([disabled]):not([loading]) {
            transform: scale(0.98);
        }

        /* 焦点环指示器 */
        button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px var(--bg-color, #ffffff), 0 0 0 4px var(--primary-color, #006098);
        }
        :host-context([data-theme='dark']) button:focus-visible {
            box-shadow: 0 0 0 2px var(--bg-color, #1a1a1a), 0 0 0 4px var(--primary-hover, #0070b0);
        }

        :host([disabled]) button,
        :host([loading]) button {
            opacity: 0.55;
            cursor: not-allowed;
            pointer-events: none;
            transform: none !important;
            box-shadow: none;
        }

        /* ── 变体 1：Primary 主要按钮（纯正品牌色，同系统一）── */
        .v-primary {
            background-color: var(--primary-color, #006098);
            color: #ffffff !important;
            border-color: var(--primary-color, #006098);
            box-shadow: 0 1px 2px rgba(0, 96, 152, 0.2);
        }
        .v-primary.is-active {
            background-color: var(--primary-hover, #004f80);
            color: #ffffff !important;
            border-color: var(--primary-hover, #004f80);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        :host-context([data-theme='dark']) .v-primary {
            background-color: var(--primary-color, #0070b0);
            color: #ffffff !important;
            border-color: var(--primary-color, #0070b0);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        /* ── 变体 2：Info 次级按钮（标准次级中性，同系统一）── */
        .v-info {
            background-color: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #00263b);
            border-color: var(--border-color, #dee2e6);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .v-info.is-active {
            background-color: #dee2e6;
            border-color: #ced4da;
        }
        :host-context([data-theme='dark']) .v-info {
            background-color: var(--btn-info-bg, #262729);
            color: var(--text-main, #e5e8ea);
            border-color: var(--border-color, #383a3c);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }

        /* ── 变体 3：Dark 深色按钮 ── */
        .v-dark {
            background-color: #1a1a1c;
            color: #f0f2f5;
            border-color: #2e2f33;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        /* ── 变体 4：Danger 危险按钮 ── */
        .v-danger {
            background-color: var(--danger-color, #ea4335);
            color: #ffffff;
            border-color: var(--danger-color, #ea4335);
            box-shadow: 0 1px 2px rgba(234, 67, 53, 0.2);
        }

        /* ── 变体 5：Success 成功按钮 ── */
        .v-success {
            background-color: var(--success-color, #34a853);
            color: #ffffff;
            border-color: var(--success-color, #34a853);
            box-shadow: 0 1px 2px rgba(52, 168, 83, 0.2);
        }

        /* ── 变体 6：Warning 警示按钮 ── */
        .v-warning,
        .v-warn {
            background-color: var(--warning-color, #f59e0b);
            color: #ffffff;
            border-color: var(--warning-color, #f59e0b);
            box-shadow: 0 1px 2px rgba(245, 158, 11, 0.2);
        }

        /* ── 变体 7：Ghost 幽灵按钮 ── */
        .v-ghost {
            background-color: transparent;
            color: var(--primary-color, #006098);
            border-color: transparent;
            box-shadow: none;
        }
        .v-ghost::before {
            display: none;
        }
        :host-context([data-theme='dark']) .v-ghost {
            color: var(--primary-color, #4dabf7);
            border-color: transparent;
        }

        /* ── 自定义色按钮 ── */
        .v-custom {
            background-color: var(--cgo-button-bg);
            color: var(--cgo-button-fg, var(--btn-text, #fff));
            border-color: var(--cgo-button-border, var(--cgo-button-bg));
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        /* 鼠标精准悬停状态保护 (防止触屏点击后 Hover 样式永久黏着) */
        @media (hover: hover) and (pointer: fine) {
            .v-primary:hover {
                background-color: var(--primary-hover, #004f80);
                color: #ffffff !important;
                border-color: var(--primary-hover, #004f80);
                box-shadow: 0 2px 5px rgba(0, 96, 152, 0.25);
            }
            :host-context([data-theme='dark']) .v-primary:hover {
                background-color: var(--primary-hover, #0084d1);
                color: #ffffff !important;
                border-color: var(--primary-hover, #0084d1);
                box-shadow: 0 2px 6px rgba(0, 112, 176, 0.35);
            }
            .v-info:hover {
                background-color: var(--btn-info-hover, #e9ecef);
                border-color: var(--border-hover, #ced4da);
                color: var(--text-main, #00263b);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
            }
            :host-context([data-theme='dark']) .v-info:hover {
                background-color: var(--btn-info-hover, #323438);
                border-color: var(--border-hover, #44474b);
                color: #ffffff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
            }
            .v-dark:hover {
                background-color: #292a2e;
                border-color: #3e4046;
                color: #ffffff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
            }
            .v-danger:hover {
                background-color: var(--danger-hover, #d33828);
                border-color: var(--danger-hover, #d33828);
                box-shadow: 0 2px 5px rgba(234, 67, 53, 0.28);
            }
            .v-success:hover {
                background-color: var(--success-color, #34a853);
                border-color: var(--success-color, #34a853);
                box-shadow: 0 2px 5px rgba(52, 168, 83, 0.28);
            }
            .v-warning:hover,
            .v-warn:hover {
                background-color: #d97706;
                border-color: #d97706;
                box-shadow: 0 2px 5px rgba(245, 158, 11, 0.28);
            }
            .v-ghost:hover {
                background-color: var(--info-bg, #e7f3fb);
                color: var(--primary-hover, #004f80);
                border-color: transparent;
            }
            :host-context([data-theme='dark']) .v-ghost:hover {
                background-color: rgba(77, 171, 247, 0.12);
                color: #70bcfb;
                border-color: transparent;
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

        /* 胶囊形（筛选 / 控制栏 ctrl-btn）*/
        :host([pill]) button {
            height: 36px;
            padding: 0 18px;
            border-radius: var(--radius-full, 9999px);
            border: none;
            background-color: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #00263b);
            font-weight: 500;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        :host([pill]) button.is-active,
        :host([pill]) button.v-primary {
            background-color: var(--primary-color, #006098);
            color: #ffffff;
            box-shadow: 0 1px 2px rgba(0, 96, 152, 0.2);
        }
        :host-context([data-theme='dark']):host([pill]) button {
            background-color: var(--btn-info-bg, #262729);
            color: var(--text-main, #e5e8ea);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }
        :host-context([data-theme='dark']):host([pill]) button.is-active,
        :host-context([data-theme='dark']):host([pill]) button.v-primary {
            background-color: var(--primary-color, #0070b0);
            color: #ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        @media (hover: hover) and (pointer: fine) {
            :host([pill]) button:hover {
                background-color: var(--btn-info-hover, #e9ecef);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
            }
            :host([pill]) button.is-active:hover,
            :host([pill]) button.v-primary:hover {
                background-color: var(--primary-hover, #004f80);
                box-shadow: 0 2px 5px rgba(0, 96, 152, 0.25);
            }
            :host-context([data-theme='dark']):host([pill]) button:hover {
                background-color: var(--btn-info-hover, #323438);
                color: #ffffff;
            }
            :host-context([data-theme='dark']):host([pill]) button.is-active:hover,
            :host-context([data-theme='dark']):host([pill]) button.v-primary:hover {
                background-color: var(--primary-hover, #0084d1);
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
        this.addEventListener('click', this._onFormActionClick);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._onFormActionClick) {
            this.removeEventListener('click', this._onFormActionClick);
        }
    }

    render() {
        const rawVariant = this.variant === 'glass' ? 'info' : (this.variant || 'info');
        const variant = this.color ? 'custom' : rawVariant;
        const cls = `v-${variant} ${this.size ? 's-' + this.size : ''} ${this.active ? 'is-active' : ''}`;
        const style = this.color
            ? `--cgo-button-bg:${this.color};--cgo-button-border:${this.color};--cgo-button-fg:${this.textColor || 'var(--btn-text, #fff)'};`
            : '';
        const iconEl = this.icon
            ? html`
                  <cgo-icon name=${this.icon} size="18" color=${this.iconColor || ''}></cgo-icon>
              `
            : null;
        const label = html`
            <span class="btn-label"><slot></slot></span>
        `;
        return html`
            <button class=${cls} style=${style} type=${this.type} ?disabled=${this.disabled || this.loading}>
                ${this.loading
                ? html`
                          <span class="spin"></span>
                      `
                : null}
                ${!this.loading && this.iconPos !== 'right' ? iconEl : null}
                ${this.iconOnly && this.icon ? null : label}
                ${!this.loading && this.iconPos === 'right' ? iconEl : null}
            </button>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-button') || customElements.define('cgo-button', CgoButton);
}
