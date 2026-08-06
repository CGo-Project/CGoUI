import { LitElement, html, css } from 'lit';

/**
 * <cgo-tabs>
 *   <cgo-tab label="第一页">内容 A</cgo-tab>
 *   <cgo-tab label="第二页">内容 B</cgo-tab>
 * </cgo-tabs>
 * 选项卡，移植自 cgo_element.css §8。
 * 事件: cgo-tab-change（detail.index）。
 */
export class CgoTab extends LitElement {
    static properties = { label: { type: String }, active: { type: Boolean, reflect: true } };
    static styles = css`
        :host {
            display: none;
        }
        :host([active]) {
            display: block;
        }
    `;
    constructor() {
        super();
        this.label = '';
        this.active = false;
    }
    render() {
        return html`
            <slot></slot>
        `;
    }
}
if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tab') || customElements.define('cgo-tab', CgoTab);
}

export class CgoTabs extends LitElement {
    static properties = { index: { type: Number } };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        .bar {
            width: 100%;
            overflow-x: auto;
            background: var(--tab-bg, #f1f3f5);
            border-bottom: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
            scrollbar-width: none;
            display: flex;
        }
        .bar::-webkit-scrollbar {
            display: none;
        }
        .tab {
            padding: 12px 20px;
            cursor: pointer;
            font-size: var(--text-base, 14px);
            color: var(--text-light, #666);
            border-bottom: 3px solid transparent;
            transition: all var(--transition-base, 0.2s ease);
            font-weight: 500;
            white-space: nowrap;
            user-select: none;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .tab:hover {
            color: var(--text-main, #00263b);
            background: var(--tab-hover, rgba(0, 0, 0, 0.03));
        }
        .tab.active {
            color: var(--primary-color, #006098);
            font-weight: 700;
            background: var(--card-bg, #fff);
            border-bottom-color: var(--primary-color, #006098);
        }
        .panels {
            background: var(--card-bg, #fff);
            padding: 36px 40px;
            border-radius: 0 0 var(--radius-lg, 12px) var(--radius-lg, 12px);
            box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
            min-height: 104px;
            box-sizing: border-box;
            color: var(--text-main, #00263b);
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        @media (max-width: 600px) {
            .tab {
                padding: 11px 16px;
            }
            .panels {
                padding: 26px 24px;
            }
        }
    `;

    constructor() {
        super();
        this.index = 0;
    }

    get _tabs() {
        return [...this.querySelectorAll('cgo-tab')];
    }

    _select(i) {
        this.index = i;
        this._tabs.forEach((t, idx) => {
            t.active = idx === i;
        });
        this.dispatchEvent(new CustomEvent('cgo-tab-change', { detail: { index: i }, bubbles: true, composed: true }));
    }

    firstUpdated() {
        this._select(this.index || 0);
    }

    render() {
        const tabs = this._tabs;
        return html`
            <div class="bar">
                ${tabs.map(
                    (t, i) => html`
                        <div class="tab ${i === this.index ? 'active' : ''}" @click=${() => this._select(i)}>
                            ${t.label}
                        </div>
                    `
                )}
            </div>
            <div class="panels"><slot></slot></div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tabs') || customElements.define('cgo-tabs', CgoTabs);
}
