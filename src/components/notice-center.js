import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import './notice-card.js';

const NOTIF_ICON = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;

/**
 * <cgo-notice-center> — CGoPush 标准通知中心面板组件
 * 遵循 Liquid Glass Tier B 不可交互底板规范，与 <cgo-dropdown> 保持一致的次世代液态玻璃质感。
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
            display: block;
            width: 100%;
            max-width: 320px;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            box-sizing: border-box;
        }

        /* 遵循 Tier B 不可交互底板规范 (0.82 衬底，柔和微光圈，与下拉菜单 dropdown 统一外观) */
        .center-panel {
            position: relative;
            width: 100%;
            background: transparent;
            border: none;
            border-radius: var(--radius-lg, 12px);
            box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04));
            box-sizing: border-box;
            max-height: var(--panel-max-height, 480px);
            overflow: hidden;
            isolation: isolate;
            transition: box-shadow 0.25s ease;
        }

        :host-context([data-theme='dark']) .center-panel {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Layer 0: 折射磨砂层 (Tier B 规范: 14px 模糊 + 135% 饱和度 + SVG 空间折射) */
        .glass-refraction {
            position: absolute;
            inset: 0;
            z-index: 0;
            border-radius: inherit;
            backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
            -webkit-backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
            backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%) url(#glass-distortion));
            -webkit-backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%) url(#glass-distortion));
            filter: var(--glass-refraction-filter, url(#glass-distortion));
            pointer-events: none;
            overflow: hidden;
            isolation: isolate;
        }

        /* Layer 1: 半透明底色衬底层 (Tier B 规范: 0.82 固定) */
        .center-panel::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        :host-context([data-theme='dark']) .center-panel::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82));
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与下拉菜单完全统一) */
        .center-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45 * 0.75)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45 * 0.75)) var(--lg-rim-hold, 1px),
                rgba(255, 255, 255, 0) var(--lg-rim-fade, 12px));
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
            opacity: 0.8;
        }

        :host-context([data-theme='dark']) .center-panel::before {
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 1px,
                rgba(255, 255, 255, 0) 8px);
        }

        /* Layer 3: 面板实际内容区 */
        .panel-content {
            position: relative;
            z-index: 3;
            display: flex;
            flex-direction: column;
            max-height: inherit;
            box-sizing: border-box;
            padding: 12px 0 10px;
        }

        .panel-title {
            font-size: 13px;
            font-weight: 700;
            text-align: center;
            margin: 0;
            padding: 0 14px 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            color: var(--text-main, #00263b);
            flex-shrink: 0;
            letter-spacing: 0.2px;
        }

        :host-context([data-theme='dark']) .panel-title {
            color: var(--text-main, #e6edf3);
            border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .list-container {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 10px 12px;
            min-height: 80px;
            background: rgba(0, 0, 0, 0.02);
            scrollbar-width: thin;
        }

        :host-context([data-theme='dark']) .list-container {
            background: rgba(255, 255, 255, 0.02);
        }

        .list-container::-webkit-scrollbar {
            width: 4px;
        }
        .list-container::-webkit-scrollbar-track {
            background: transparent;
        }
        .list-container::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 4px;
        }
        :host-context([data-theme='dark']) .list-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.18);
        }

        .empty-tip {
            text-align: center;
            font-size: 12px;
            color: var(--text-light, #888888);
            padding: 24px 10px;
        }

        :host-context([data-theme='dark']) .empty-tip {
            color: var(--text-light, #9ca3af);
        }

        .panel-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0;
            padding: 8px 12px 0;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            flex-shrink: 0;
        }

        :host-context([data-theme='dark']) .panel-footer {
            border-top-color: rgba(255, 255, 255, 0.08);
        }

        .btn-clear {
            font-size: 11px;
            color: var(--text-light, #666666);
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: var(--radius-xs, 4px);
            transition: background 0.2s, color 0.2s;
        }

        :host-context([data-theme='dark']) .btn-clear {
            color: var(--text-light, #9ca3af);
        }

        .btn-clear:hover {
            background: var(--tab-hover, rgba(0, 0, 0, 0.06));
            color: var(--danger-color, #dc3545);
        }

        :host-context([data-theme='dark']) .btn-clear:hover {
            background: rgba(255, 255, 255, 0.08);
            color: var(--danger-color, #f87171);
        }

        .btn-mute {
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--text-light, #666666);
            background: rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.08);
            padding: 3px 8px;
            border-radius: var(--radius-xs, 4px);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        :host-context([data-theme='dark']) .btn-mute {
            color: var(--text-light, #9ca3af);
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.1);
        }

        .btn-mute:hover {
            background: var(--tab-hover, rgba(0, 0, 0, 0.08));
            color: var(--text-main, #00263b);
        }

        :host-context([data-theme='dark']) .btn-mute:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
        }

        .btn-mute.is-active {
            background: var(--info-bg, rgba(0, 133, 196, 0.12));
            color: var(--primary-color, #006098);
            border-color: var(--primary-color, #006098);
        }

        :host-context([data-theme='dark']) .btn-mute.is-active {
            background: rgba(56, 189, 248, 0.18);
            color: var(--primary-color, #38bdf8);
            border-color: var(--primary-color, #38bdf8);
        }

        /* 传统扁平降级 */
        :host([glass-mode='flat']) .center-panel,
        :host([glass-mode='none']) .center-panel {
            background: var(--card-bg, #ffffff);
            border: 1px solid var(--border-color, #dee2e6);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .center-panel::before,
        :host([glass-mode='flat']) .center-panel::after,
        :host([glass-mode='none']) .center-panel::before,
        :host([glass-mode='none']) .center-panel::after {
            display: none;
        }
        :host-context([data-theme='dark']):host([glass-mode='flat']) .center-panel,
        :host-context([data-theme='dark']):host([glass-mode='none']) .center-panel {
            background: var(--card-bg, #1f2020);
            border-color: var(--border-color, #383a3c);
        }
    `;

    constructor() {
        super();
        this.title = '通知中心';
        this.items = [];
        this.muted = false;
        this.maxHeight = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
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
                <div class="glass-refraction" aria-hidden="true"></div>
                <div class="panel-content">
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
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-notice-center') || customElements.define('cgo-notice-center', CgoNoticeCenter);
}
