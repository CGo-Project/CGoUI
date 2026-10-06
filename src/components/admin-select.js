import { LitElement, html, css } from 'lit';
import './icon.js';
import { PopupController } from '../utils/popup.js';

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
        .select:focus-visible {
            outline: 2px solid var(--focus-ring, #00263b);
            outline-offset: 2px;
        }
        .option:focus-visible {
            outline: 2px solid var(--focus-ring, #00263b);
            outline-offset: -2px;
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
        // 由 _select 自动写入的标签及其对应的 state，用来判断标签是否已过期
        this._autoLabel = '';
        this._autoLabelState = '';
        // 互斥、点击外部关闭与 Esc 由公共 PopupController 处理
        this._popup = new PopupController(this, {
            close: () => {
                this.open = false;
            },
            getTrigger: () => this.shadowRoot && this.shadowRoot.querySelector('.select'),
        });
    }

    willUpdate(changed) {
        // 选过一次后 label 会被写成内置文案；宿主之后再改 state 时让它跟着更新，避免显示旧文字
        if (changed.has('state') && this.label && this.label === this._autoLabel && this._autoLabelState !== this.state) {
            const current = this._current();
            this.label = current.label;
            this._autoLabel = current.label;
            this._autoLabelState = current.state;
        }
    }

    updated(changed) {
        if (!changed.has('open')) return;
        if (this.open) {
            this._popup.opened();
            // 展开后把焦点移到当前选中的选项
            const options = this._optionEls();
            const index = this._options().findIndex((item) => item.state === this.state);
            const target = options[index >= 0 ? index : 0];
            if (target) target.focus({ preventScroll: true });
        } else {
            this._popup.closed();
        }
    }

    _optionEls() {
        return [...this.shadowRoot.querySelectorAll('.option')];
    }

    _onMenuKeydown(e) {
        const els = this._optionEls();
        const current = els.indexOf(this.shadowRoot.activeElement);
        let next;
        if (e.key === 'ArrowDown') next = (current + 1) % els.length;
        else if (e.key === 'ArrowUp') next = (current - 1 + els.length) % els.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = els.length - 1;
        else if (e.key === 'Tab') {
            // 选项不在 Tab 序列里：收起并回到触发器，再由浏览器继续正常的 Tab 移动
            this.open = false;
            this._popup.restoreFocus();
            return;
        } else return;
        e.preventDefault();
        if (els[next]) els[next].focus();
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
        this._autoLabel = option.label;
        this._autoLabelState = option.state;
        this.open = false;
        this._popup.restoreFocus();
        this.dispatchEvent(new CustomEvent('cgo-admin-change', { detail: option, bubbles: true, composed: true }));
    }

    render() {
        const current = this.label ? { state: this.state, label: this.label } : this._current();
        return html`
            <button
                class="select"
                type="button"
                aria-haspopup="listbox"
                aria-expanded=${this.open ? 'true' : 'false'}
                @click=${() => {
                    this.open = !this.open;
                }}
            >
                <span class="dot" aria-hidden="true"></span>
                <span class="label">${current.label}</span>
                <cgo-icon class="arrow" name="chevron-down" size="18" aria-hidden="true"></cgo-icon>
            </button>
            <div class="menu" role="listbox" aria-label=${this.getAttribute('aria-label') || '权限'} @keydown=${this._onMenuKeydown}>
                ${this._options().map(
                    (option) => html`
                        <button
                            class="option ${option.state}"
                            type="button"
                            role="option"
                            tabindex="-1"
                            aria-selected=${option.state === this.state ? 'true' : 'false'}
                            @click=${() => this._select(option)}
                        >
                            <span class="dot" aria-hidden="true"></span>
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
