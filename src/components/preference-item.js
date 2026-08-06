import { LitElement, html, css } from 'lit';
import './button.js';

export class CgoPreferenceItem extends LitElement {
    static properties = {
        icon: { type: String },
        name: { type: String },
        title: { type: String },
        detail: { type: String },
        action: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 14px 20px;
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: 8px;
            background: var(--panel-bg, #fff);
            color: var(--text-main, #00263b);
            box-sizing: border-box;
            transition: background-color var(--transition-base, 0.2s ease);
        }
        .item:hover {
            background: var(--btn-info-bg, #e9ecef);
        }
        .left {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 180px;
            min-width: 0;
            flex-shrink: 0;
        }
        .icon {
            width: 26px;
            height: 26px;
            border-radius: var(--radius-xs, 4px);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--btn-info-bg, #e9ecef);
            font-size: 16px;
            flex-shrink: 0;
        }
        .name {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.9rem;
            font-weight: 600;
            line-height: 1.3;
            color: var(--text-main, #00263b);
        }
        .title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.95rem;
            font-weight: 500;
            line-height: 1.3;
            color: var(--text-main, #00263b);
        }
        .detail {
            color: var(--text-light, #666);
            font-size: 0.88rem;
            line-height: 1.35;
            overflow-wrap: anywhere;
        }
        .middle {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            min-width: 0;
            padding-right: 20px;
        }
        .action {
            min-width: 64px;
            height: 34px;
            padding: 0 14px;
            border-radius: var(--radius-xs, 4px);
            border: 1px solid var(--primary-color, #00263b);
            background: var(--card-bg, #fff);
            color: var(--primary-color, #00263b);
            font: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            flex-shrink: 0;
        }
        .action:hover {
            background: var(--primary-color, #00263b);
            color: #fff;
        }
        @media (max-width: 720px) {
            .item {
                flex-wrap: wrap;
                align-items: flex-start;
            }
            .left {
                width: 100%;
            }
            .middle {
                width: 100%;
                flex-basis: 100%;
                padding-right: 0;
            }
            .action {
                width: max-content;
            }
        }
    `;

    constructor() {
        super();
        this.icon = '⚙️';
        this.name = '项目';
        this.title = '项目选项';
        this.detail = '选项详细信息';
        this.action = '配置';
    }

    render() {
        return html`
            <div class="item">
                <div class="left">
                    <span class="icon">${this.icon}</span>
                    <span class="name">${this.name}</span>
                </div>
                <div class="middle">
                    <span class="title">${this.title}</span>
                    <span class="detail">${this.detail}</span>
                </div>
                <button
                    class="action"
                    type="button"
                    @click=${() =>
                        this.dispatchEvent(new CustomEvent('cgo-preference-action', { bubbles: true, composed: true }))}
                >
                    ${this.action}
                </button>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-preference-item') || customElements.define('cgo-preference-item', CgoPreferenceItem);
}
