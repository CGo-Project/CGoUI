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

function _isSafeImgSrc(src) {
    if (!src || typeof src !== 'string') return false;
    const trimmed = src.trim();
    if (!trimmed) return false;
    if (/^(https?:)?\/\//i.test(trimmed) || /^[./]/.test(trimmed)) return true;
    return /^data:image\/(png|jpe?g|webp|gif|svg\+xml);/i.test(trimmed);
}

function _isSafeCssColor(val) {
    if (!val || typeof val !== 'string') return false;
    return /^[#a-zA-Z0-9(),.\s%-]+$/.test(val.trim()) && !/url\(|expression\(|var\(/i.test(val);
}

function _renderSafeNode(node, idx = 0) {
    if (!node) return null;
    if (node.nodeType === 3) {
        return node.textContent;
    }
    if (node.nodeType !== 1) return null;
    const tag = node.tagName.toLowerCase();
    const cls = node.getAttribute('class') || '';
    const children = [...node.childNodes].map((c, i) => _renderSafeNode(c, i));

    if (tag === 'cgo-icon') {
        return html`<cgo-icon
            name=${node.getAttribute('name') || ''}
            size=${node.getAttribute('size') || '16'}
            color=${node.getAttribute('color') || ''}
        ></cgo-icon>`;
    }
    if (tag === 'img' && cls.includes('cgo-toolbar-option-img')) {
        const src = node.getAttribute('src') || '';
        if (!_isSafeImgSrc(src)) return null;
        return html`<img class="cgo-toolbar-option-img" src=${src} alt=${node.getAttribute('alt') || ''} />`;
    }
    if ((tag === 'span' || tag === 'div' || tag === 'i') && cls.includes('cgo-toolbar-option-dot')) {
        const bg = node.style?.backgroundColor || node.style?.background || node.getAttribute('data-color') || '';
        const safeBg = _isSafeCssColor(bg) ? bg : 'currentColor';
        return html`<span class="cgo-toolbar-option-dot" style="background:${safeBg}"></span>`;
    }
    if (tag === 'span' || tag === 'small' || tag === 'strong' || tag === 'b' || tag === 'em' || tag === 'code') {
        return html`<span class=${cls}>${children}</span>`;
    }
    return html`${children}`;
}

/**
 * <cgo-toolbar-select value="beijing" placeholder="请选择模板">
 *   <cgo-toolbar-option value="beijing">北京标准站牌</cgo-toolbar-option>
 *   <cgo-toolbar-option value="shanghai">上海标准站牌</cgo-toolbar-option>
 * </cgo-toolbar-select>
 */
export class CgoToolbarSelect extends LitElement {
    static properties = {
        value: { type: String, reflect: true },
        placeholder: { type: String },
        open: { type: Boolean, reflect: true },
        openUp: { type: Boolean, reflect: true, attribute: 'open-up' },
        disabled: { type: Boolean, reflect: true },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
        _label: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
            vertical-align: middle;
            box-sizing: border-box;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        .trigger {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            position: relative;
            outline: none !important;
            border: none !important;
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            background: var(--btn-info-bg, #f1f3f5);
            border-radius: var(--radius-sm, 6px);
            padding: 6px 12px;
            cursor: pointer;
            font-size: 13px;
            font-family: inherit;
            font-weight: 500;
            color: var(--text-main, #00263b);
            text-align: left;
            line-height: 1.6;
            user-select: none;
            min-height: 34px;
            height: 34px;
            box-sizing: border-box;
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

        .trigger::before {
            ${hairlineRimLightRules}
        }

        @media (hover: hover) and (pointer: fine) {
            .trigger:hover:not(:disabled)::before {
                opacity: 0.75;
            }
            .trigger:hover:not(:disabled) {
                background: var(--btn-info-hover, #e9ecef);
                box-shadow: var(--cgo-shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.06));
            }
        }

        :host(:not([open])) .trigger:active:not(:disabled) {
            transform: scale(0.98);
        }

        .text,
        .arrow {
            position: relative;
            z-index: 3;
        }

        .text {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
        }

        .placeholder {
            opacity: 0.55;
        }

        .arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            opacity: 0.65;
            flex-shrink: 0;
            color: inherit;
            transition: transform var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1), opacity var(--dur-fast, 140ms) ease;
        }

        :host([disabled]) .trigger {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
            box-shadow: none;
            transform: none !important;
        }

        :host([open]) .trigger::before {
            display: none !important;
        }

        :host([open]) .trigger {
            outline: none !important;
            border: none !important;
            transform: none !important;
            box-shadow:
                0 0 0 1px var(--primary-color, #006098),
                0 0 0 3.5px color-mix(in srgb, var(--primary-color, #006098) 18%, transparent),
                0 1px 2px rgba(0, 96, 152, 0.08) !important;
        }

        :host([open]) .arrow {
            transform: rotate(180deg);
            opacity: 0.9;
        }

        .options {
            position: fixed;
            inset: auto;
            margin: 0;
            background: transparent;
            border: none !important;
            outline: none !important;
            border-radius: var(--radius-md, 8px);
            box-shadow: var(--cgo-shadow-dropdown, var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)));
            z-index: 100000;
            display: none;
            padding: 6px;
            box-sizing: border-box;
            overflow: hidden;
            isolation: isolate;
        }

        :host([open]) .options {
            display: flex;
            flex-direction: column;
        }

        ${glassRefractionStyles}

        .options::after {
            ${tierBPanelUnderlayRules}
        }

        .options::before {
            ${tierBRimWeakRules}
        }

        .options-content {
            position: relative;
            z-index: 3;
            max-height: 280px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 2px;
            width: 100%;
            box-sizing: border-box;
        }

        .options-content::-webkit-scrollbar {
            width: 5px;
        }
        .options-content::-webkit-scrollbar-thumb {
            background: var(--cgo-scrollbar-thumb, rgba(0, 0, 0, 0.12));
            border-radius: 10px;
        }

        .opt {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
            padding: 8px 10px;
            border-radius: var(--radius-xs, 4px);
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-main, #00263b);
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) ease;
            user-select: none;
            border: none !important;
            outline: none !important;
            background: transparent;
            font-family: inherit;
            text-align: left;
        }

        @media (hover: hover) and (pointer: fine) {
            .opt:hover {
                background: var(--cgo-subtle-hover, var(--btn-info-hover, rgba(0, 38, 59, 0.06)));
                color: var(--text-main, #00263b);
            }
        }

        .opt:active {
            transform: scale(0.99);
        }

        .opt.selected {
            background: var(--primary-color, #006098) !important;
            color: #ffffff !important;
            font-weight: 600;
        }

        .opt .cgo-toolbar-option-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .opt .cgo-toolbar-option-img {
            height: 18px;
            width: auto;
            max-width: 42px;
            object-fit: contain;
            flex-shrink: 0;
        }

        /* 传统扁平降级 */
        :host([glass-mode='flat']) .options,
        :host([glass-mode='none']) .options {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6) !important;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .options::before,
        :host([glass-mode='flat']) .options::after,
        :host([glass-mode='none']) .options::before,
        :host([glass-mode='none']) .options::after {
            display: none;
        }

        :host([open]:not([open-up])) .options {
            animation: cgoTsFadeIn var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
        }
        :host([open][open-up]) .options {
            animation: cgoTsFadeInUp var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cgoTsFadeIn {
            from {
                opacity: 0;
                transform: translateY(-4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes cgoTsFadeInUp {
            from {
                opacity: 0;
                transform: translateY(4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .src {
            display: none;
        }
    `;

    constructor() {
        super();
        this.value = '';
        this.placeholder = '';
        this.open = false;
        this.openUp = false;
        this.disabled = false;
        this.glassMode = '';
        this._label = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        closeFloatingMenu(this, this.shadowRoot?.querySelector('.options'));
    }

    _getOptions() {
        return [...this.querySelectorAll('cgo-toolbar-option')];
    }

    _syncLabel() {
        const opts = this._getOptions();
        const sel = opts.find((opt) => opt.getAttribute('value') === this.value);
        if (sel) {
            this._label = sel.textContent.trim();
        } else if (!this.value && opts.length > 0) {
            this._label = opts[0].textContent.trim();
        } else {
            this._label = '';
        }
    }

    firstUpdated() {
        this._syncLabel();
    }

    updated(changed) {
        if (changed.has('value')) this._syncLabel();
        if (changed.has('open')) {
            if (this.open) {
                this._mountFloatingMenu();
            } else {
                closeFloatingMenu(this, this.shadowRoot?.querySelector('.options'));
            }
        }
    }

    _onSlotChange() {
        this._syncLabel();
        this.requestUpdate();
    }

    _mountFloatingMenu() {
        const opts = this.shadowRoot?.querySelector('.options');
        const trigger = this.shadowRoot?.querySelector('.trigger');
        if (!opts || !trigger) return;
        closeOtherFloatingMenus(this);
        openFloatingMenu(this, opts, trigger, {
            gap: 5,
            matchTriggerWidth: true,
            maxHeight: 280,
            align: 'left',
        });
        requestAnimationFrame(() => {
            this.openUp = opts.style.bottom !== '';
        });
    }

    _toggle(e) {
        e.stopPropagation();
        if (this.disabled) return;
        this.open ? this.close() : this.show();
    }

    show() {
        closeOtherFloatingMenus(this);
        this.open = true;
        this.updateComplete.then(() => {
            if (this.open) this._mountFloatingMenu();
        });
    }

    close() {
        if (!this.open) return;
        this.open = false;
        closeFloatingMenu(this, this.shadowRoot?.querySelector('.options'));
    }

    _select(optValue) {
        if (this.value === optValue) {
            this.close();
            return;
        }
        this.value = optValue;
        const opt = this._getOptions().find((o) => o.getAttribute('value') === optValue);
        const label = opt ? opt.textContent.trim() : '';
        this.close();
        this.dispatchEvent(
            new CustomEvent('cgo-change', {
                detail: { value: optValue, label },
                bubbles: true,
                composed: true,
            })
        );
    }

    render() {
        const opts = this._getOptions();
        const isPlaceholder = !this._label && !!this.placeholder;
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';

        return html`
            <button class="trigger" type="button" ?disabled=${this.disabled} aria-expanded=${String(this.open)} @click=${this._toggle}>
                <span class="text ${isPlaceholder ? 'placeholder' : ''}">${this._label || this.placeholder || ''}</span>
                <cgo-icon class="arrow" name="expand-more" size="18" aria-hidden="true"></cgo-icon>
            </button>
            <div class="options" popover="manual" role="listbox">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="options-content">
                    ${opts.map((opt) => {
                        const val = opt.getAttribute('value') || '';
                        const isSel = val === this.value;
                        const content = [...opt.childNodes].map((node, i) => _renderSafeNode(node, i));
                        return html`
                            <button
                                type="button"
                                role="option"
                                aria-selected=${String(isSel)}
                                class="opt ${isSel ? 'selected' : ''}"
                                @click=${() => this._select(val)}
                            >
                                ${content}
                            </button>
                        `;
                    })}
                </div>
            </div>
            <div class="src"><slot @slotchange=${this._onSlotChange}></slot></div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-toolbar-select') || customElements.define('cgo-toolbar-select', CgoToolbarSelect);
}
