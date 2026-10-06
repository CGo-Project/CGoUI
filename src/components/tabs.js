import { LitElement, html, css } from 'lit';

/**
 * <cgo-tabs>
 *   <cgo-tab label="第一页">内容 A</cgo-tab>
 *   <cgo-tab label="第二页">内容 B</cgo-tab>
 * </cgo-tabs>
 * 选项卡，移植自 cgo_element.css §8。
 * 事件: cgo-tab-change（detail.index）。
 * 键盘: 左右方向键 / Home / End 在标签间移动并切换。
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
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('role')) this.setAttribute('role', 'tabpanel');
    }
    updated(changed) {
        if (changed.has('label')) {
            // 标签按钮在父级 shadow 内，aria-labelledby 跨不过边界，改用 aria-label 给面板命名
            if (!this.hasAttribute('aria-label') || this.getAttribute('aria-label') === this._autoLabel) {
                if (this.label) this.setAttribute('aria-label', this.label);
                else this.removeAttribute('aria-label');
                this._autoLabel = this.label;
            }
            // 标签文字变化后让父级重绘标签栏
            const tabs = this.closest('cgo-tabs');
            if (tabs) tabs.requestUpdate();
        }
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
            /* <button> 外观复位，保持与原 div 标签一致 */
            appearance: none;
            -webkit-appearance: none;
            margin: 0;
            border: 0;
            border-radius: 0;
            background: none;
            line-height: inherit;
            letter-spacing: inherit;
            flex: 0 0 auto;
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
        .tab:focus-visible {
            outline: 2px solid var(--focus-ring, #00263b);
            outline-offset: -2px;
        }
        .tab.active {
            color: var(--primary-text, var(--primary-color, #006098));
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

    /* 让各面板的 active 与 index 保持一致 */
    _syncPanels() {
        this._tabs.forEach((t, idx) => {
            t.active = idx === this.index;
        });
    }

    _select(i) {
        this.index = i;
        this._syncPanels();
        this.dispatchEvent(new CustomEvent('cgo-tab-change', { detail: { index: i }, bubbles: true, composed: true }));
    }

    firstUpdated() {
        this._select(this.index || 0);
    }

    updated(changed) {
        // 外部直接改 index 时同步面板（不重复派发事件）
        if (changed.has('index')) this._syncPanels();
    }

    _onSlotChange() {
        this._syncPanels();
        this.requestUpdate();
    }

    _onKeydown(e, i) {
        const count = this._tabs.length;
        if (!count) return;
        let next;
        if (e.key === 'ArrowRight') next = (i + 1) % count;
        else if (e.key === 'ArrowLeft') next = (i - 1 + count) % count;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = count - 1;
        else return;
        e.preventDefault();
        if (next !== this.index) this._select(next);
        this.updateComplete.then(() => {
            const button = this.shadowRoot.querySelectorAll('.tab')[next];
            if (button) button.focus();
        });
    }

    render() {
        const tabs = this._tabs;
        // roving tabindex：只有当前标签在 Tab 序列里；index 越界时退回第一个
        const focusIndex = this.index >= 0 && this.index < tabs.length ? this.index : 0;
        return html`
            <div class="bar" role="tablist">
                ${tabs.map(
                    (t, i) => html`
                        <button
                            class="tab ${i === this.index ? 'active' : ''}"
                            type="button"
                            role="tab"
                            aria-selected=${i === this.index ? 'true' : 'false'}
                            tabindex=${i === focusIndex ? '0' : '-1'}
                            @click=${() => this._select(i)}
                            @keydown=${(e) => this._onKeydown(e, i)}
                        >
                            ${t.label}
                        </button>
                    `
                )}
            </div>
            <div class="panels"><slot @slotchange=${this._onSlotChange}></slot></div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tabs') || customElements.define('cgo-tabs', CgoTabs);
}
