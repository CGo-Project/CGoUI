import { LitElement, html, css } from 'lit';

export class CgoCard extends LitElement {
    static properties = {
        variant: { type: String },
        title: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .card {
            padding: 24px;
            border-radius: var(--radius-lg, 12px);
            background: var(--card-bg, #fff);
            color: var(--text-main, #00263b);
            border: 1px solid transparent;
            box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
            box-sizing: border-box;
        }
        .card:hover {
            box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
        }
        .glass {
            background: var(--glass-bg, rgba(255, 255, 255, 0.7));
            border-color: var(--glass-border, rgba(255, 255, 255, 0.4));
            box-shadow: 0 8px 32px var(--glass-shadow, rgba(0, 0, 0, 0.08));
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
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
        .danger .body {
            color: var(--text-light, #666);
        }
    `;

    constructor() {
        super();
        this.variant = 'standard';
        this.title = '';
    }

    render() {
        return html`
            <section class="card ${this.variant}">
                ${this.title
                ? html`
                          <h3>${this.title}</h3>
                      `
                : null}
                <div class="body"><slot></slot></div>
            </section>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-card') || customElements.define('cgo-card', CgoCard);
}
