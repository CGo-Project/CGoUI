import { LitElement, html, css } from 'lit';
import './icon.js';

export class CgoAdminSelect extends LitElement {
    static properties = {
        state: { type: String, reflect: true },
        label: { type: String },
        open: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
            min-width: 136px;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .select {
            display: grid;
            grid-template-columns: 9px minmax(0, 1fr) 18px;
            align-items: center;
            gap: 8px;
            width: 100%;
            height: 34px;
            padding: 0 10px;
            border-radius: var(--radius-xs, 4px);
            border: 1px solid var(--permission-inherit-border, #d2dbe6);
            background: var(--permission-inherit-soft, #f2f5f8);
            color: var(--text-main, #00263b);
            box-sizing: border-box;
            font-size: 13px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
            font-family: var(--font-sans, system-ui, sans-serif);
            transition:
                border-color var(--transition-base, 0.2s ease),
                background var(--transition-base, 0.2s ease),
                box-shadow var(--transition-base, 0.2s ease);
        }
        .select:hover {
            border-color: var(--permission-inherit, #64748b);
        }
        .label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: var(--permission-inherit, #64748b);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-inherit, #64748b) 14%, transparent);
            flex-shrink: 0;
        }
        :host([state='enabled']) .select {
            border-color: var(--permission-enabled-border, #badfc8);
            background: var(--permission-enabled-soft, #edf8f1);
        }
        :host([state='enabled']) .select:hover {
            border-color: var(--permission-enabled, #16803d);
        }
        :host([state='enabled']) .dot {
            background: var(--permission-enabled, #16803d);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-enabled, #16803d) 14%, transparent);
        }
        :host([state='disabled']) .select {
            border-color: var(--permission-disabled-border, #b9c5d4);
            background: var(--permission-disabled-soft, #f0f4f8);
        }
        :host([state='disabled']) .select:hover {
            border-color: var(--permission-disabled, #52637a);
        }
        :host([state='disabled']) .dot {
            background: var(--permission-disabled, #52637a);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-disabled, #52637a) 14%, transparent);
        }
        :host([state='hidden']) .select {
            border-color: var(--permission-hidden-border, #e58f8f);
            background: var(--permission-hidden-soft, #fff1f1);
        }
        :host([state='hidden']) .select:hover {
            border-color: var(--permission-hidden, #c62828);
        }
        :host([state='hidden']) .dot {
            background: var(--permission-hidden, #c62828);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-hidden, #c62828) 14%, transparent);
        }
        .arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--text-main, #00263b);
            transition: transform var(--transition-base, 0.2s ease);
            flex-shrink: 0;
        }
        :host([open]) .arrow {
            transform: rotate(180deg);
        }
        .menu {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            right: 0;
            z-index: 600;
            padding: 6px;
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-sm, 6px);
            background: var(--card-bg, #fff);
            box-shadow: var(--shadow-xl, 0 18px 46px rgba(16, 32, 51, 0.16));
            display: none;
        }
        :host([open]) .menu {
            display: block;
        }
        .option {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            border: 0;
            border-radius: var(--radius-xs, 4px);
            background: transparent;
            color: var(--text-main, #00263b);
            padding: 8px 9px;
            font: inherit;
            font-size: 12px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
        }
        .option:hover,
        .option[aria-selected='true'] {
            background: var(--btn-info-hover, #e9ecef);
        }
        .option.enabled[aria-selected='true'] {
            background: var(--permission-enabled-soft, #edf8f1);
            color: var(--permission-enabled, #16803d);
        }
        .option.hidden[aria-selected='true'] {
            background: var(--permission-hidden-soft, #fff1f1);
            color: var(--permission-hidden, #c62828);
        }
        .option .dot {
            width: 8px;
            height: 8px;
            box-shadow: none;
        }
        .option.inherit .dot {
            background: var(--permission-inherit, #64748b);
        }
        .option.enabled .dot {
            background: var(--permission-enabled, #16803d);
        }
        .option.disabled .dot {
            background: var(--permission-disabled, #52637a);
        }
        .option.hidden .dot {
            background: var(--permission-hidden, #c62828);
        }
    `;

    constructor() {
        super();
        this.state = 'inherit';
        this.label = '';
        this.open = false;
        this._onOutside = this._onOutside.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('click', this._onOutside);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('click', this._onOutside);
    }

    _onOutside(event) {
        if (!this.contains(event.target)) this.open = false;
    }

    _options() {
        return [
            { state: 'inherit', label: '继承权限' },
            { state: 'enabled', label: '允许访问' },
            { state: 'disabled', label: '拒绝访问' },
            { state: 'hidden', label: '隐藏入口' },
        ];
    }

    _current() {
        return this._options().find((item) => item.state === this.state) || this._options()[0];
    }

    _select(option) {
        this.state = option.state;
        this.label = option.label;
        this.open = false;
        this.dispatchEvent(new CustomEvent('cgo-admin-change', { detail: option, bubbles: true, composed: true }));
    }

    render() {
        const current = this.label ? { state: this.state, label: this.label } : this._current();
        return html`
            <button
                class="select"
                type="button"
                @click=${(event) => {
                    event.stopPropagation();
                    this.open = !this.open;
                }}
            >
                <span class="dot"></span>
                <span class="label">${current.label}</span>
                <cgo-icon class="arrow" name="chevron-down" size="18" aria-hidden="true"></cgo-icon>
            </button>
            <div class="menu">
                ${this._options().map(
                    (option) => html`
                        <button
                            class="option ${option.state}"
                            type="button"
                            aria-selected=${option.state === this.state}
                            @click=${() => this._select(option)}
                        >
                            <span class="dot"></span>
                            ${option.label === '继承权限'
                                ? '继承 (Inherit)'
                                : option.label === '允许访问'
                                  ? '允许 (Allow)'
                                  : option.label === '拒绝访问'
                                    ? '拒绝 (Deny)'
                                    : '隐藏 (Hide)'}
                        </button>
                    `
                )}
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-admin-select') || customElements.define('cgo-admin-select', CgoAdminSelect);
}
