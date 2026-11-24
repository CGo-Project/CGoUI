import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import {
    glassRefractionStyles,
    tierBPanelUnderlayRules,
    tierBRimWeakRules,
} from '../styles/glass-shared.js';

const TABLE_STYLE_ID = 'cgo-table-slotted-style';
const TABLE_LIGHT_DOM_CSS = `
cgo-table table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-family: var(--font-sans, system-ui, sans-serif);
    font-size: 13.5px;
    color: var(--text-main, #00263b);
    text-align: left;
    margin: 0;
}
cgo-table table th {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 14px 18px;
    background: var(--glass-bg-subtle, rgba(0, 38, 59, 0.03));
    color: var(--table-head-text, var(--text-main, #00263b));
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.02em;
    white-space: nowrap;
    border-bottom: 1px solid var(--glass-border-subtle, rgba(0, 38, 59, 0.07));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: background-color 0.25s ease, color 0.25s ease;
}
cgo-table table thead tr:first-child th:first-child {
    border-top-left-radius: var(--radius-lg, 12px);
}
cgo-table table thead tr:first-child th:last-child {
    border-top-right-radius: var(--radius-lg, 12px);
}
cgo-table table td {
    padding: 13px 18px;
    font-size: 13.5px;
    line-height: 1.45;
    color: var(--text-main, #00263b);
    border-bottom: 1px solid var(--glass-border-subtle, rgba(0, 38, 59, 0.05));
    transition: background-color 0.2s ease;
}
cgo-table table tbody tr:last-child td {
    border-bottom: none;
}
cgo-table table tbody tr:last-child td:first-child {
    border-bottom-left-radius: var(--radius-lg, 12px);
}
cgo-table table tbody tr:last-child td:last-child {
    border-bottom-right-radius: var(--radius-lg, 12px);
}
cgo-table table tbody tr:hover td {
    background-color: var(--glass-bg-hover, rgba(0, 38, 59, 0.025));
}
cgo-table table.modern-table th,
cgo-table table.modern-table td {
    text-align: center;
}
`;

function _ensureTableLightStyles(host) {
    if (typeof document === 'undefined') return;
    const root = typeof host.getRootNode === 'function' ? host.getRootNode() : document;
    const container = root instanceof ShadowRoot ? root : document.head;
    if (!container) return;
    const exists = root instanceof ShadowRoot
        ? root.getElementById?.(TABLE_STYLE_ID) || root.querySelector(`#${TABLE_STYLE_ID}`)
        : document.getElementById(TABLE_STYLE_ID);
    if (exists) return;
    const style = document.createElement('style');
    style.id = TABLE_STYLE_ID;
    style.textContent = TABLE_LIGHT_DOM_CSS;
    container.appendChild(style);
}

/**
 * <cgo-table>
 * 遵循次世代 Liquid Glass Tier B（不可交互底板 / 布局容器规范）的数据表格组件。
 */
export class CgoTable extends LitElement {
    static properties = {
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
            border-radius: var(--radius-lg, 12px);
            margin: 0;
            padding: 0;
        }

        /* 遵循次世代 Liquid Glass Tier B 不可交互底板规范 */
        .table-card {
            position: relative;
            border-radius: var(--radius-lg, 12px);
            background: transparent;
            color: var(--text-main, #00263b);
            border: none;
            box-shadow: var(--glass-shadow-surface, 0 4px 20px -2px rgba(0, 38, 59, 0.05), 0 2px 8px -1px rgba(0, 38, 59, 0.03));
            overflow: hidden;
            isolation: isolate;
            transition: box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
        }

        /* Tier B 规范：绝对禁止整卡 hover 任何位移与反应 */
        .table-card:hover {
            transform: none !important;
            box-shadow: var(--glass-shadow-surface, 0 4px 20px -2px rgba(0, 38, 59, 0.05), 0 2px 8px -1px rgba(0, 38, 59, 0.03)) !important;
        }

        /* Layer 0: 折射磨砂层 (Tier B 规范) */
        ${glassRefractionStyles}

        /* Layer 1: 半透明底色衬底层 (Tier B 规范: 0.9 固定高不透明底板) */
        .table-card:not(.flat)::after {
            ${tierBPanelUnderlayRules}
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范) */
        .table-card:not(.flat)::before {
            ${tierBRimWeakRules}
        }

        /* Layer 3: 滚动视口容器 */
        .table-scroller {
            position: relative;
            z-index: 3;
            overflow-x: auto;
            width: 100%;
            border-radius: inherit;
            -webkit-overflow-scrolling: touch;
        }

        /* 传统扁平降级 */
        .table-card.flat,
        :host([glass-mode='flat']) .table-card,
        :host([glass-mode='none']) .table-card {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6);
            box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        .table-card.flat::before,
        .table-card.flat::after,
        :host([glass-mode='flat']) .table-card::before,
        :host([glass-mode='flat']) .table-card::after,
        :host([glass-mode='none']) .table-card::before,
        :host([glass-mode='none']) .table-card::after {
            display: none;
        }

        ::slotted(table) {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: 13.5px;
            color: var(--text-main, #00263b);
            text-align: left;
            margin: 0;
        }
    `;

    constructor() {
        super();
        this.glassMode = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
        _ensureTableLightStyles(this);
    }

    render() {
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        return html`
            <div class="table-card ${isFlat ? 'flat' : 'glass'}">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="table-scroller">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-table') || customElements.define('cgo-table', CgoTable);
}
