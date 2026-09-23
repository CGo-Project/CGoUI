import { LitElement, html, css } from 'lit';

const _openInstances = new Set();
let _outsideBound = false;
function _bindOutside() {
    if (_outsideBound) return;
    _outsideBound = true;
    document.addEventListener('click', () => {
        _openInstances.forEach((inst) => inst.close());
    });
}

/**
 * <cgo-dropdown align="right">
 *   <cgo-button slot="trigger" icon="more-vert" icon-only></cgo-button>
 *   <a class="dropdown-item" href="#">菜单项</a>
 * </cgo-dropdown>
 * 互斥展开 / 点击外部关闭 / 点击项后关闭。移植自 cgo_element.css §10 + initDropdowns。
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
        :host-context([data-theme="dark"]) .menu {
            background: var(--card-bg, #1f2020);
            border-color: var(--border-color, #383a3c);
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
    `;

    constructor() {
        super();
        this.open = false;
        this.align = 'right';
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        _openInstances.delete(this);
    }

    firstUpdated() {
        _bindOutside();
    }

    _toggle(e) {
        e.stopPropagation();
        this.open ? this.close() : this.show();
    }

    show() {
        _openInstances.forEach((inst) => {
            if (inst !== this) inst.close();
        });
        this.open = true;
        _openInstances.add(this);
    }

    close() {
        if (!this.open) return;
        this.open = false;
        _openInstances.delete(this);
    }

    _onMenuClick(e) {
        // 点击菜单内的链接/按钮后收起
        const t = e.target.closest('a, button, .dropdown-item');
        if (t) this.close();
    }

    render() {
        return html`
            <div class="trigger" @click=${this._toggle}>
                <slot name="trigger"></slot>
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
