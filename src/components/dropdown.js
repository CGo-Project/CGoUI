import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import {
    glassRefractionStyles,
    tierBPanelUnderlayRules,
    tierBPanelUnderlayDarkRules,
    tierBRimWeakRules,
    tierBRimWeakDarkRules,
} from '../styles/glass-shared.js';

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
 * 互斥展开 / 点击外部关闭 / 点击项后关闭。遵循次世代 Liquid Glass Tier B 不可交互底板规范。
 */
export class CgoDropdown extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        align: { type: String },
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
            /*
             * Fix: position: fixed 直接以视口为定位基准，完全脱离父级的 isolation、overflow、backdrop-filter 约束。
             * 坐标由 JS _positionMenu() 动态计算，并随 resize/scroll 跟随。
             */
            position: fixed;
            min-width: 190px;
            background: transparent;
            border: none;
            border-radius: var(--radius-lg, 12px);
            box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04));
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
        :host-context([data-theme='dark']) .menu::after {
            ${tierBPanelUnderlayDarkRules}
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与 0.9 高不透明底板自然融合) */
        .menu::before {
            ${tierBRimWeakRules}
        }

        :host-context([data-theme='dark']) .menu::before {
            ${tierBRimWeakDarkRules}
        }

        :host-context([data-theme='dark']) .menu {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Layer 3: 菜单内容项 */
        .menu-content {
            position: relative;
            z-index: 3;
        }

        /* align 属性仅影响 transform-origin，坐标已由 JS 全量负责 */
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
        :host-context([data-theme='dark']):host([glass-mode='flat']) .menu {
            background: var(--card-bg, #1f2020);
            border-color: var(--border-color, #383a3c);
        }

        @keyframes dropdownIn {
            from {
                opacity: 0;
                transform: scale(0.96);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        @keyframes dropdownOut {
            from {
                opacity: 1;
                transform: scale(1);
            }
            to {
                opacity: 0;
                transform: scale(0.97);
            }
        }
        .menu.closing {
            display: block;
            animation: dropdownOut 140ms cubic-bezier(0.4, 0, 1, 1) forwards;
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
                background: var(--btn-info-hover, rgba(0, 38, 59, 0.06)) !important;
                color: var(--text-main, #00263b);
            }
        }
        :host-context([data-theme='dark']) ::slotted(a),
        :host-context([data-theme='dark']) ::slotted(button),
        :host-context([data-theme='dark']) ::slotted(.dropdown-item) {
            color: var(--text-main, #e5e8ea);
        }
        @media (hover: hover) and (pointer: fine) {
            :host-context([data-theme='dark']) ::slotted(a:hover),
            :host-context([data-theme='dark']) ::slotted(button:hover),
            :host-context([data-theme='dark']) ::slotted(.dropdown-item:hover) {
                background: rgba(255, 255, 255, 0.08) !important;
                color: #ffffff;
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
            background: var(--border-color, rgba(0, 38, 59, 0.08));
        }
        :host-context([data-theme='dark']) ::slotted(.dropdown-divider) {
            background: rgba(255, 255, 255, 0.08);
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
        this.glassMode = '';
        this._closing = false;
        this._positionHandler = () => {
            if (this.open) this._positionMenu();
        };
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        _openInstances.delete(this);
        window.removeEventListener('resize', this._positionHandler);
        window.removeEventListener('scroll', this._positionHandler, true);
    }

    firstUpdated() {
        _bindOutside();
    }

    _toggle(e) {
        e.stopPropagation();
        this.open ? this.close() : this.show();
    }

    show() {
        this._closing = false;
        _openInstances.forEach((inst) => {
            if (inst !== this) inst.close();
        });
        this.open = true;
        _openInstances.add(this);
        // fixed 定位需在面板渲染后基于 trigger 视口坐标计算
        requestAnimationFrame(() => this._positionMenu());
        window.addEventListener('resize', this._positionHandler);
        window.addEventListener('scroll', this._positionHandler, true);
    }

    /**
     * 基于触发元素的视口坐标动态计算并设置菜单的 fixed 定位。
     * 使用 position: fixed 后，菜单完全脱离父级的 isolation/overflow/backdrop-filter 约束，
     * 从根本上解决玻璃嵌套时背景模糊被抑制导致效果丢失的问题。
     */
    _positionMenu() {
        const menu = this.shadowRoot?.querySelector('.menu');
        const trigger = this.shadowRoot?.querySelector('.trigger');
        if (!menu || !trigger) return;

        const r = trigger.getBoundingClientRect();
        const menuW = menu.offsetWidth || 190;
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const gap = 8;

        // 垂直方向：优先向下展开，如果下方空间不足则向上
        const downTop = r.bottom + gap;
        const upBottom = viewportH - r.top + gap;
        const fitsDown = downTop + 300 < viewportH;
        menu.style.top = fitsDown ? `${downTop}px` : '';
        menu.style.bottom = !fitsDown ? `${upBottom}px` : '';

        // 水平方向：依据 align 属性对齐
        menu.style.left = '';
        menu.style.right = '';
        if (this.align === 'left') {
            const left = Math.max(4, Math.min(r.left, viewportW - menuW - 4));
            menu.style.left = `${left}px`;
        } else if (this.align === 'center') {
            const center = r.left + r.width / 2;
            const left = Math.max(4, Math.min(center - menuW / 2, viewportW - menuW - 4));
            menu.style.left = `${left}px`;
        } else {
            // 默认 align right
            const right = viewportW - r.right;
            menu.style.right = `${Math.max(4, right)}px`;
        }
    }

    close() {
        if (!this.open || this._closing) return;
        this._closing = true;
        this.requestUpdate();
        const menu = this.shadowRoot?.querySelector('.menu');
        const done = () => {
            this._closing = false;
            this.open = false;
            _openInstances.delete(this);
            window.removeEventListener('resize', this._positionHandler);
            window.removeEventListener('scroll', this._positionHandler, true);
            this.requestUpdate();
        };
        if (menu) {
            menu.addEventListener('animationend', done, { once: true });
            setTimeout(() => {
                if (this._closing) done();
            }, 180);
        } else {
            done();
        }
    }

    _onMenuClick(e) {
        // 点击菜单内的链接/按钮后收起
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
                      <div class="menu ${this._closing ? 'closing' : ''}" @click=${this._onMenuClick}>
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
