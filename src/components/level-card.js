import { LitElement, html, css } from 'lit';

export class CgoLevelCard extends LitElement {
    static properties = {
        level: { type: String, reflect: true },
        label: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .card {
            position: relative;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            min-height: 96px;
            padding: 24px 30px;
            border-radius: var(--radius-lg, 12px);
            overflow: hidden;
            color: #fff;
            background: var(--level-default-gradient, linear-gradient(135deg, #009655, #43b581));
            box-shadow: 0 8px 32px rgba(0, 150, 85, 0.18);
            color-scheme: only light;
            forced-color-adjust: none;
        }
        :host([level='test']) .card {
            background: var(--level-test-gradient, linear-gradient(135deg, #e98913, #f0b14a));
            box-shadow: 0 8px 32px rgba(233, 137, 19, 0.22);
        }
        :host([level='prime']) .card {
            background: var(--level-prime-gradient, linear-gradient(135deg, #5f1985, #9a56c8));
            box-shadow: 0 8px 32px rgba(95, 25, 133, 0.25);
        }
        :host([level='admin']) .card {
            background: var(--level-admin-gradient, linear-gradient(135deg, #5c1c24, #9b3846));
            box-shadow: 0 8px 32px rgba(92, 28, 36, 0.25);
        }
        .tag {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px 12px;
            border-radius: var(--radius-xl, 20px);
            background: rgba(255, 255, 255, 0.22);
            color: #fff;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            font-size: var(--text-md, 0.9rem);
            font-weight: 700;
        }
    `;

    constructor() {
        super();
        this.level = 'default';
        this.label = '';
    }

    _label() {
        if (this.label) return this.label;
        return (
            {
                default: '常旅客',
                test: '先锋旅客',
                prime: '启元旅客',
                admin: '管理员',
            }[this.level] || '常旅客'
        );
    }

    render() {
        return html`
            <section class="card"><span class="tag">${this._label()}</span></section>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-level-card') || customElements.define('cgo-level-card', CgoLevelCard);
}
