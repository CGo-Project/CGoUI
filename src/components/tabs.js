import { LitElement, html, css } from 'lit';
import './icon.js';

/**
 * <cgo-tabs>
 *   <cgo-tab label="实时录音" icon="speaker">录音内容</cgo-tab>
 *   <cgo-tab label="本地上传" icon="upload">上传内容</cgo-tab>
 * </cgo-tabs>
 * 移植自 CGo-Voice 声音克隆中心的高颜值分段胶囊标签组 (.tab-pill-group)。
 * 支持 icon、pill 胶囊圆角、full 全宽、size 尺寸，支持深浅主题自适应。
 * 事件: cgo-tab-change（detail.index）。
 */
export class CgoTab extends LitElement {
    static properties = {
        label: { type: String },
        icon: { type: String },
        active: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
    };

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
        this.icon = '';
        this.active = false;
        this.disabled = false;
    }

    render() {
        return html`<slot></slot>`;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tab') || customElements.define('cgo-tab', CgoTab);
}

export class CgoTabs extends LitElement {
    static properties = {
        index: { type: Number },
        full: { type: Boolean, reflect: true },
        pill: { type: Boolean, reflect: true },
        size: { type: String, reflect: true },
        inline: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        :host([inline]),
        :host(:not([full]):not([has-panels])) {
            display: inline-block;
            width: auto;
        }

        /* 移植自 CGo-Voice 声音克隆中心的高颜值分段胶囊标签组 (.tab-pill-group) */
        .tab-pill-group {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: var(--office-hover, rgba(0, 38, 59, 0.05));
            border: 1px solid var(--office-border, rgba(0, 0, 0, 0.08));
            border-radius: var(--radius-md, 8px);
            padding: 3px;
            box-sizing: border-box;
            user-select: none;
            max-width: 100%;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
        }

        .tab-pill-group::-webkit-scrollbar {
            display: none;
        }

        :host([full]) .tab-pill-group {
            display: flex;
            width: 100%;
        }

        :host([pill]) .tab-pill-group {
            border-radius: var(--radius-full, 9999px);
            padding: 4px;
        }

        :host-context([data-theme="dark"]) .tab-pill-group {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.1);
        }

        /* 分段选项卡按钮 */
        .tab-btn {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 16px;
            font-size: 13px;
            font-weight: 500;
            font-family: inherit;
            color: var(--text-light, #64748b);
            background: transparent;
            border: 1px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                border-color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1);
            user-select: none;
            outline: none;
            box-sizing: border-box;
            line-height: 1.4;
            white-space: nowrap;
            -webkit-tap-highlight-color: transparent;
        }

        :host([full]) .tab-btn {
            flex: 1;
        }

        :host([pill]) .tab-btn {
            border-radius: var(--radius-full, 9999px);
            padding: 6px 18px;
        }

        :host([size="sm"]) .tab-btn {
            padding: 4px 12px;
            font-size: 12px;
        }

        :host([size="sm"][pill]) .tab-btn {
            padding: 4px 14px;
        }

        .tab-btn:hover:not(.active):not([disabled]) {
            color: var(--text-main, #00263b);
            background: rgba(0, 0, 0, 0.03);
        }

        :host-context([data-theme="dark"]) .tab-btn:hover:not(.active):not([disabled]) {
            color: #e2e8f0;
            background: rgba(255, 255, 255, 0.04);
        }

        /* 激活选中项（高光浮起卡片质感） */
        .tab-btn.active {
            background: var(--card-bg, #ffffff);
            color: var(--primary-color, #006098);
            font-weight: 600;
            border-color: rgba(0, 0, 0, 0.04);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .tab-btn.active cgo-icon {
            color: var(--primary-color, #006098);
        }

        :host-context([data-theme="dark"]) .tab-btn.active {
            background: rgba(255, 255, 255, 0.14);
            color: #38bdf8;
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        }

        :host-context([data-theme="dark"]) .tab-btn.active cgo-icon {
            color: #38bdf8;
        }

        .tab-btn:active:not([disabled]) {
            transform: scale(0.98);
        }

        .tab-btn[disabled] {
            opacity: 0.45;
            cursor: not-allowed;
            pointer-events: none;
        }

        .tab-btn cgo-icon {
            flex-shrink: 0;
            transition: color var(--dur-fast, 140ms) ease;
        }

        /* 面板内容容器 */
        .panels {
            display: block;
            width: 100%;
            padding-top: 12px;
            box-sizing: border-box;
            color: var(--text-main, #00263b);
        }

        :host([no-panel]) .panels,
        .panels.is-empty {
            display: none !important;
            padding: 0 !important;
        }
    `;

    constructor() {
        super();
        this.index = 0;
        this.full = false;
        this.pill = false;
        this.size = '';
        this.inline = false;
    }

    get _tabs() {
        return [...this.querySelectorAll('cgo-tab')];
    }

    _select(i) {
        const tabs = this._tabs;
        if (!tabs.length) return;
        if (tabs[i] && tabs[i].disabled) return;
        this.index = i;
        tabs.forEach((t, idx) => {
            t.active = idx === i;
        });
        this.requestUpdate();
        this.dispatchEvent(new CustomEvent('cgo-tab-change', { detail: { index: i }, bubbles: true, composed: true }));
    }

    updated(changedProperties) {
        if (changedProperties.has('index')) {
            const tabs = this._tabs;
            tabs.forEach((t, idx) => {
                t.active = idx === this.index;
            });
        }
    }

    firstUpdated() {
        const tabs = this._tabs;
        const activeIdx = tabs.findIndex((t) => t.hasAttribute('active') || t.active);
        this._select(activeIdx >= 0 ? activeIdx : this.index || 0);
    }

    _onSlotChange() {
        this.requestUpdate();
        this._select(this.index || 0);
    }

    render() {
        const tabs = this._tabs;
        const hasPanels = tabs.some(
            (t) => (t.textContent || '').trim().length > 0 || t.children.length > 0
        );
        if (hasPanels) {
            if (!this.hasAttribute('has-panels')) this.setAttribute('has-panels', '');
        } else {
            if (this.hasAttribute('has-panels')) this.removeAttribute('has-panels');
        }

        return html`
            <div class="tab-pill-group" role="tablist">
                ${tabs.map(
                    (t, i) => html`
                        <button
                            type="button"
                            role="tab"
                            class="tab-btn ${i === this.index ? 'active' : ''}"
                            ?disabled=${t.disabled}
                            aria-selected=${i === this.index}
                            @click=${() => this._select(i)}
                        >
                            ${t.icon ? html`<cgo-icon name="${t.icon}" size="${this.size === 'sm' ? '13' : '14'}"></cgo-icon>` : null}
                            <span>${t.label}</span>
                        </button>
                    `
                )}
            </div>
            <div class="panels ${hasPanels ? '' : 'is-empty'}">
                <slot @slotchange=${this._onSlotChange}></slot>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tabs') || customElements.define('cgo-tabs', CgoTabs);
}
