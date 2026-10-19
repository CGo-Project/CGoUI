import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import {
    glassRefractionStyles,
    tierCSurfaceUnderlayRules,
    tierCSurfaceUnderlayDarkRules,
    tierCRimRules,
    tierCRimDarkRules,
} from '../styles/glass-shared.js';
import './spinner.js';
import './icon.js';

const DEFAULT_ICONS = {
    software: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    operation: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
    promotion: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
    system: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
};

const CATEGORY_NAMES = {
    software: '软件消息',
    operation: '运营信息',
    promotion: '推广内容',
    system: '系统消息'
};

/**
 * <cgo-notice-card> — CGoPush 标准通知卡片组件
 * 遵循次世代 Liquid Glass Tier C 规范，默认全量呈现 Card Tier C 液态玻璃质感与双轴微光圈。
 */
export class CgoNoticeCard extends LitElement {
    static properties = {
        category: { type: String },
        noticeTitle: { type: String, attribute: 'notice-title' },
        content: { type: String },
        imageUrl: { type: String, attribute: 'image-url' },
        popup: { type: Boolean, reflect: true },
        closable: { type: Boolean, reflect: true },
        actions: { type: Array },
        customCatName: { type: String, attribute: 'cat-name' },
        duration: { type: Number },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true }
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            box-sizing: border-box;

            --cat-software: var(--cgopush-cat-software, #0085c4);
            --cat-operation: var(--cgopush-cat-operation, #d29700);
            --cat-promotion: var(--cgopush-cat-promotion, #009655);
            --cat-system: var(--cgopush-cat-system, #6b7280);
        }

        :host([data-theme='dark']),
        :host-context([data-theme='dark']) {
            --cat-software: #38bdf8;
            --cat-operation: #ffca28;
            --cat-promotion: #4ade80;
            --cat-system: #a0b0b9;
        }

        /* 遵循 Card Tier C 液态玻璃规范：透明底板、物理微光投影、零实体边框 */
        .notice-card {
            position: relative;
            background: transparent;
            color: var(--text-main, #00263b);
            border-radius: var(--radius-md, 10px);
            border: none;
            box-shadow: var(--glass-shadow);
            padding: 12px 14px;
            transition: box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1)),
                        transform var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
            overflow: hidden;
            box-sizing: border-box;
            isolation: isolate;
        }

        :host-context([data-theme='dark']) .notice-card {
            color: var(--text-main, #e6edf3);
            box-shadow: var(--glass-shadow);
        }

        :host([popup]) .notice-card {
            width: 280px;
            max-width: 80vw;
            padding-right: 32px;
            box-shadow:
                0 0 0 0.5px rgba(0, 0, 0, 0.08),
                0 12px 32px -6px rgba(0, 38, 59, 0.16),
                0 4px 12px -2px rgba(0, 38, 59, 0.08),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.9);
        }

        :host-context([data-theme='dark']):host([popup]) .notice-card {
            box-shadow:
                0 0 0 0.5px rgba(255, 255, 255, 0.15),
                0 16px 36px -6px rgba(0, 0, 0, 0.45),
                0 6px 14px -2px rgba(0, 0, 0, 0.3),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Layer 0: 折射磨砂层 (Card Tier C 规范: 14px 高斯模糊 + 135% 饱和度 + SVG 空间微折射) */
        ${glassRefractionStyles}

        /* Layer 1: 半透明底色衬底层 (Card Tier C 规范: 0.72 固定，与 <cgo-card> 完全一致) */
        .notice-card::after {
            ${tierCSurfaceUnderlayRules}
        }

        :host-context([data-theme='dark']) .notice-card::after {
            ${tierCSurfaceUnderlayDarkRules}
        }

        /* Layer 2: 完整双轴微光圈层 (Card Tier C 规范: 保留顶部 lit 0.95 物理微光，杜绝实体边框重影) */
        .notice-card::before {
            ${tierCRimRules}
        }

        :host-context([data-theme='dark']) .notice-card::before {
            ${tierCRimDarkRules}
        }

        /* Layer 3: 内容容器 */
        .card-content {
            position: relative;
            z-index: 3;
        }

        /* 传统扁平降级模式 */
        :host([glass-mode='flat']) .notice-card,
        :host([glass-mode='none']) .notice-card {
            background: var(--card-bg, #ffffff);
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
            box-shadow: var(--shadow-sm, 0 4px 15px rgba(0, 0, 0, 0.06));
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }

        :host-context([data-theme='dark']):host([glass-mode='flat']) .notice-card,
        :host-context([data-theme='dark']):host([glass-mode='none']) .notice-card {
            background: var(--card-bg, #1e2022);
            border-color: rgba(255, 255, 255, 0.1);
        }

        :host([glass-mode='flat']) .notice-card::before,
        :host([glass-mode='flat']) .notice-card::after,
        :host([glass-mode='none']) .notice-card::before,
        :host([glass-mode='none']) .notice-card::after,
        :host([glass-mode='flat']) .glass-refraction,
        :host([glass-mode='none']) .glass-refraction {
            display: none;
        }

        .header {
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 5px;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 5px;
            line-height: 1;
        }

        .header svg {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .cat-software .header { color: var(--cat-software); }
        .cat-operation .header { color: var(--cat-operation); }
        .cat-promotion .header { color: var(--cat-promotion); }
        .cat-system .header { color: var(--cat-system); }

        .title {
            font-size: 13px;
            font-weight: 700;
            line-height: 1.4;
            color: var(--text-main, #00263b);
            word-break: break-word;
        }

        :host-context([data-theme="dark"]) .title {
            color: var(--text-main, #f1f5f9);
        }

        :host(:not([popup])) .title {
            font-size: 14px;
            margin-bottom: 6px;
        }

        .content-body {
            font-size: 12px;
            line-height: 1.5;
            color: var(--text-light, #666666);
            margin-top: 6px;
            word-break: break-word;
        }

        :host-context([data-theme="dark"]) .content-body {
            color: var(--text-light, #a0b0b9);
        }

        :host([popup]) .content-body {
            display: none;
        }

        .image-wrap {
            margin-top: 8px;
            border-radius: var(--radius-xs, 6px);
            overflow: hidden;
            max-height: 120px;
        }

        .image-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .actions {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
        }

        .action-btn {
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: var(--radius-xs, 4px);
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
            background: var(--bg-color, #f8f9fa);
            color: var(--text-main, #00263b);
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

        :host-context([data-theme="dark"]) .action-btn {
            border-color: rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
        }

        @media (hover: hover) and (pointer: fine) {
            .action-btn:hover {
                background: var(--tab-hover, rgba(0, 0, 0, 0.06));
                border-color: var(--primary-color, #006098);
                color: var(--primary-color, #006098);
            }

            :host-context([data-theme="dark"]) .action-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: var(--primary-color, #38bdf8);
                color: var(--primary-color, #38bdf8);
            }
        }

        .action-btn:active {
            transform: scale(0.97);
        }

        .action-btn.primary {
            background: var(--primary-color, #006098);
            color: #ffffff;
            border-color: transparent;
        }

        @media (hover: hover) and (pointer: fine) {
            .action-btn.primary:hover {
                background: var(--primary-hover, #004d7a);
            }
        }

        /* 关闭按钮容器与圆形底色 */
        .close-container {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5;
        }

        .close-btn {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.06);
            color: var(--text-main, #00263b);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            transition: background 0.2s, color 0.2s, transform 0.15s;
            position: relative;
            z-index: 2;
        }

        /* 当存在倒计时环时，按钮自身背景透明，让外圈倒计时环完整透出 */
        .close-container.has-spinner .close-btn {
            background: transparent;
        }

        :host([data-theme='dark']) .close-btn,
        :host-context([data-theme='dark']) .close-btn {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }

        .close-btn:hover {
            background: rgba(0, 0, 0, 0.14) !important;
            color: var(--danger-color, #ea4335);
        }

        :host-context([data-theme="dark"]) .close-btn:hover {
            background: rgba(255, 255, 255, 0.25) !important;
            color: var(--danger-color, #f87171);
        }

        /* 倒计时进度圆环 */
        .close-spinner {
            position: absolute;
            inset: 0;
            width: 20px;
            height: 20px;
            pointer-events: none;
            z-index: 1;
            --primary-color: var(--cat-software, #0085c4);
            --border-color: rgba(0, 0, 0, 0.10);
        }

        :host-context([data-theme="dark"]) .close-spinner {
            --border-color: rgba(255, 255, 255, 0.16);
        }

        .cat-operation .close-spinner { --primary-color: var(--cat-operation, #d29700); }
        .cat-promotion .close-spinner { --primary-color: var(--cat-promotion, #009655); }
        .cat-system .close-spinner { --primary-color: var(--cat-system, #6b7280); }
    `;

    constructor() {
        super();
        this.category = 'software';
        this.noticeTitle = '';
        this.content = '';
        this.imageUrl = '';
        this.popup = false;
        this.closable = false;
        this.actions = [];
        this.customCatName = '';
        this.duration = 0;
        this.glassMode = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    _handleClose(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('cgo-notice-close', {
            bubbles: true,
            composed: true,
            detail: { category: this.category, title: this.noticeTitle }
        }));
    }

    _handleAction(actionItem, e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('cgo-notice-action', {
            bubbles: true,
            composed: true,
            detail: { action: actionItem.type || actionItem.action || actionItem, title: this.noticeTitle }
        }));
    }

    renderHeaderIcon() {
        const iconSvg = DEFAULT_ICONS[this.category] || DEFAULT_ICONS.software;
        return html`<span .innerHTML=${iconSvg}></span>`;
    }

    render() {
        const catName = this.customCatName || CATEGORY_NAMES[this.category] || '通知消息';
        const renderActions = Array.isArray(this.actions) && this.actions.length > 0;
        const hasCountdown = this.duration > 0;
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';

        return html`
            <div class="notice-card cat-${this.category}">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}

                ${this.closable ? html`
                    <div class="close-container ${hasCountdown ? 'has-spinner' : ''}">
                        ${hasCountdown ? html`
                            <cgo-spinner
                                mode="progress"
                                size="20"
                                duration="${this.duration}"
                                fill-mode="fill"
                                direction="cw"
                                class="close-spinner"
                            ></cgo-spinner>
                        ` : null}
                        <button class="close-btn" @click=${this._handleClose} title="关闭">
                            <cgo-icon name="close" size="11"></cgo-icon>
                        </button>
                    </div>
                ` : null}

                <div class="card-content">
                    <div class="header">
                        ${this.renderHeaderIcon()}
                        <span>${catName}</span>
                    </div>

                    <div class="title">${this.noticeTitle}</div>

                    ${this.content ? html`<div class="content-body">${this.content}</div>` : null}

                    ${this.imageUrl ? html`
                        <div class="image-wrap">
                            <img src="${this.imageUrl}" alt="Notice Image" loading="lazy" />
                        </div>
                    ` : null}

                    <slot></slot>

                    ${renderActions ? html`
                        <div class="actions">
                            ${this.actions.map(act => {
                                const label = typeof act === 'string' ? act : act.label || act.type;
                                const isPrimary = typeof act === 'object' && act.primary;
                                return html`
                                    <button class="action-btn ${isPrimary ? 'primary' : ''}" @click=${(e) => this._handleAction(act, e)}>
                                        ${label}
                                    </button>
                                `;
                            })}
                        </div>
                    ` : null}
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-notice-card') || customElements.define('cgo-notice-card', CgoNoticeCard);
}
