import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import {
    glassRefractionStyles,
    tierBPanelUnderlayRules,
    tierBRimWeakRules,
} from '../styles/glass-shared.js';
import { openFloatingMenu, closeFloatingMenu, closeOtherFloatingMenus } from '../utils/floating-menu.js';

/**
 * <cgo-dropdown align="right">
 *   <cgo-button slot="trigger" icon="more-vert" icon-only></cgo-button>
 *   <a class="dropdown-item" href="#">菜单项</a>
 * </cgo-dropdown>
 * 互斥展开 / 点击外部关闭 / 点击项后关闭。遵循次世代 Liquid Glass Tier B 不可交互底板规范。
 */
export class CgoDropdown extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        align: { type: String, reflect: true },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
    };

    static styles = css`
        :host {
            position: relative;
            display: inline-block;
        }
        .trigger {
            display: inline-flex;
        }

        /* 遵循 Tier B 不可交互底板规范 (0.9 衬底，柔和微光圈) */
        .menu {
            display: none;
            position: fixed;
            inset: auto;
            margin: 0;
            min-width: 190px;
            background: transparent;
            border: none;
            border-radius: var(--radius-lg, 12px);
            box-shadow: var(--cgo-shadow-dropdown, var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)));
            color: inherit;
            z-index: 100000;
            padding: 6px;
            overflow: hidden;
            isolation: isolate;
            box-sizing: border-box;
            transform-origin: top right;
            animation: dropdownIn var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Layer 0: 折射磨砂层 (Tier B 规范) */
        ${glassRefractionStyles}

        /* Layer 1: 半透明底色衬底层 (Tier B 规范: 0.9 固定) */
        .menu::after {
            ${tierBPanelUnderlayRules}
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范) */
        .menu::before {
            ${tierBRimWeakRules}
        }

        /* Layer 3: 菜单内容项 */
        .menu-content {
            position: relative;
            z-index: 3;
            animation: dropdownContentIn var(--dur-fast, 140ms) ease;
        }

        /* align 属性仅影响 transform-origin，坐标由 floating-menu helper 计算 */
        :host([align='left']) .menu {
            transform-origin: top left;
        }
        :host([align='center']) .menu {
            transform-origin: top center;
        }
        :host([open]) .menu {
            display: block;
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
                transform: scale(0.96) translateY(-4px);
            }
            to {
                transform: scale(1) translateY(0);
            }
        }
        @keyframes dropdownOut {
            from {
                transform: scale(1) translateY(0);
            }
            to {
                transform: scale(0.97) translateY(-2px);
            }
        }
        @keyframes dropdownContentIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        .menu.closing {
            display: block;
            animation: dropdownOut 140ms cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        .menu.closing .menu-content {
            opacity: 0;
            transition: opacity 120ms ease;
        }

        /* 暴露给 light DOM 菜单项的统一样式（::slotted）
           注意：用 !important 抵消外层文档 cgo_element.css 的 *{padding:0} 全局重置，
           否则菜单项会塌成单行、行间距过挤。*/
        ::slotted(a),
        ::slotted(button),
        ::slotted(.dropdown-item) {
            display: flex !important;
            align-items: center;
            gap: 8px;
            padding: 8px 12px !important;
            margin: 0 !important;
            border-radius: var(--radius-sm, 6px);
            color: var(--text-main, #00263b);
            font-size: var(--text-base, 14px);
            font-weight: 500;
            line-height: 1.5;
            text-decoration: none;
            cursor: pointer;
            white-space: nowrap;
            border: none;
            background: transparent;
            box-sizing: border-box;
            width: 100%;
            text-align: left;
            user-select: none;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (hover: hover) and (pointer: fine) {
            ::slotted(a:hover),
            ::slotted(button:hover),
            ::slotted(.dropdown-item:hover) {
                background: var(--cgo-subtle-hover, var(--btn-info-hover, rgba(0, 38, 59, 0.06))) !important;
                color: var(--text-main, #00263b);
            }
        }
        ::slotted(a:active),
        ::slotted(button:active),
        ::slotted(.dropdown-item:active) {
            transform: scale(0.98);
        }

        /* 分隔线 */
        ::slotted(.dropdown-divider) {
            display: block !important;
            height: 1px;
            margin: 4px 0 !important;
            background: var(--cgo-divider-color, rgba(0, 38, 59, 0.08));
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.align = 'right';
        this.glassMode = '';
        this._closing = false;
        this._closeTimer = null;
        this._closeHandler = null;
        this._closeTarget = null;
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._clearClosePending();
        const menu = this.shadowRoot?.querySelector('.menu');
        closeFloatingMenu(this, menu);
        this._closing = false;
    }

    _clearClosePending() {
        if (this._closeTimer) {
            clearTimeout(this._closeTimer);
            this._closeTimer = null;
        }
        if (this._closeHandler && this._closeTarget) {
            this._closeTarget.removeEventListener('animationend', this._closeHandler);
        }
        this._closeHandler = null;
        this._closeTarget = null;
    }

    updated(changedProperties) {
        if (changedProperties.has('open')) {
            if (this.open) {
                this._mountFloatingMenu();
            } else if (!this._closing) {
                closeFloatingMenu(this, this.shadowRoot?.querySelector('.menu'));
            }
        }
    }

    _mountFloatingMenu() {
        const menu = this.shadowRoot?.querySelector('.menu');
        const trigger = this.shadowRoot?.querySelector('.trigger');
        if (!menu || !trigger) return;
        closeOtherFloatingMenus(this);
        openFloatingMenu(this, menu, trigger, {
            align: this.align || 'right',
            gap: 8,
            minWidth: 190,
            maxHeight: 420,
        });
    }

    _toggle(e) {
        e.stopPropagation();
        this.open ? this.close() : this.show();
    }

    show() {
        this._clearClosePending();
        this._closing = false;
        closeOtherFloatingMenus(this);
        this.open = true;
        this.updateComplete.then(() => {
            if (!this.open || this._closing) return;
            this._mountFloatingMenu();
        });
    }

    close() {
        if (!this.open || this._closing) return;
        this._clearClosePending();
        this._closing = true;
        this.requestUpdate();
        const menu = this.shadowRoot?.querySelector('.menu');
        const done = () => {
            if (!this._closing) return;
            this._clearClosePending();
            closeFloatingMenu(this, menu);
            this._closing = false;
            this.open = false;
            this.requestUpdate();
        };
        if (menu) {
            this._closeTarget = menu;
            this._closeHandler = (e) => {
                if (e.target === menu) done();
            };
            menu.addEventListener('animationend', this._closeHandler);
            this._closeTimer = setTimeout(done, 180);
        } else {
            done();
        }
    }

    _onMenuClick(e) {
        const t = e.target.closest('a, button, .dropdown-item');
        if (t) this.close();
    }

    render() {
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        const isVisible = this.open || this._closing;
        return html`
            <div class="trigger" @click=${this._toggle}>
                <slot name="trigger"></slot>
            </div>
            ${isVisible
                ? html`
                      <div class="menu ${this._closing ? 'closing' : ''}" popover="manual" @click=${this._onMenuClick}>
                          ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                          <div class="menu-content">
                              <slot></slot>
                          </div>
                      </div>
                  `
                : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-dropdown') || customElements.define('cgo-dropdown', CgoDropdown);
}
