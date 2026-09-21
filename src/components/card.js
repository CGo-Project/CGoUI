import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';

export class CgoCard extends LitElement {
    static properties = {
        variant: { type: String },
        title: { type: String },
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
            transition: box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
            overflow: hidden;
            isolation: isolate;
        }
        .card:hover {
            box-shadow: var(--glass-shadow-hover);
        }

        /* ===== 玻璃卡片体系（默认对齐 tool.html 苹果物理折射液态玻璃） ===== */
        .glass,
        .liquid-glass,
        .card:not(.flat):not(.info):not(.danger) {
            background: transparent;
            border: none;
            box-shadow: var(--glass-shadow);
            overflow: hidden;
            isolation: isolate;
        }

        /* Layer 0: 折射磨砂层 (完全对齐 tool.html) */
        .glass-refraction {
            position: absolute;
            inset: 0;
            z-index: 0;
            border-radius: inherit;
            backdrop-filter: var(--glass-backdrop-blur, blur(5px) saturate(130%));
            -webkit-backdrop-filter: var(--glass-backdrop-blur, blur(5px) saturate(130%));
            backdrop-filter: var(--glass-backdrop-filter, blur(5px) saturate(130%) url(#glass-distortion));
            -webkit-backdrop-filter: var(--glass-backdrop-filter, blur(5px) saturate(130%) url(#glass-distortion));
            filter: var(--glass-refraction-filter, url(#glass-distortion));
            pointer-events: none;
            overflow: hidden;
            isolation: isolate;
        }

        /* Layer 1: 半透明底色衬底层 (完全对齐 tool.html: 亮色 0.60, 暗色 0.60) */
        .glass::after,
        .liquid-glass::after,
        .card:not(.flat):not(.info):not(.danger)::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg, rgba(255, 255, 255, 0.60));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        .glass:hover::after,
        .liquid-glass:hover::after,
        .card:not(.flat):not(.info):not(.danger):hover::after {
            background: var(--glass-bg-hover, rgba(255, 255, 255, 0.68));
        }

        :host-context([data-theme='dark']) .glass::after,
        :host-context([data-theme='dark']) .liquid-glass::after,
        :host-context([data-theme='dark']) .card:not(.flat):not(.info):not(.danger)::after {
            background: var(--glass-bg, rgba(31, 32, 34, 0.60));
        }

        :host-context([data-theme='dark']) .glass:hover::after,
        :host-context([data-theme='dark']) .liquid-glass:hover::after,
        :host-context([data-theme='dark']) .card:not(.flat):not(.info):not(.danger):hover::after {
            background: var(--glass-bg-hover, rgba(38, 40, 44, 0.68));
        }

        /* Layer 2: 双轴微光圈层 (完全对齐 tool.html 极简微边框) */
        .glass::before,
        .liquid-glass::before,
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

        /* Layer 3: 内容容器（确保文字与插槽绝对锐利清晰） */
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
        }
        .danger {
            border-color: var(--danger-border, #e58f8f);
            background: var(--danger-bg, #fff1f1);
        }
        h3 {
            margin: 0 0 8px;
            font-size: 18px;
            font-weight: 700;
        }
        .body {
            color: inherit;
            font-size: 14px;
            line-height: 1.65;
        }
        .standard .body,
        .glass .body,
        .liquid-glass .body,
        .danger .body {
            color: var(--text-light, #666);
        }
    `;

    constructor() {
        super();
        this.variant = 'liquid-glass';
        this.title = '';
        this.glassMode = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    render() {
        const isFlat = this.variant === 'flat' || this.glassMode === 'flat' || this.glassMode === 'none';
        const isGlass = !isFlat && this.variant !== 'info' && this.variant !== 'danger';
        return html`
            <section class="card ${this.variant}">
                ${isGlass ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="content-wrapper">
                    ${this.title
                        ? html`
                              <h3>${this.title}</h3>
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
