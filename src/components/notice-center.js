import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import './notice-card.js';
import './icon.js';
import {
    glassRefractionStyles,
    tierBPanelUnderlayRules,
    tierBRimWeakRules,
} from '../styles/glass-shared.js';

/**
 * <cgo-notice-center> — CGoPush 标准通知中心面板组件
 * 遵循 Liquid Glass Tier B 不可交互底板规范。
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
        maxHeight: { type: String, attribute: 'max-height' },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true }
    };

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 320px;
            min-height: 0;
            max-height: var(--panel-max-height, 480px);
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            box-sizing: border-box;
        }

        .center-panel {
            position: relative;
            display: flex;
            flex-direction: column;
            flex: 0 1 auto;
            width: 100%;
            min-height: 0;
            background: transparent;
            color: var(--text-main, #00263b);
            border: none;
            border-radius: var(--radius-lg, 12px);
            box-shadow: var(--cgo-shadow-dropdown, var(--glass-shadow));
            box-sizing: border-box;
            max-height: var(--panel-max-height, 480px);
            overflow: hidden;
            isolation: isolate;
            transition: box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
        }

        ${glassRefractionStyles}

        .center-panel::after {
            ${tierBPanelUnderlayRules}
        }

        .center-panel::before {
            ${tierBRimWeakRules}
        }

        .panel-content {
            position: relative;
            z-index: 3;
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            min-height: 0;
            max-height: 100%;
            box-sizing: border-box;
            padding: 12px 0 10px;
        }

        .panel-title {
            font-size: 13px;
            font-weight: 700;
            text-align: center;
            margin: 0;
            padding: 0 14px 10px;
            border-bottom: 1px solid var(--cgo-divider-color, rgba(0, 0, 0, 0.06));
            color: var(--text-main, #00263b);
            flex-shrink: 0;
            letter-spacing: 0.2px;
        }

        .list-container {
            --scrollbar-thumb: var(--cgo-scrollbar-thumb, rgba(0, 0, 0, 0.22));
            --scrollbar-track: transparent;
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 10px 12px;
            background: var(--cgo-subtle-hover, rgba(0, 0, 0, 0.02));
            scrollbar-width: thin;
            scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
        }

        .list-container > cgo-notice-card {
            flex-shrink: 0;
        }

        @supports not (scrollbar-color: auto) {
            .list-container {
                scrollbar-width: auto;
            }
            .list-container::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            .list-container::-webkit-scrollbar-track {
                background: var(--scrollbar-track);
            }
            .list-container::-webkit-scrollbar-thumb {
                background: var(--scrollbar-thumb);
                border-radius: 4px;
            }
        }

        .empty-tip {
            text-align: center;
            font-size: 12px;
            color: var(--text-light, #888888);
            padding: 28px 10px;
        }

        .panel-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0;
            padding: 8px 12px 0;
            border-top: 1px solid var(--cgo-divider-color, rgba(0, 0, 0, 0.06));
            flex-shrink: 0;
        }

        .btn-clear {
            font-size: 11px;
            color: var(--text-light, #666666);
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: var(--radius-xs, 4px);
            touch-action: manipulation;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (hover: hover) and (pointer: fine) {
            .btn-clear:hover {
                background: var(--cgo-subtle-hover, rgba(0, 0, 0, 0.06));
                color: var(--danger-color, #dc3545);
            }
        }
        .btn-clear:active {
            transform: scale(0.97);
        }

        .btn-mute {
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--text-light, #666666);
            background: var(--cgo-subtle-hover, rgba(0, 0, 0, 0.04));
            border: 1px solid var(--cgo-subtle-border, rgba(0, 0, 0, 0.08));
            padding: 3px 8px;
            border-radius: var(--radius-xs, 4px);
            cursor: pointer;
            touch-action: manipulation;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                border-color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (hover: hover) and (pointer: fine) {
            .btn-mute:hover {
                background: var(--cgo-subtle-active, rgba(0, 0, 0, 0.08));
                color: var(--text-main, #00263b);
            }
        }
        .btn-mute:active {
            transform: scale(0.97);
        }

        .btn-mute.is-active {
            background: var(--info-bg, rgba(0, 133, 196, 0.12));
            color: var(--primary-color, #006098);
            border-color: var(--primary-color, #006098);
        }

        /* 传统扁平降级 */
        :host([glass-mode='flat']) .center-panel,
        :host([glass-mode='none']) .center-panel {
            background: var(--card-bg, #ffffff);
            border: 1px solid var(--border-color, #dee2e6);
            box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .center-panel::before,
        :host([glass-mode='flat']) .center-panel::after,
        :host([glass-mode='none']) .center-panel::before,
        :host([glass-mode='none']) .center-panel::after,
        :host([glass-mode='flat']) .glass-refraction,
        :host([glass-mode='none']) .glass-refraction {
            display: none;
        }
    `;

    constructor() {
        super();
        this.title = '通知中心';
        this.items = [];
        this.muted = false;
        this.maxHeight = '';
        this.glassMode = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    updated(changed) {
        if (changed.has('maxHeight')) {
            if (this.maxHeight) {
                this.style.setProperty('--panel-max-height', this.maxHeight);
            } else {
                this.style.removeProperty('--panel-max-height');
            }
        }
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
        e?.stopPropagation();
        this.dispatchEvent(new CustomEvent('cgo-notice-action', {
            bubbles: true,
            composed: true,
            detail: { item, eventDetail: e?.detail }
        }));
    }

    render() {
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        const itemList = Array.isArray(this.items) ? this.items.filter(Boolean) : [];

        return html`
            <div class="center-panel" role="region" aria-label=${this.title || '通知中心'}>
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="panel-content">
                    <div class="panel-title">${this.title}</div>

                    <div class="list-container" role="list">
                        ${itemList.length === 0 ? html`
                            <div class="empty-tip">暂无通知公告</div>
                        ` : itemList.map(item => html`
                            <cgo-notice-card
                                role="listitem"
                                embedded
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
                        <button type="button" class="btn-clear" @click=${this._handleClear}>清除所有通知</button>
                        <button
                            type="button"
                            class="btn-mute ${this.muted ? 'is-active' : ''}"
                            aria-pressed=${String(this.muted)}
                            @click=${this._handleMuteToggle}
                        >
                            <cgo-icon name="bell" size="13" aria-hidden="true"></cgo-icon>
                            <span>${this.muted ? '已静默' : '免打扰'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-notice-center') || customElements.define('cgo-notice-center', CgoNoticeCenter);
}
