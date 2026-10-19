import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import {
    glassRefractionStyles,
    tierBPanelUnderlayRules,
    tierBPanelUnderlayDarkRules,
    tierBRimWeakRules,
    tierBRimWeakDarkRules,
} from '../styles/glass-shared.js';

/**
 * <cgo-table>
 * 遵循次世代 Liquid Glass Tier B（不可交互底板 / 布局容器规范）的数据表格组件。
 * - Layer 0: 折射磨砂层（14px 模糊 + 135% 饱和度 + SVG 空间折射）
 * - Layer 1: 半透明底色衬底层（0.9 固定高不透明底板）
 * - Layer 2: 弱化微光圈（顶部柔和单向光，与 0.9 底板自然融合，零多余重影）
 * - Layer 3: 滚动容器与优化后的半透明粘性表头（sticky top: 0，宽裕内边距，精细微分割线）
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
            box-shadow: 0 4px 20px -2px rgba(0, 38, 59, 0.05), 0 2px 8px -1px rgba(0, 38, 59, 0.03);
            overflow: hidden;
            isolation: isolate;
            transition: box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
        }

        /* Tier B 规范：绝对禁止整卡 hover 任何位移与反应 */
        .table-card:hover {
            transform: none !important;
            box-shadow: 0 4px 20px -2px rgba(0, 38, 59, 0.05), 0 2px 8px -1px rgba(0, 38, 59, 0.03) !important;
        }

        /* Layer 0: 折射磨砂层 (Tier B 规范) */
        ${glassRefractionStyles}

        /* Layer 1: 半透明底色衬底层 (Tier B 规范: 0.9 固定高不透明底板) */
        .table-card:not(.flat)::after {
            ${tierBPanelUnderlayRules}
        }
        :host-context([data-theme='dark']) .table-card:not(.flat)::after {
            ${tierBPanelUnderlayDarkRules}
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与 0.9 底板自然融合) */
        .table-card:not(.flat)::before {
            ${tierBRimWeakRules}
        }

        :host-context([data-theme='dark']) .table-card:not(.flat)::before {
            ${tierBRimWeakDarkRules}
        }

        :host-context([data-theme='dark']) .table-card {
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.35), 0 2px 8px -1px rgba(0, 0, 0, 0.2);
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

        /* 表格排版 */
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

        /* 表头位置与毛玻璃视觉优化 */
        ::slotted(table th) {
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

        :host-context([data-theme='dark']) ::slotted(table th) {
            background: var(--glass-bg-subtle, rgba(255, 255, 255, 0.04));
            border-bottom-color: var(--glass-border-subtle, rgba(255, 255, 255, 0.07));
            color: var(--table-head-text, var(--text-main, #e5e8ea));
        }

        /* 表头左右两端圆角与外框融合 */
        ::slotted(table thead tr:first-child th:first-child) {
            border-top-left-radius: var(--radius-lg, 12px);
        }
        ::slotted(table thead tr:first-child th:last-child) {
            border-top-right-radius: var(--radius-lg, 12px);
        }

        /* 单元格排版与轻量分割线 */
        ::slotted(table td) {
            padding: 13px 18px;
            font-size: 13.5px;
            line-height: 1.45;
            color: var(--text-main, #00263b);
            border-bottom: 1px solid var(--glass-border-subtle, rgba(0, 38, 59, 0.05));
            transition: background-color 0.2s ease;
        }

        :host-context([data-theme='dark']) ::slotted(table td) {
            color: var(--text-main, #e5e8ea);
            border-bottom-color: var(--glass-border-subtle, rgba(255, 255, 255, 0.05));
        }

        /* 末行单元格顺滑收尾 */
        ::slotted(table tbody tr:last-child td) {
            border-bottom: none;
        }
        ::slotted(table tbody tr:last-child td:first-child) {
            border-bottom-left-radius: var(--radius-lg, 12px);
        }
        ::slotted(table tbody tr:last-child td:last-child) {
            border-bottom-right-radius: var(--radius-lg, 12px);
        }

        /* 行悬停轻柔微光 */
        ::slotted(table tbody tr:hover td) {
            background-color: var(--glass-bg-hover, rgba(0, 38, 59, 0.025));
        }
        :host-context([data-theme='dark']) ::slotted(table tbody tr:hover td) {
            background-color: var(--glass-bg-hover, rgba(255, 255, 255, 0.035));
        }

        /* 兼容 modern-table 居中排版 */
        ::slotted(table.modern-table th),
        ::slotted(table.modern-table td) {
            text-align: center;
        }
    `;

    constructor() {
        super();
        this.glassMode = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
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
