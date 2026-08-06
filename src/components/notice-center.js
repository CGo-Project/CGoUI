import { LitElement, html, css } from 'lit';
import './notice-card.js';

const NOTIF_ICON = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;

/**
 * <cgo-notice-center> — CGoPush 标准通知中心面板组件
 */
export class CgoNoticeCenter extends LitElement {
    static properties = {
        title: { type: String },
        items: {
            type: Array,
            converter: (value) => {
                if (!value) return [];
                if (Array.isArray(value)) return value;
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return [];
                }
            }
        },
        muted: { type: Boolean, reflect: true },
        maxHeight: { type: String, attribute: 'max-height' }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            max-width: 320px;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            box-sizing: border-box;
        }

        .center-panel {
            width: 100%;
            background: var(--panel-bg, var(--card-bg, #ffffff));
            border-radius: var(--radius-md, 10px);
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
            box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.09));
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding: 12px 0 10px;
            max-height: var(--panel-max-height, 480px);
            overflow: hidden;
        }

        .panel-title {
            font-size: 13px;
            font-weight: 700;
            text-align: center;
            margin: 0;
            padding: 0 12px 8px;
            border-bottom: 2px solid var(--border-color, rgba(0, 0, 0, 0.12));
            color: var(--text-main, #00263b);
            flex-shrink: 0;
        }

        .list-container {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px 12px;
            min-height: 80px;
            background: var(--notice-center-list-bg, rgba(0, 0, 0, 0.035));
        }

        :host([data-theme='dark']) .list-container,
        :host-context([data-theme='dark']) .list-container {
            background: var(--notice-center-list-bg-dark, rgba(0, 0, 0, 0.32));
        }

        .empty-tip {
            text-align: center;
            font-size: 12px;
            color: var(--text-light, #888888);
            padding: 24px 10px;
        }

        .panel-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0;
            padding: 8px 12px 0;
            border-top: 2px solid var(--border-color, rgba(0, 0, 0, 0.12));
            flex-shrink: 0;
        }

        .btn-clear {
            font-size: 11px;
            color: var(--text-light, #666666);
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px 6px;
            border-radius: var(--radius-xs, 4px);
            transition: background 0.2s, color 0.2s;
        }

        .btn-clear:hover {
            background: var(--tab-hover, rgba(0, 0, 0, 0.06));
            color: var(--danger-color, #dc3545);
        }

        .btn-mute {
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--text-light, #666666);
            background: transparent;
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
            padding: 3px 8px;
            border-radius: var(--radius-xs, 4px);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-mute:hover {
            background: var(--tab-hover, rgba(0, 0, 0, 0.06));
            color: var(--text-main, #00263b);
        }

        .btn-mute.is-active {
            background: var(--info-bg, rgba(0, 133, 196, 0.1));
            color: var(--primary-color, #006098);
            border-color: var(--primary-color, #006098);
        }
    `;

    constructor() {
        super();
        this.title = '通知中心';
        this.items = [];
        this.muted = false;
        this.maxHeight = '';
    }

    _handleClear(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('cgo-notice-clear', {
            bubbles: true,
            composed: true
        }));
    }

    _handleMuteToggle(e) {
        e.stopPropagation();
        this.muted = !this.muted;
        this.dispatchEvent(new CustomEvent('cgo-notice-mute-toggle', {
            bubbles: true,
            composed: true,
            detail: { muted: this.muted }
        }));
    }

    _handleItemAction(item, e) {
        this.dispatchEvent(new CustomEvent('cgo-notice-action', {
            bubbles: true,
            composed: true,
            detail: { item, eventDetail: e.detail }
        }));
    }

    render() {
        const styleAttr = this.maxHeight ? `--panel-max-height: ${this.maxHeight};` : '';
        const itemList = Array.isArray(this.items) ? this.items : [];

        return html`
            <div class="center-panel" style="${styleAttr}">
                <div class="panel-title">${this.title}</div>

                <div class="list-container">
                    ${itemList.length === 0 ? html`
                        <div class="empty-tip">暂无通知公告</div>
                    ` : itemList.map(item => html`
                        <cgo-notice-card
                            category=${item.category || 'software'}
                            notice-title=${item.title || ''}
                            content=${item.content || ''}
                            image-url=${item.imageUrl || item.image || ''}
                            .actions=${item.actions || []}
                            @cgo-notice-action=${(e) => this._handleItemAction(item, e)}
                        ></cgo-notice-card>
                    `)}
                </div>

                <div class="panel-footer">
                    <button class="btn-clear" @click=${this._handleClear}>清除所有通知</button>
                    <button class="btn-mute ${this.muted ? 'is-active' : ''}" @click=${this._handleMuteToggle}>
                        <span .innerHTML=${NOTIF_ICON}></span>
                        <span>${this.muted ? '已静默' : '免打扰'}</span>
                    </button>
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-notice-center') || customElements.define('cgo-notice-center', CgoNoticeCenter);
}
