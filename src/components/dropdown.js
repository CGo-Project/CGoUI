import { LitElement, html, css } from 'lit';
import { PopupController } from '../utils/popup.js';

/**
 * <cgo-dropdown align="right">
 *   <cgo-button slot="trigger" icon="more-vert" icon-only></cgo-button>
 *   <a class="dropdown-item" href="#">菜单项</a>
 * </cgo-dropdown>
 * 互斥展开 / 点击外部关闭 / Esc 关闭 / 点击项后关闭。移植自 cgo_element.css §10 + initDropdowns。
 * 互斥、外部点击与 Esc 由公共 PopupController 处理；aria-expanded 写在 slot="trigger" 的元素上。
 */
export class CgoDropdown extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        align: { type: String },
    };

    static styles = css`
        :host {
            position: relative;
            display: inline-block;
        }
        .menu {
            display: none;
            position: absolute;
            top: calc(100% + 6px);
            right: 0;
            min-width: 180px;
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-md, 8px);
            box-shadow: var(--shadow-xl, 0 18px 46px rgba(0, 0, 0, 0.16));
            z-index: 500;
            padding: 6px;
            overflow: hidden;
            animation: dropdownIn 0.15s ease;
        }
        :host([align='left']) .menu {
            right: auto;
            left: 0;
        }
        :host([align='center']) .menu {
            right: auto;
            left: 50%;
            transform: translateX(-50%);
        }
        :host([open]) .menu {
            display: block;
        }
        @keyframes dropdownIn {
            from {
                opacity: 0;
                transform: translateY(-6px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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
            padding: 9px 12px !important;
            margin: 0 !important;
            border-radius: var(--radius-xs, 4px);
            color: var(--text-main, #00263b);
            font-size: var(--text-base, 14px);
            line-height: 1.6;
            text-decoration: none;
            cursor: pointer;
            white-space: nowrap;
            border: none;
            background: none;
            box-sizing: border-box;
            width: 100%;
            text-align: left;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        ::slotted(a:hover),
        ::slotted(button:hover),
        ::slotted(.dropdown-item:hover) {
            background: var(--btn-info-hover, #e9ecef) !important;
        }
        /* 分隔线 */
        ::slotted(.dropdown-divider) {
            display: block !important;
            height: 1px;
            margin: 5px 0 !important;
            background: var(--border-color, #dee2e6);
        }
        /* 菜单内图标尺寸对齐 */
        ::slotted(a) cgo-icon,
        ::slotted(button) cgo-icon {
            flex-shrink: 0;
        }
        @media (prefers-reduced-motion: reduce) {
            .menu {
                animation: none;
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.align = 'right';
        this._popup = new PopupController(this, {
            close: () => this.close(),
            getTrigger: () => this._triggerEl(),
        });
    }

    /* slot="trigger" 里的第一个元素（通常是 cgo-button） */
    _triggerEl() {
        return this.querySelector('[slot="trigger"]');
    }

    _syncTriggerAria() {
        const trigger = this._triggerEl();
        if (trigger) trigger.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    }

    updated(changed) {
        if (changed.has('open')) {
            // open 也可能被外部直接改写，统一在这里向弹层控制器登记
            if (this.open) this._popup.opened();
            else this._popup.closed();
            this._syncTriggerAria();
        }
    }

    _toggle() {
        this.open ? this.close() : this.show();
    }

    show() {
        this.open = true;
        this._popup.opened();
    }

    close() {
        if (!this.open) return;
        this.open = false;
        this._popup.closed();
    }

    _onMenuClick(e) {
        // 点击菜单内的链接/按钮后收起
        const t = e.target.closest('a, button, .dropdown-item');
        if (t) this.close();
    }

    render() {
        return html`
            <div class="trigger" @click=${this._toggle}>
                <slot name="trigger" @slotchange=${this._syncTriggerAria}></slot>
            </div>
            <div class="menu" @click=${this._onMenuClick}>
                <slot></slot>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-dropdown') || customElements.define('cgo-dropdown', CgoDropdown);
}
