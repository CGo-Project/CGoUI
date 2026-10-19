import { LitElement, html, css } from 'lit';
import { hairlineRimLightRules, hairlineRimDarkRules } from '../styles/glass-shared.js';

/**
 * <cgo-badge variant="primary">NEW</cgo-badge>
 * variant: primary(默认) | success | danger | warning | info | muted
 */
export class CgoBadge extends LitElement {
    static properties = {
        variant: { type: String },
        subsystem: { type: String },
        pill: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: inline-flex;
            vertical-align: middle;
        }
        .badge {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 2px 8px;
            border-radius: var(--radius-full, 9999px);
            font-size: var(--text-xs, 11px);
            font-weight: 600;
            line-height: 1.4;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            box-sizing: border-box;
            white-space: nowrap;
            user-select: none;
            overflow: hidden;
            isolation: isolate;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            border: none;
        }

        /* 同步 cgo-button 精致 1px 双轴微光描边 (Layer 2 Masked 1px Hairline Rim Light) */
        .badge::before {
            ${hairlineRimLightRules}
        }

        :host-context([data-theme='dark']) .badge::before {
            ${hairlineRimDarkRules}
        }

        /* 保证徽章内容在 Layer 3 (z-index: 3) 绝对清晰 */
        .badge > *,
        ::slotted(*) {
            position: relative;
            z-index: 3;
        }

        .primary {
            background: var(--primary-color, #006098);
            color: #fff;
            box-shadow: 0 1px 2px rgba(0, 96, 152, 0.2);
        }
        .success {
            background: var(--success-color, #34a853);
            color: #fff;
            box-shadow: 0 1px 2px rgba(52, 168, 83, 0.2);
        }
        .danger {
            background: var(--danger-color, #ea4335);
            color: #fff;
            box-shadow: 0 1px 2px rgba(234, 67, 53, 0.2);
        }
        .warning {
            background: var(--warning-color, #f59e0b);
            color: #fff;
            box-shadow: 0 1px 2px rgba(245, 158, 11, 0.2);
        }
        .info {
            background: var(--info-bg, #e7f3fb);
            color: var(--info-color, #006098);
        }
        .muted {
            background: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #00263b);
        }

        /* 胶囊外观（同步 cgo-button pill） */
        :host([pill]) .badge {
            padding: 4px 14px;
            border-radius: var(--radius-full, 9999px);
            font-size: var(--text-xs, 12px);
            font-weight: 600;
            letter-spacing: 0.02em;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        :host-context([data-theme='dark']) .info {
            background: rgba(56, 189, 248, 0.16);
            color: #38bdf8;
        }
        :host-context([data-theme='dark']) .muted {
            background: var(--btn-info-bg, #262729);
            color: var(--text-main, #e5e8ea);
        }
        :host-context([data-theme='dark']) .primary {
            background: var(--primary-color, #0070b0);
            color: #ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        :host-context([data-theme='dark']) :host([pill]) .badge {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }

        .brand {
            color: #fff;
            border-radius: var(--radius-full, 9999px);
            font-size: var(--text-xs, 12px);
            font-weight: 600;
            margin-left: 4px;
            vertical-align: middle;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }
        :host([pill]) .brand {
            margin-left: 0;
            padding: 4px 14px;
            border-radius: var(--radius-full, 9999px);
            font-size: var(--text-xs, 12px);
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }
    `;

    constructor() {
        super();
        this.variant = 'primary';
        this.subsystem = '';
        this.pill = false;
    }

    render() {
        // subsystem 优先：使用品牌渐变 token
        if (this.subsystem) {
            const style = `background:var(--brand-gradient-${this.subsystem});`;
            return html`
                <span class="badge brand" style=${style}><slot></slot></span>
            `;
        }
        return html`
            <span class="badge ${this.variant}"><slot></slot></span>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-badge') || customElements.define('cgo-badge', CgoBadge);
}
