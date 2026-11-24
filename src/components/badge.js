import { LitElement, html, css } from 'lit';
import { hairlineRimLightRules } from '../styles/glass-shared.js';

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
            box-shadow: var(--cgo-shadow-control, 0 1px 2px rgba(0, 0, 0, 0.04));
            border: none;
        }

        .badge::before {
            ${hairlineRimLightRules}
        }

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
            background: var(--cgo-badge-info-bg, var(--info-bg, #e7f3fb));
            color: var(--cgo-badge-info-color, var(--info-color, #006098));
        }
        .muted {
            background: var(--cgo-badge-muted-bg, var(--btn-info-bg, #f1f3f5));
            color: var(--cgo-badge-muted-color, var(--text-main, #00263b));
        }

        :host([pill]) .badge {
            padding: 4px 14px;
            border-radius: var(--radius-full, 9999px);
            font-size: var(--text-xs, 12px);
            font-weight: 600;
            letter-spacing: 0.02em;
            box-shadow: var(--cgo-shadow-control, 0 1px 2px rgba(0, 0, 0, 0.05));
        }

        .brand {
            background: var(--cgo-badge-brand-bg, var(--primary-color, #006098));
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

    _effectiveSubsystem() {
        const raw = this.subsystem || (this.variant?.startsWith('brand-') ? this.variant.slice(6) : '');
        const trimmed = String(raw || '').trim();
        return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : '';
    }

    updated() {
        const sub = this._effectiveSubsystem();
        if (sub) {
            this.style.setProperty('--cgo-badge-brand-bg', `var(--brand-gradient-${sub})`);
        } else {
            this.style.removeProperty('--cgo-badge-brand-bg');
        }
    }

    render() {
        if (this._effectiveSubsystem()) {
            return html`
                <span class="badge brand"><slot></slot></span>
            `;
        }
        const effectiveVariant = this.variant === 'secondary' ? 'info' : this.variant || 'primary';
        return html`
            <span class="badge ${effectiveVariant}"><slot></slot></span>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-badge') || customElements.define('cgo-badge', CgoBadge);
}
