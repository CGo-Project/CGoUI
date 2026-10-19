import { LitElement, html, css } from 'lit';
import { hairlineRimLightRules } from '../styles/glass-shared.js';

export class CgoLevelCard extends LitElement {
    static properties = {
        level: { type: String, reflect: true },
        label: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
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
            border: none !important;
            outline: none !important;
            overflow: hidden;
            isolation: isolate;
            color: #ffffff;
            background: var(--level-default-gradient, linear-gradient(135deg, #009655, #43b581));
            box-shadow: 0 8px 32px rgba(0, 150, 85, 0.18);
            color-scheme: only light;
            forced-color-adjust: none;
            transition: box-shadow var(--dur-fast, 140ms) ease;
        }

        /* 卡片精致 1px 双轴微光描边（Hairline Rim Light，杜绝实体边框重影） */
        .card::before {
            ${hairlineRimLightRules}
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

        /* 磨砂玻璃等级胶囊标签：彻底移除实体 border 与 inset 阴影的叠圈冲突 */
        .tag {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px 14px;
            border-radius: var(--radius-full, 9999px);
            border: none !important;
            outline: none !important;
            background: rgba(255, 255, 255, 0.22);
            color: #ffffff;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            font-size: var(--text-md, 0.9rem);
            font-weight: 600;
            user-select: none;
            overflow: hidden;
            isolation: isolate;
            z-index: 3;
            transition:
                transform 0.28s cubic-bezier(0.32, 0.72, 0, 1),
                background-color 0.25s ease,
                box-shadow 0.28s cubic-bezier(0.32, 0.72, 0, 1);
        }

        /* 胶囊单像素顶光微光描边（单一光源无重影） */
        .tag::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, 0.75) 0,
                rgba(255, 255, 255, 0.75) 1px,
                rgba(255, 255, 255, 0.12) 100%);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }

        .tag:hover {
            transform: translateY(-1px);
            background: rgba(255, 255, 255, 0.32);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }

        .tag:hover::before {
            opacity: 1;
        }

        .tag-label {
            position: relative;
            z-index: 3;
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
            <section class="card"><span class="tag"><span class="tag-label">${this._label()}</span></span></section>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-level-card') || customElements.define('cgo-level-card', CgoLevelCard);
}
