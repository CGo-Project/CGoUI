import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';

export class CgoCard extends LitElement {
    static properties = {
        variant: { type: String },
        tier: { type: String, reflect: true },
        title: { type: String },
        header: { type: String },
        icon: { type: String },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .card {
            position: relative;
            padding: 24px;
            border-radius: var(--radius-lg, 12px);
            background: transparent;
            color: var(--text-main, #00263b);
            border: none;
            box-shadow: var(--glass-shadow);
            box-sizing: border-box;
            transition: box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1)),
                        transform var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
            overflow: hidden;
            isolation: isolate;
        }

        /* ===== 玻璃卡片体系（默认对齐 Tier C 不可交互强调表面） ===== */
        .glass,
        .liquid-glass,
        .tier-a,
        .tier-b,
        .tier-c,
        .card:not(.flat):not(.info):not(.danger) {
            background: transparent;
            border: none;
            box-shadow: var(--glass-shadow);
            overflow: hidden;
            isolation: isolate;
        }

        /* Layer 0: 折射磨砂层 (Tier C 默认: blur(14px) saturate(135%)) */
        .glass-refraction {
            position: absolute;
            inset: 0;
            z-index: 0;
            border-radius: inherit;
            backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
            -webkit-backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
            backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%) url(#glass-distortion));
            -webkit-backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%) url(#glass-distortion));
            filter: var(--glass-refraction-filter, url(#glass-distortion));
            pointer-events: none;
            overflow: hidden;
            isolation: isolate;
        }

        /* Tier A Layer 0: 较轻模糊 (blur(5px) saturate(130%)) */
        .tier-a .glass-refraction {
            backdrop-filter: var(--glass-backdrop-blur, blur(5px) saturate(130%));
            -webkit-backdrop-filter: var(--glass-backdrop-blur, blur(5px) saturate(130%));
            backdrop-filter: var(--glass-backdrop-filter, blur(5px) saturate(130%) url(#glass-distortion));
            -webkit-backdrop-filter: var(--glass-backdrop-filter, blur(5px) saturate(130%) url(#glass-distortion));
        }

        /* Tier B Layer 0: 深度模糊与折射 (blur(14px) saturate(135%)) */
        .tier-b .glass-refraction {
            backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
            -webkit-backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
            backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%) url(#glass-distortion));
            -webkit-backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%) url(#glass-distortion));
        }

        /* Layer 1: 半透明底色衬底层 (默认 Tier C: 亮色 0.72, 暗色 0.72) */
        .card:not(.flat):not(.info):not(.danger)::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg-surface, rgba(255, 255, 255, 0.72));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        :host-context([data-theme='dark']) .card:not(.flat):not(.info):not(.danger)::after {
            background: var(--glass-bg-surface, rgba(31, 32, 34, 0.72));
        }

        /* 默认 Tier C / .tier-c: 严禁 hover 任何视觉或位移变化 */
        .tier-c,
        .card:not(.tier-a):not(.tier-b):not(.flat):not(.info):not(.danger) {
            cursor: default;
        }
        .tier-c:hover,
        .card:not(.tier-a):not(.tier-b):not(.flat):not(.info):not(.danger):hover {
            transform: none !important;
            box-shadow: var(--glass-shadow) !important;
        }
        .tier-c:hover::after,
        .card:not(.tier-a):not(.tier-b):not(.flat):not(.info):not(.danger):hover::after {
            background: var(--glass-bg-surface, rgba(255, 255, 255, 0.72)) !important;
        }
        :host-context([data-theme='dark']) .tier-c:hover::after,
        :host-context([data-theme='dark']) .card:not(.tier-a):not(.tier-b):not(.flat):not(.info):not(.danger):hover::after {
            background: var(--glass-bg-surface, rgba(31, 32, 34, 0.72)) !important;
        }

        /* Tier B (.tier-b): 高不透明衬底 (0.82 固定)，严禁 hover 反应 */
        .tier-b::after {
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82)) !important;
        }
        :host-context([data-theme='dark']) .tier-b::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82)) !important;
        }
        .tier-b:hover {
            transform: none !important;
            box-shadow: var(--glass-shadow) !important;
        }
        .tier-b:hover::after {
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82)) !important;
        }
        :host-context([data-theme='dark']) .tier-b:hover::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82)) !important;
        }

        /* Tier A (.tier-a): 可交互卡片 (0.60 -> hover 0.68 + translateY(-4px)) */
        .tier-a {
            cursor: pointer;
        }
        .tier-a::after {
            background: var(--glass-bg, rgba(255, 255, 255, 0.60)) !important;
        }
        :host-context([data-theme='dark']) .tier-a::after {
            background: var(--glass-bg, rgba(31, 32, 34, 0.60)) !important;
        }
        .tier-a:hover {
            transform: translateY(-4px);
            box-shadow: var(--glass-shadow-hover);
        }
        .tier-a:hover::after {
            background: var(--glass-bg-hover, rgba(255, 255, 255, 0.68)) !important;
        }
        :host-context([data-theme='dark']) .tier-a:hover::after {
            background: var(--glass-bg-hover, rgba(38, 40, 44, 0.68)) !important;
        }

        /* Layer 2: 双轴微光圈层 (默认 Tier C: 完整双轴微光圈) */
        .card:not(.flat):not(.info):not(.danger)::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background:
                linear-gradient(to right,
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 0,
                    rgba(0, 0, 0, 0) var(--lg-rim-side, 4px),
                    rgba(0, 0, 0, 0) calc(100% - var(--lg-rim-side, 4px)),
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 100%),
                linear-gradient(to bottom,
                    rgba(255, 255, 255, var(--lg-rim-lit, 0.95)) 0,
                    rgba(255, 255, 255, var(--lg-rim-lit, 0.95)) var(--lg-rim-hold, 1px),
                    rgba(255, 255, 255, 0) var(--lg-rim-fade, 12px),
                    rgba(255, 255, 255, 0) calc(100% - var(--lg-rim-fade, 12px)),
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.4)) calc(100% - var(--lg-rim-hold, 1px)),
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.4)) 100%);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
            transition: opacity 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }

        /* Tier B 弱化微光圈 */
        .tier-b::before {
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) 1px,
                rgba(255, 255, 255, 0) 12px);
        }

        /* Layer 3: 内容容器 */
        .content-wrapper {
            position: relative;
            z-index: 3;
        }

        /* 传统扁平卡片（仅当开发者显式指定 flat 时降级） */
        .card.flat,
        :host([glass-mode="flat"]) .card,
        :host([glass-mode="none"]) .card {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6);
            box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            cursor: default;
            transform: none !important;
        }
        .card.flat::before,
        .card.flat::after,
        :host([glass-mode="flat"]) .card::before,
        :host([glass-mode="flat"]) .card::after,
        :host([glass-mode="none"]) .card::before,
        :host([glass-mode="none"]) .card::after {
            display: none;
        }

        .info {
            color: #fff;
            border: none;
            background: linear-gradient(135deg, #00263b, #004060);
            box-shadow: 0 12px 30px rgba(0, 29, 49, 0.22);
            cursor: default;
        }
        .danger {
            border: 1px solid var(--danger-border, #e58f8f);
            border-left: 4px solid var(--danger-color, #ea4335);
            background: var(--danger-bg, #fff1f1);
            color: var(--text-main, #00263b);
            cursor: default;
        }
        :host-context([data-theme='dark']) .danger {
            background: rgba(234, 67, 53, 0.12);
            border-color: rgba(234, 67, 53, 0.35);
            border-left-color: var(--danger-color, #ea4335);
            color: var(--text-main, #e5e8ea);
        }
        .header-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        .body {
            color: inherit;
            font-size: 14px;
            line-height: 1.65;
        }
        .standard .body,
        .glass .body,
        .liquid-glass .body,
        .tier-a .body,
        .tier-b .body,
        .tier-c .body,
        .danger .body {
            color: var(--text-light, #666);
        }
    `;

    constructor() {
        super();
        this.variant = 'liquid-glass';
        this.tier = 'c';
        this.title = '';
        this.header = '';
        this.icon = '';
        this.glassMode = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    render() {
        const isFlat = this.variant === 'flat' || this.glassMode === 'flat' || this.glassMode === 'none';
        const isGlass = !isFlat && this.variant !== 'info' && this.variant !== 'danger';
        const rawTier = (this.tier || '').toLowerCase().trim();
        const normalizedTier = rawTier === 'a' || this.variant === 'interactive' ? 'a' : (rawTier === 'b' ? 'b' : 'c');
        const tierClass = normalizedTier === 'a' ? 'tier-a' : (normalizedTier === 'b' ? 'tier-b' : 'tier-c');
        const headingText = this.title || this.header;

        return html`
            <section class="card ${this.variant} ${tierClass}">
                ${isGlass ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="content-wrapper">
                    ${headingText
                        ? html`
                              <div class="header-row">
                                  ${this.icon ? html`<cgo-icon name="${this.icon}" size="18"></cgo-icon>` : null}
                                  <h3>${headingText}</h3>
                              </div>
                          `
                        : null}
                    <div class="body"><slot></slot></div>
                </div>
            </section>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-card') || customElements.define('cgo-card', CgoCard);
}
