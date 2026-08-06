import { LitElement, html, css } from 'lit';

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
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 2px 8px;
            border-radius: var(--radius-full, 9999px);
            font-size: var(--text-xs, 11px);
            font-weight: 700;
            line-height: 1.4;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .primary {
            background: var(--primary-color, #006098);
            color: #fff;
        }
        .success {
            background: var(--success-color, #34a853);
            color: #fff;
        }
        .danger {
            background: var(--danger-color, #ea4335);
            color: #fff;
        }
        .warning {
            background: var(--warning-color, #f59e0b);
            color: #fff;
        }
        .info {
            background: var(--info-bg, #e7f3fb);
            color: var(--info-color, #006098);
        }
        .muted {
            background: var(--btn-info-bg, #f1f3f5);
            color: var(--text-light, #636f75);
        }
        :host([pill]) .badge {
            padding: 6px 12px;
            border-radius: var(--radius-xl, 20px);
            font-weight: 700;
        }
        .brand {
            color: #fff;
            border-radius: var(--radius-xs, 4px);
            font-size: var(--text-sm, 12px);
            font-weight: 600;
            margin-left: 4px;
            vertical-align: middle;
        }
        :host([pill]) .brand {
            margin-left: 0;
            border-radius: var(--radius-xl, 20px);
            font-weight: 700;
            font-size: var(--text-md, 0.9rem);
            box-shadow: var(--shadow-xs, 0 1px 3px rgba(0, 0, 0, 0.08));
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
            const style = `background:var(--brand-gradient-${this.subsystem});border:1px solid var(--brand-border-${this.subsystem});`;
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
