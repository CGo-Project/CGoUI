import { LitElement, html, css, svg } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import {
    glassRefractionStyles,
    tierCSurfaceUnderlayRules,
    tierCRimRules,
} from '../styles/glass-shared.js';
import './spinner.js';
import './icon.js';

const CATEGORY_NAMES = {
    software: '软件消息',
    operation: '运营信息',
    promotion: '推广内容',
    system: '系统消息',
};

function _isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const t = url.trim();
    if (!t) return false;
    if (/^(https?:)?\/\//i.test(t) || /^[./]/.test(t)) return true;
    return /^data:image\/(png|jpe?g|webp|gif|svg\+xml);/i.test(t);
}

/**
 * <cgo-notice-card> — CGoPush 标准通知卡片组件
 * 遵循次世代 Liquid Glass Tier C 规范。
 */
export class CgoNoticeCard extends LitElement {
    static properties = {
        category: { type: String },
        noticeTitle: { type: String, attribute: 'notice-title' },
        content: { type: String },
        imageUrl: { type: String, attribute: 'image-url' },
        popup: { type: Boolean, reflect: true },
        closable: { type: Boolean, reflect: true },
        embedded: { type: Boolean, reflect: true },
        actions: {
            type: Array,
            converter: (value) => {
                if (!value) return [];
                if (Array.isArray(value)) return value;
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            },
        },
        customCatName: { type: String, attribute: 'cat-name' },
        duration: { type: Number },
        paused: { type: Boolean },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
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

        :host([popup]) .notice-card {
            width: 280px;
            max-width: 80vw;
            padding-right: 32px;
            box-shadow: var(--cgo-shadow-dropdown, var(--glass-shadow));
        }

        ${glassRefractionStyles}

        .notice-card::after {
            ${tierCSurfaceUnderlayRules}
        }

        .notice-card::before {
            ${tierCRimRules}
        }

        .card-content {
            position: relative;
            z-index: 3;
        }

        /* 通知中心内嵌卡片 & 扁平降级 */
        :host([embedded]) .notice-card {
            background: var(--cgo-notice-embedded-bg, rgba(255, 255, 255, 0.72));
            border: 1px solid var(--cgo-notice-embedded-border, rgba(0, 38, 59, 0.07));
            box-shadow: 0 1px 3px rgba(0, 38, 59, 0.04);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([embedded]) .notice-card::before,
        :host([embedded]) .notice-card::after,
        :host([embedded]) .glass-refraction {
            display: none;
        }
        :host([glass-mode='flat']) .notice-card,
        :host([glass-mode='none']) .notice-card {
            background: var(--card-bg, #ffffff);
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
            box-shadow: var(--shadow-sm, 0 4px 15px rgba(0, 0, 0, 0.06));
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
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
            border: 1px solid var(--cgo-subtle-border, rgba(0, 0, 0, 0.12));
            background: var(--cgo-notice-action-bg, #f8f9fa);
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

        @media (hover: hover) and (pointer: fine) {
            .action-btn:hover {
                background: var(--cgo-notice-action-hover, rgba(0, 0, 0, 0.06));
                border-color: var(--primary-color, #006098);
                color: var(--primary-color, #006098);
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
                color: #ffffff;
            }
        }

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
            background: var(--cgo-notice-close-bg, rgba(0, 0, 0, 0.06));
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

        .close-container.has-spinner .close-btn {
            background: transparent;
        }

        @media (hover: hover) and (pointer: fine) {
            .close-btn:hover {
                background: var(--cgo-notice-close-hover, rgba(0, 0, 0, 0.14)) !important;
                color: var(--danger-color, #ea4335);
            }
        }

        .close-spinner {
            position: absolute;
            inset: 0;
            width: 20px;
            height: 20px;
            pointer-events: none;
            z-index: 1;
            --primary-color: var(--cat-software, #0085c4);
            --border-color: var(--cgo-subtle-border, rgba(0, 0, 0, 0.10));
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
        this.embedded = false;
        this.actions = [];
        this.customCatName = '';
        this.duration = 0;
        this.paused = false;
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
        if (!actionItem) return;
        const actionValue = typeof actionItem === 'string'
            ? actionItem
            : (actionItem.type || actionItem.action || actionItem);
        this.dispatchEvent(new CustomEvent('cgo-notice-action', {
            bubbles: true,
            composed: true,
            detail: { action: actionValue, title: this.noticeTitle }
        }));
    }

    renderHeaderIcon() {
        if (this.category === 'operation') {
            return svg`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
        }
        if (this.category === 'promotion') {
            return svg`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`;
        }
        if (this.category === 'system') {
            return svg`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
        }
        return svg`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    render() {
        const catName = this.customCatName || CATEGORY_NAMES[this.category] || '通知消息';
        const actions = Array.isArray(this.actions) ? this.actions.filter(Boolean) : [];
        const hasCountdown = this.duration > 0;
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        const safeImage = _isSafeUrl(this.imageUrl) ? this.imageUrl : '';

        return html`
            <div class="notice-card cat-${this.category || 'software'}">
                ${!isFlat && !this.embedded ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}

                ${this.closable ? html`
                    <div class="close-container ${hasCountdown ? 'has-spinner' : ''}">
                        ${hasCountdown ? html`
                            <cgo-spinner
                                mode="progress"
                                size="20"
                                duration="${this.duration}"
                                ?paused=${this.paused}
                                fill-mode="fill"
                                direction="cw"
                                class="close-spinner"
                            ></cgo-spinner>
                        ` : null}
                        <button type="button" class="close-btn" @click=${this._handleClose} title="关闭" aria-label="关闭通知">
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

                    ${safeImage ? html`
                        <div class="image-wrap">
                            <img src="${safeImage}" alt="Notice Image" loading="lazy" />
                        </div>
                    ` : null}

                    <slot></slot>

                    ${actions.length > 0 ? html`
                        <div class="actions">
                            ${actions.map(act => {
                                const label = typeof act === 'string' ? act : (act.label || act.type || '');
                                const isPrimary = typeof act === 'object' && Boolean(act.primary);
                                return html`
                                    <button type="button" class="action-btn ${isPrimary ? 'primary' : ''}" @click=${(e) => this._handleAction(act, e)}>
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
