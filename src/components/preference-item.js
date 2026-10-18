import { LitElement, html, css } from 'lit';
import './button.js';
import './icon.js';

export class CgoPreferenceItem extends LitElement {
    static properties = {
        icon: { type: String },
        name: { type: String },
        label: { type: String },
        title: { type: String },
        detail: { type: String },
        desc: { type: String },
        action: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        /* ===== Card B (Tier B) 规范底板 =====
           Layer 0: 折射磨砂层 (.glass-refraction)
           Layer 1: 0.82 高不透明度底色衬底层 (::after)
           Layer 2: 弱化微光单向顶弧圈 (::before)
           Layer 3: 锐利内容交互层 (.left, .middle, .right) */
        .item {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 20px;
            border-radius: var(--radius-md, 10px);
            background: transparent;
            color: var(--text-main, #00263b);
            border: none !important;
            outline: none !important;
            box-sizing: border-box;
            box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04));
            overflow: hidden;
            isolation: isolate;
            transition:
                box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1)),
                transform var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
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

        /* Layer 1: 半透明底色衬底层 (Tier B 规范: 0.82 高不透明衬底) */
        .item::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        :host-context([data-theme='dark']) .item::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82));
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与 0.82 高不透明底板自然融合，零实体边框) */
        .item::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background:
                linear-gradient(to right,
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 0,
                    rgba(0, 0, 0, 0) var(--lg-rim-side, 4px),
                    rgba(0, 0, 0, 0) calc(100% - var(--lg-rim-side, 4px)),
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 100%),
                linear-gradient(to bottom,
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
            transition: opacity 0.2s ease;
        }

        :host-context([data-theme='dark']) .item::before {
            background:
                linear-gradient(to bottom,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 0,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 1px,
                    rgba(255, 255, 255, 0) 12px);
            opacity: 0.8;
        }

        /* 悬浮微交互 */
        :host(:hover) .item,
        .item:hover {
            box-shadow: 0 10px 28px rgba(0, 38, 59, 0.1), 0 3px 8px rgba(0, 0, 0, 0.05);
        }

        .item:hover::after {
            background: var(--glass-bg-surface, rgba(255, 255, 255, 0.92));
        }

        .item:hover::before {
            opacity: 1;
        }

        :host-context([data-theme='dark']):host(:hover) .item,
        :host-context([data-theme='dark']) .item:hover {
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        :host-context([data-theme='dark']) .item:hover::after {
            background: rgba(38, 40, 44, 0.88);
        }

        /* Layer 3: 内容容器 */
        .left,
        .middle,
        .right {
            position: relative;
            z-index: 3;
        }

        .left {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 140px;
            max-width: 220px;
            flex-shrink: 0;
        }

        .icon {
            width: 32px;
            height: 32px;
            border-radius: var(--radius-sm, 6px);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--surface-secondary, rgba(0, 38, 59, 0.05));
            color: var(--text-main, #00263b);
            flex-shrink: 0;
            overflow: hidden;
            box-sizing: border-box;
            transition: background-color var(--transition-base, 0.2s ease), color var(--transition-base, 0.2s ease);
        }

        .icon-text {
            font-size: 16px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .name {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.95rem;
            font-weight: 600;
            line-height: 1.3;
            color: var(--text-main, #00263b);
        }

        .middle {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            min-width: 0;
            padding: 0 10px;
        }

        .middle.has-single {
            justify-content: flex-start;
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
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-shrink: 0;
        }

        /* 暗色模式颜色映射 */
        :host-context([data-theme='dark']) .item {
            color: var(--text-main, #f0f4f8);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.25);
        }

        :host-context([data-theme='dark']) .icon {
            background: rgba(255, 255, 255, 0.08);
            color: var(--text-main, #f0f4f8);
        }

        :host-context([data-theme='dark']) .name,
        :host-context([data-theme='dark']) .title {
            color: var(--text-main, #f0f4f8);
        }

        :host-context([data-theme='dark']) .detail {
            color: var(--text-light, rgba(240, 244, 248, 0.65));
        }

        @media (max-width: 640px) {
            .item {
                flex-direction: column;
                align-items: stretch;
                gap: 12px;
                padding: 14px 16px;
            }
            .left {
                width: 100%;
                max-width: 100%;
            }
            .middle {
                width: 100%;
                padding: 0;
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }
            .detail {
                white-space: normal;
                overflow-wrap: anywhere;
            }
            .right {
                width: 100%;
                justify-content: flex-end;
            }
        }
    `;

    constructor() {
        super();
        this.icon = '';
        this.name = '';
        this.label = '';
        this.title = '';
        this.detail = '';
        this.desc = '';
        this.action = '配置';
    }

    _handleActionClick(e) {
        this.dispatchEvent(new CustomEvent('cgo-preference-action', {
            bubbles: true,
            composed: true,
            detail: {
                name: this.name || this.label || '',
                title: this.title || '',
                detail: this.detail || this.desc || '',
                action: this.action || '配置',
                originalEvent: e
            }
        }));
    }

    _renderIcon(iconVal) {
        const trimmed = (iconVal || '').trim();
        if (!trimmed) {
            return html`<slot name="icon"></slot>`;
        }
        const isIconName = /^[a-z0-9_-]+$/i.test(trimmed);
        return html`
            <span class="icon" part="icon">
                <slot name="icon">
                    ${isIconName
                        ? html`<cgo-icon name="${trimmed}" size="18"></cgo-icon>`
                        : html`<span class="icon-text">${trimmed}</span>`}
                </slot>
            </span>
        `;
    }

    render() {
        let resolvedName = this.name || this.label || '';
        let resolvedTitle = this.title || '';
        let resolvedDetail = this.detail || this.desc || '';
        let resolvedIcon = this.icon;

        // 如果用户完全没有传入属性，使用规范缺省值
        const isCompletelyEmpty = !resolvedName && !resolvedTitle && !resolvedDetail && !resolvedIcon;
        if (isCompletelyEmpty) {
            resolvedName = '项目';
            resolvedTitle = '项目选项';
            resolvedDetail = '选项详细信息';
            resolvedIcon = 'settings';
        }

        const hasMiddleBoth = Boolean(resolvedTitle && resolvedDetail);

        return html`
            <div class="item" part="item">
                <div class="glass-refraction" aria-hidden="true"></div>
                <div class="left" part="left">
                    ${this._renderIcon(resolvedIcon)}
                    ${resolvedName ? html`<span class="name" part="name">${resolvedName}</span>` : ''}
                </div>
                <div class="middle ${hasMiddleBoth ? '' : 'has-single'}" part="middle">
                    ${resolvedTitle ? html`<span class="title" part="title">${resolvedTitle}</span>` : ''}
                    ${resolvedDetail ? html`<span class="detail" part="detail">${resolvedDetail}</span>` : ''}
                </div>
                <div class="right" part="right">
                    <slot name="action">
                        <slot>
                            ${this.action ? html`
                                <cgo-button
                                    variant="ghost"
                                    size="sm"
                                    class="action-btn"
                                    @click=${this._handleActionClick}
                                >
                                    ${this.action}
                                </cgo-button>
                            ` : ''}
                        </slot>
                    </slot>
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-preference-item') || customElements.define('cgo-preference-item', CgoPreferenceItem);
}
