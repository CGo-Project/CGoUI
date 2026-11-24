import { LitElement, html, css } from 'lit';
import './icon.js';

/**
 * <cgo-tabs>
 *   <cgo-tab label="实时录音" icon="speaker">录音内容</cgo-tab>
 *   <cgo-tab label="本地上传" icon="upload">上传内容</cgo-tab>
 * </cgo-tabs>
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
            animation: tabFadeIn 160ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes tabFadeIn {
            from {
                opacity: 0;
                transform: translateY(3px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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

        .tab-pill-group {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: var(--cgo-subtle-hover, rgba(0, 38, 59, 0.05));
            border: 1px solid var(--cgo-subtle-border, rgba(0, 0, 0, 0.08));
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
            touch-action: manipulation;
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

        @media (hover: hover) and (pointer: fine) {
            .tab-btn:hover:not(.active):not([disabled]) {
                color: var(--text-main, #00263b);
                background: var(--cgo-subtle-hover, rgba(0, 0, 0, 0.03));
            }
        }

        .tab-btn:focus-visible {
            box-shadow: 0 0 0 2px var(--primary-color, #006098);
        }

        /* 激活选中项（高光浮起卡片质感） */
        .tab-btn.active {
            background: var(--cgo-tab-active-bg, var(--card-bg, #ffffff));
            color: var(--primary-color, #006098);
            font-weight: 600;
            border-color: var(--cgo-subtle-border, rgba(0, 0, 0, 0.04));
            box-shadow: var(--cgo-tab-active-shadow, 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04));
        }

        .tab-btn.active cgo-icon {
            color: var(--primary-color, #006098);
        }

        .tab-btn:active:not([disabled]) {
            transform: scale(0.96);
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
        this._initialized = false;
    }

    get _tabs() {
        return [...this.querySelectorAll('cgo-tab')];
    }

    _resolveValidIndex(candidate, tabs) {
        if (!tabs.length) return 0;
        let idx = Number.isFinite(candidate) ? Math.trunc(candidate) : 0;
        if (idx < 0 || idx >= tabs.length) idx = 0;
        if (tabs[idx]?.disabled) {
            const firstEnabled = tabs.findIndex((t) => !t.disabled);
            return firstEnabled >= 0 ? firstEnabled : idx;
        }
        return idx;
    }

    _syncActive(i, emit = false) {
        const tabs = this._tabs;
        if (!tabs.length) return;
        const targetIdx = this._resolveValidIndex(i, tabs);
        if (tabs[targetIdx]?.disabled) return;
        const changed = this.index !== targetIdx;
        this.index = targetIdx;
        tabs.forEach((t, idx) => {
            t.active = idx === targetIdx;
        });
        this.requestUpdate();
        if (emit && (changed || i === targetIdx)) {
            this.dispatchEvent(new CustomEvent('cgo-tab-change', { detail: { index: targetIdx }, bubbles: true, composed: true }));
        }
    }

    _select(i) {
        const tabs = this._tabs;
        if (!tabs.length || i < 0 || i >= tabs.length) return;
        if (tabs[i]?.disabled) return;
        this._syncActive(i, true);
    }

    _onKeyDown(e, i) {
        const tabs = this._tabs;
        if (!tabs.length) return;
        const move = (start, delta) => {
            for (let step = 1; step <= tabs.length; step++) {
                const candidate = (start + delta * step + tabs.length) % tabs.length;
                if (!tabs[candidate]?.disabled) return candidate;
            }
            return start;
        };
        let nextIdx = -1;
        if (e.key === 'ArrowRight') nextIdx = move(i, 1);
        else if (e.key === 'ArrowLeft') nextIdx = move(i, -1);
        else if (e.key === 'Home') nextIdx = move(-1, 1);
        else if (e.key === 'End') nextIdx = move(0, -1);
        else return;

        e.preventDefault();
        this._select(nextIdx);
        this.updateComplete.then(() => {
            const btns = this.shadowRoot?.querySelectorAll('.tab-btn');
            btns?.[nextIdx]?.focus();
        });
    }

    _syncHasPanels() {
        const tabs = this._tabs;
        const hasPanels = tabs.some((t) => (t.textContent || '').trim().length > 0 || t.children.length > 0);
        if (hasPanels) {
            if (!this.hasAttribute('has-panels')) this.setAttribute('has-panels', '');
        } else if (this.hasAttribute('has-panels')) {
            this.removeAttribute('has-panels');
        }
    }

    updated(changedProperties) {
        this._syncHasPanels();
        if (changedProperties.has('index')) {
            const tabs = this._tabs;
            tabs.forEach((t, idx) => {
                t.active = idx === this.index;
            });
        }
    }

    firstUpdated() {
        this._syncHasPanels();
        const tabs = this._tabs;
        const activeIdx = tabs.findIndex((t) => t.hasAttribute('active') || t.active);
        this._initialized = true;
        this._syncActive(activeIdx >= 0 ? activeIdx : (this.index || 0), false);
    }

    _onSlotChange() {
        this._syncHasPanels();
        if (!this._initialized) return;
        const tabs = this._tabs;
        const activeIdx = tabs.findIndex((t) => t.hasAttribute('active') || t.active);
        this._syncActive(activeIdx >= 0 ? activeIdx : (this.index || 0), false);
    }

    render() {
        const tabs = this._tabs;
        const hasPanels = tabs.some((t) => (t.textContent || '').trim().length > 0 || t.children.length > 0);

        return html`
            <div class="tab-pill-group" role="tablist">
                ${tabs.map(
                    (t, i) => html`
                        <button
                            type="button"
                            role="tab"
                            class="tab-btn ${i === this.index ? 'active' : ''}"
                            ?disabled=${t.disabled}
                            tabindex=${i === this.index ? '0' : '-1'}
                            aria-selected=${String(i === this.index)}
                            @click=${() => this._select(i)}
                            @keydown=${(e) => this._onKeyDown(e, i)}
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
