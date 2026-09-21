import { LitElement, html, css } from 'lit';

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
            background: var(--card-bg, #fff);
            color: var(--text-main, #00263b);
            border: 1px solid transparent;
            box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
            box-sizing: border-box;
            transition: transform var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1)),
                        box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
        }
        .card:hover {
            box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
        }

        /* ===== 玻璃卡片体系 ===== */
        .glass,
        .liquid-glass {
            background: transparent;
            border: none;
            box-shadow: var(--glass-shadow, 0 4px 20px rgba(0, 0, 0, 0.08));
            overflow: hidden;
            isolation: isolate;
        }

        /* Layer 0: 折射磨砂层 */
        .glass-refraction {
            position: absolute;
            inset: 0;
            z-index: 0;
            border-radius: inherit;
            backdrop-filter: var(--glass-backdrop-blur, none);
            -webkit-backdrop-filter: var(--glass-backdrop-blur, none);
            filter: var(--glass-refraction-filter, none);
            pointer-events: none;
            overflow: hidden;
        }

        /* Layer 1: 半透明底色衬底层 */
        .glass::after,
        .liquid-glass::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg, rgba(255, 255, 255, 0.7));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        /* Layer 2: 双轴微光圈层 */
        .glass::before,
        .liquid-glass::before {
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
            display: var(--lg-rim-display, none);
            transition: opacity 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }

        /* Layer 3: 内容容器（确保文字与插槽绝对锐利清晰） */
        .content-wrapper {
            position: relative;
            z-index: 3;
        }

        .glass:hover,
        .liquid-glass:hover {
            box-shadow: var(--glass-shadow-hover, var(--shadow-md));
        }

        /* 激活模式下的悬停微位移与温润反光 */
        :host([glass-mode="liquid"]) .card.glass:hover,
        :host([glass-mode="liquid"]) .card.liquid-glass:hover,
        :host([glass-mode="blur"]) .card.glass:hover,
        :host([glass-mode="blur"]) .card.liquid-glass:hover,
        :host-context([glass-mode="liquid"]) .card.glass:hover,
        :host-context([glass-mode="liquid"]) .card.liquid-glass:hover,
        :host-context([glass-mode="blur"]) .card.glass:hover,
        :host-context([glass-mode="blur"]) .card.liquid-glass:hover,
        :host-context([data-glass-mode="liquid"]) .card.glass:hover,
        :host-context([data-glass-mode="liquid"]) .card.liquid-glass:hover,
        :host-context([data-glass-mode="blur"]) .card.glass:hover,
        :host-context([data-glass-mode="blur"]) .card.liquid-glass:hover {
            transform: translateY(-4px);
        }

        /* 组件级 glass-mode 精准重载 */
        :host([glass-mode="liquid"]) .card,
        :host([glass-mode="blur"]) .card {
            border: none;
        }
        :host([glass-mode="liquid"]) {
            --glass-refraction-filter: url(#glass-distortion);
            --glass-backdrop-blur: blur(5px) saturate(130%);
            --glass-bg: rgba(255, 255, 255, 0.60);
            --glass-border: rgba(255, 255, 255, 0.40);
            --glass-shadow:
                0 0 0 0.5px rgba(0, 0, 0, 0.06),
                0 8px 24px -6px rgba(0, 38, 59, 0.06),
                0 2px 6px -2px rgba(0, 38, 59, 0.04),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.8),
                inset 0 -8px 16px -12px rgba(0, 0, 0, 0.03);
            --glass-shadow-hover:
                0 0 0 0.5px rgba(0, 0, 0, 0.08),
                0 14px 30px -8px rgba(0, 38, 59, 0.12),
                0 4px 10px -2px rgba(0, 38, 59, 0.06),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
            --lg-rim-display: block;
        }

        :host([glass-mode="blur"]) {
            --glass-refraction-filter: none;
            --glass-backdrop-blur: blur(5px) saturate(130%);
            --glass-bg: rgba(255, 255, 255, 0.60);
            --glass-border: rgba(255, 255, 255, 0.40);
            --glass-shadow:
                0 0 0 0.5px rgba(0, 0, 0, 0.06),
                0 8px 24px -6px rgba(0, 38, 59, 0.06),
                0 2px 6px -2px rgba(0, 38, 59, 0.04),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.8),
                inset 0 -8px 16px -12px rgba(0, 0, 0, 0.03);
            --glass-shadow-hover:
                0 0 0 0.5px rgba(0, 0, 0, 0.08),
                0 14px 30px -8px rgba(0, 38, 59, 0.12),
                0 4px 10px -2px rgba(0, 38, 59, 0.06),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
            --lg-rim-display: block;
        }

        :host([glass-mode="flat"]),
        :host([glass-mode="none"]) {
            --glass-refraction-filter: none;
            --glass-backdrop-blur: none;
            --glass-bg: var(--card-bg, #ffffff);
            --glass-border: var(--border-color, #dee2e6);
            --glass-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
            --glass-shadow-hover: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
            --lg-rim-display: none;
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
        this.variant = 'standard';
        this.title = '';
        this.glassMode = '';
    }

    render() {
        const isGlass = this.variant === 'glass' || this.variant === 'liquid-glass';
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
