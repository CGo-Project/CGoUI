import { LitElement, html, css } from 'lit';
import './icon.js';

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
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 6px 12px;
            border-radius: var(--radius-xs, 4px);
            border: 1px solid transparent;
            cursor: pointer;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: var(--text-md, 0.9rem);
            font-weight: 500;
            line-height: 1;
            height: 34px;
            box-sizing: border-box;
            width: 100%;
            white-space: nowrap;
            transition: all var(--transition-base, 0.2s ease);
            user-select: none;
        }
        button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 96, 152, 0.3);
        }
        :host([disabled]) button,
        :host([loading]) button {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* 变体 */
        .v-primary {
            background: var(--primary-color, #006098);
            color: var(--btn-text, #fff);
            border-color: var(--primary-color, #006098);
        }
        .v-primary:hover {
            background: var(--primary-hover, #004f80);
            border-color: var(--primary-hover, #004f80);
        }
        .v-primary.is-active {
            background: var(--primary-hover, #004f80);
            border-color: var(--primary-hover, #004f80);
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .v-info {
            background: var(--btn-info-bg, #f1f3f5);
            color: var(--btn-info-text, #333);
            border-color: var(--border-color, #dee2e6);
        }
        .v-info:hover {
            background: var(--btn-info-hover, #e9ecef);
            color: var(--text-main, #00263b);
        }
        .v-dark {
            background: var(--cgo-btn-dark-bg, #131313);
            color: #dee2e6;
            border-color: var(--cgo-btn-dark-border, var(--cgo-btn-dark-bg, #333333));
        }
        .v-dark:hover {
            background: var(--cgo-btn-dark-hover-bg, #1a1a1a);
            border-color: var(--cgo-btn-dark-hover-border, var(--cgo-btn-dark-hover-bg, #333333));
        }
        .v-danger {
            background: var(--danger-color, #ea4335);
            color: #fff;
            border-color: var(--danger-color, #ea4335);
        }
        .v-danger:hover {
            background: var(--danger-hover, #ff5252);
            border-color: var(--danger-hover, #ff5252);
        }
        .v-success {
            background: var(--success-color, #34a853);
            color: #fff;
            border-color: var(--success-color, #34a853);
        }
        .v-success:hover {
            filter: brightness(1.1);
        }
        .v-warning,
        .v-warn {
            background: var(--warning-color, #f59e0b);
            color: #fff;
            border-color: var(--warning-color, #f59e0b);
        }
        .v-warning:hover,
        .v-warn:hover {
            filter: brightness(1.08);
        }
        .v-ghost {
            background: transparent;
            color: var(--primary-color, #006098);
            border-color: var(--primary-color, #006098);
        }
        .v-ghost:hover {
            background: var(--info-bg, #e7f3fb);
        }
        .v-custom {
            background: var(--cgo-button-bg);
            color: var(--cgo-button-fg, var(--btn-text, #fff));
            border-color: var(--cgo-button-border, var(--cgo-button-bg));
        }
        .v-custom:hover {
            filter: brightness(1.06);
        }
        .v-glass {
            background: var(--glass-bg, rgba(255, 255, 255, 0.7));
            color: var(--text-main, #00263b);
            border-color: var(--glass-border, rgba(255, 255, 255, 0.4));
            box-shadow: 0 2px 8px rgba(0, 38, 59, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
            backdrop-filter: var(--glass-backdrop-blur, none);
            -webkit-backdrop-filter: var(--glass-backdrop-blur, none);
        }
        .v-glass:hover {
            background: var(--glass-bg-hover, rgba(255, 255, 255, 0.85));
            box-shadow: 0 4px 14px rgba(0, 38, 59, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95);
            transform: translateY(-1px);
        }
        :host-context([data-theme='dark']) .v-glass {
            color: var(--text-main, #f0f2f5);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        :host-context([data-theme='dark']) .v-glass:hover {
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18);
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
            padding: 0 20px;
            border-radius: var(--radius-full, 9999px);
            background: var(--btn-info-bg, #f1f3f5);
            border: 1px solid var(--border-color, #dee2e6);
            color: var(--text-main, #00263b);
            font-weight: 500;
        }
        :host([pill]) button:hover {
            background: var(--btn-info-hover, #e9ecef);
        }
        :host([pill]) button.is-active,
        :host([pill]) button.v-primary {
            background: var(--primary-color, #006098);
            border-color: var(--primary-color, #006098);
            color: var(--btn-text, #fff);
        }
        :host([pill]) button.is-active:hover,
        :host([pill]) button.v-primary:hover {
            background: var(--primary-hover, #004f80);
            border-color: var(--primary-hover, #004f80);
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

    render() {
        const variant = this.color ? 'custom' : this.variant;
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
            <slot></slot>
        `;
        return html`
            <button class=${cls} style=${style} type=${this.type} ?disabled=${this.disabled || this.loading}>
                ${this.loading
                ? html`
                          <span class="spin"></span>
                      `
                : null}
                ${!this.loading && this.iconPos !== 'right' ? iconEl : null} ${this.iconOnly ? null : label}
                ${!this.loading && this.iconPos === 'right' ? iconEl : null}
            </button>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-button') || customElements.define('cgo-button', CgoButton);
}
