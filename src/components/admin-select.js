import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import './icon.js';
import {
    hairlineRimLightRules,
    glassRefractionStyles,
    tierBPanelUnderlayRules,
    tierBRimWeakRules,
} from '../styles/glass-shared.js';
import { openFloatingMenu, closeFloatingMenu, closeOtherFloatingMenus } from '../utils/floating-menu.js';

export class CgoAdminSelect extends LitElement {
    static properties = {
        state: { type: String, reflect: true },
        label: { type: String },
        open: { type: Boolean, reflect: true },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
        disabled: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
            min-width: 136px;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            vertical-align: middle;
        }

        .select {
            position: relative;
            display: grid;
            grid-template-columns: 9px minmax(0, 1fr) 18px;
            align-items: center;
            gap: 8px;
            width: 100%;
            height: 34px;
            padding: 0 10px;
            border-radius: var(--radius-sm, 6px);
            border: none !important;
            outline: none !important;
            background: var(--permission-inherit-soft, #f2f5f8);
            color: var(--text-main, #00263b);
            box-sizing: border-box;
            font-size: 13px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
            font-family: inherit;
            user-select: none;
            overflow: hidden;
            isolation: isolate;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            box-shadow: var(--cgo-shadow-control, 0 1px 2px rgba(0, 0, 0, 0.05));
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1);
        }

        .select::before {
            ${hairlineRimLightRules}
        }

        @media (hover: hover) and (pointer: fine) {
            .select:hover:not(:disabled)::before {
                opacity: 0.75;
            }
            .select:hover:not(:disabled) {
                box-shadow: var(--cgo-shadow-control-hover, 0 2px 5px rgba(0, 0, 0, 0.08));
            }
        }

        :host(:not([open])) .select:active:not(:disabled) {
            transform: scale(0.98);
        }

        .dot,
        .label,
        .arrow {
            position: relative;
            z-index: 3;
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
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-inherit, #64748b) 16%, transparent);
            flex-shrink: 0;
            transition: background var(--dur-fast, 140ms) ease, box-shadow var(--dur-fast, 140ms) ease;
        }

        .arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--text-main, #00263b);
            transition: transform var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1), color var(--dur-fast, 140ms) ease;
            flex-shrink: 0;
        }

        :host([state='enabled']) .select {
            background: var(--permission-enabled-soft, #edf8f1);
        }
        :host([state='enabled']) .dot {
            background: var(--permission-enabled, #16803d);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-enabled, #16803d) 16%, transparent);
        }

        :host([state='disabled']) .select {
            background: var(--permission-disabled-soft, #f0f4f8);
        }
        :host([state='disabled']) .dot {
            background: var(--permission-disabled, #52637a);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-disabled, #52637a) 16%, transparent);
        }

        :host([state='hidden']) .select {
            background: var(--permission-hidden-soft, #fff1f1);
        }
        :host([state='hidden']) .dot {
            background: var(--permission-hidden, #c62828);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-hidden, #c62828) 16%, transparent);
        }

        :host([disabled]) .select {
            opacity: 0.55;
            cursor: not-allowed;
            pointer-events: none;
            transform: none !important;
            box-shadow: none;
        }

        :host([open]) .select::before {
            display: none !important;
        }

        :host([open]) .select {
            outline: none !important;
            border: none !important;
            transform: none !important;
            box-shadow:
                0 0 0 1px var(--permission-inherit, #64748b),
                0 0 0 3.5px color-mix(in srgb, var(--permission-inherit, #64748b) 20%, transparent),
                0 1px 2px rgba(0, 0, 0, 0.06) !important;
        }

        :host([open]) .arrow {
            transform: rotate(180deg);
        }

        :host([open][state='enabled']) .select {
            box-shadow:
                0 0 0 1px var(--permission-enabled, #16803d),
                0 0 0 3.5px color-mix(in srgb, var(--permission-enabled, #16803d) 20%, transparent),
                0 1px 2px rgba(22, 128, 61, 0.08) !important;
        }

        :host([open][state='disabled']) .select {
            box-shadow:
                0 0 0 1px var(--permission-disabled, #52637a),
                0 0 0 3.5px color-mix(in srgb, var(--permission-disabled, #52637a) 20%, transparent),
                0 1px 2px rgba(0, 0, 0, 0.06) !important;
        }

        :host([open][state='hidden']) .select {
            box-shadow:
                0 0 0 1px var(--permission-hidden, #c62828),
                0 0 0 3.5px color-mix(in srgb, var(--permission-hidden, #c62828) 20%, transparent),
                0 1px 2px rgba(198, 40, 40, 0.08) !important;
        }

        .menu {
            display: none;
            position: fixed;
            inset: auto;
            margin: 0;
            min-width: 140px;
            background: transparent;
            border: none;
            border-radius: var(--radius-md, 8px);
            box-shadow: var(--cgo-shadow-dropdown, var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)));
            z-index: 100000;
            padding: 6px;
            overflow: hidden;
            isolation: isolate;
            box-sizing: border-box;
            animation: dropdownIn var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
        }

        :host([open]) .menu {
            display: block;
        }

        ${glassRefractionStyles}

        .menu::after {
            ${tierBPanelUnderlayRules}
        }

        .menu::before {
            ${tierBRimWeakRules}
        }

        .menu-content {
            position: relative;
            z-index: 3;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        /* 传统扁平降级 */
        :host([glass-mode='flat']) .menu,
        :host([glass-mode='none']) .menu {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .menu::before,
        :host([glass-mode='flat']) .menu::after,
        :host([glass-mode='none']) .menu::before,
        :host([glass-mode='none']) .menu::after {
            display: none;
        }

        @keyframes dropdownIn {
            from {
                opacity: 0;
                transform: translateY(-4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            box-sizing: border-box;
            user-select: none;
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) ease;
        }

        @media (hover: hover) and (pointer: fine) {
            .option:hover {
                background: var(--cgo-subtle-hover, var(--btn-info-hover, rgba(0, 38, 59, 0.06)));
                color: var(--text-main, #00263b);
            }
        }

        .option:active {
            transform: scale(0.99);
        }

        .option[aria-selected='true'] {
            background: var(--cgo-subtle-active, rgba(0, 38, 59, 0.08));
            font-weight: 700;
        }

        .option.enabled[aria-selected='true'] {
            background: var(--permission-enabled-soft, #edf8f1);
            color: var(--permission-enabled, #16803d);
        }
        .option.disabled[aria-selected='true'] {
            background: var(--permission-disabled-soft, #f0f4f8);
            color: var(--permission-disabled, #52637a);
        }
        .option.hidden[aria-selected='true'] {
            background: var(--permission-hidden-soft, #fff1f1);
            color: var(--permission-hidden, #c62828);
        }
        .option.inherit[aria-selected='true'] {
            background: var(--permission-inherit-soft, #f2f5f8);
            color: var(--permission-inherit, #64748b);
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
        this.glassMode = '';
        this.disabled = false;
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        closeFloatingMenu(this, this.shadowRoot?.querySelector('.menu'));
    }

    updated(changed) {
        if (changed.has('open')) {
            if (this.open) {
                this._mountFloatingMenu();
            } else {
                closeFloatingMenu(this, this.shadowRoot?.querySelector('.menu'));
            }
        }
    }

    _mountFloatingMenu() {
        const menu = this.shadowRoot?.querySelector('.menu');
        const select = this.shadowRoot?.querySelector('.select');
        if (!menu || !select) return;
        closeOtherFloatingMenus(this);
        openFloatingMenu(this, menu, select, {
            gap: 6,
            matchTriggerWidth: true,
            minWidth: 140,
            maxHeight: 200,
            align: 'left',
        });
    }

    openSelect() {
        if (this.disabled) return;
        closeOtherFloatingMenus(this);
        this.open = true;
        this.updateComplete.then(() => {
            if (this.open) this._mountFloatingMenu();
        });
    }

    close() {
        if (!this.open) return;
        this.open = false;
        closeFloatingMenu(this, this.shadowRoot?.querySelector('.menu'));
    }

    toggle(event) {
        if (this.disabled) return;
        if (event) event.stopPropagation();
        this.open ? this.close() : this.openSelect();
    }

    _options() {
        return [
            { state: 'inherit', label: '继承权限', optionText: '继承 (Inherit)' },
            { state: 'enabled', label: '允许访问', optionText: '允许 (Allow)' },
            { state: 'disabled', label: '拒绝访问', optionText: '拒绝 (Deny)' },
            { state: 'hidden', label: '隐藏入口', optionText: '隐藏 (Hide)' },
        ];
    }

    _current() {
        return this._options().find((item) => item.state === this.state) || this._options()[0];
    }

    _select(option) {
        this.state = option.state;
        this.label = option.label;
        this.close();
        this.dispatchEvent(new CustomEvent('cgo-admin-change', { detail: option, bubbles: true, composed: true }));
    }

    render() {
        const current = this.label ? { state: this.state, label: this.label } : this._current();
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        return html`
            <button
                class="select"
                type="button"
                ?disabled=${this.disabled}
                aria-expanded=${String(this.open)}
                @click=${(event) => this.toggle(event)}
            >
                <span class="dot"></span>
                <span class="label">${current.label}</span>
                <cgo-icon class="arrow" name="chevron-down" size="18" aria-hidden="true"></cgo-icon>
            </button>
            <div class="menu" popover="manual" role="listbox">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="menu-content">
                    ${this._options().map(
                        (option) => html`
                            <button
                                class="option ${option.state}"
                                type="button"
                                role="option"
                                aria-selected=${String(option.state === this.state)}
                                @click=${() => this._select(option)}
                            >
                                <span class="dot"></span>
                                ${option.optionText}
                            </button>
                        `
                    )}
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-admin-select') || customElements.define('cgo-admin-select', CgoAdminSelect);
}
