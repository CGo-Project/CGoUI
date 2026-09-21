import { LitElement, html, css } from 'lit';
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
        duration: { type: Number }
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

        .notice-card {
            position: relative;
            background: var(--card-bg, #ffffff);
            color: var(--text-main, #00263b);
            border-radius: var(--radius-md, 10px);
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
            box-shadow: var(--shadow-sm, 0 4px 15px rgba(0, 0, 0, 0.06));
            padding: 12px 14px;
            transition: all 0.25s ease;
            overflow: hidden;
            box-sizing: border-box;
        }

        :host([popup]) .notice-card {
            width: 280px;
            max-width: 80vw;
            padding-right: 34px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        :host([popup]):host-context([glass-mode="liquid"]) .notice-card,
        :host([popup]):host-context([glass-mode="blur"]) .notice-card,
        :host([popup]):host-context([data-glass-mode="liquid"]) .notice-card,
        :host([popup]):host-context([data-glass-mode="blur"]) .notice-card {
            background: rgba(255, 255, 255, 0.82);
            backdrop-filter: blur(14px) saturate(135%);
            -webkit-backdrop-filter: blur(14px) saturate(135%);
            border-color: var(--glass-border, rgba(255, 255, 255, 0.4));
            box-shadow:
                0 0 0 0.5px rgba(0, 0, 0, 0.06),
                0 14px 34px -6px rgba(0, 38, 59, 0.14),
                0 3px 8px -2px rgba(0, 38, 59, 0.06),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.85);
        }

        :host([popup]):host-context([data-theme="dark"][glass-mode="liquid"]) .notice-card,
        :host([popup]):host-context([data-theme="dark"][glass-mode="blur"]) .notice-card,
        :host([popup]):host-context([data-theme="dark"][data-glass-mode="liquid"]) .notice-card,
        :host([popup]):host-context([data-theme="dark"][data-glass-mode="blur"]) .notice-card {
            background: rgba(28, 30, 32, 0.82);
            backdrop-filter: blur(14px) saturate(135%);
            -webkit-backdrop-filter: blur(14px) saturate(135%);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow:
                0 0 0 0.5px rgba(255, 255, 255, 0.1),
                0 18px 40px -6px rgba(0, 0, 0, 0.6),
                0 4px 10px -2px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
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
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
            background: var(--bg-color, #f8f9fa);
            color: var(--text-main, #00263b);
            cursor: pointer;
            transition: all 0.18s ease;
        }

        .action-btn:hover {
            background: var(--tab-hover, rgba(0, 0, 0, 0.06));
            border-color: var(--primary-color, #006098);
            color: var(--primary-color, #006098);
        }

        .action-btn.primary {
            background: var(--primary-color, #006098);
            color: #ffffff;
            border-color: transparent;
        }

        .action-btn.primary:hover {
            background: var(--primary-hover, #004d7a);
        }

        /* 关闭按钮容器与圆形底色 */
        .close-container {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5;
        }

        .close-btn {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.08);
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

        :host([data-theme='dark']) .close-btn,
        :host-context([data-theme='dark']) .close-btn {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }

        .close-btn:hover {
            background: rgba(0, 0, 0, 0.16);
            color: var(--danger-color, #ea4335);
        }

        /* 倒计时进度圆环 */
        .close-spinner {
            position: absolute;
            top: 0;
            left: 0;
            width: 18px;
            height: 18px;
            pointer-events: none;
            z-index: 1;
            --primary-color: var(--cat-software, #0085c4);
            --border-color: rgba(0, 0, 0, 0.12);
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

        return html`
            <div class="notice-card cat-${this.category}">
                ${this.closable ? html`
                    <div class="close-container">
                        ${hasCountdown ? html`
                            <cgo-spinner
                                mode="progress"
                                size="18"
                                duration="${this.duration}"
                                fill-mode="fill"
                                direction="cw"
                                class="close-spinner"
                            ></cgo-spinner>
                        ` : null}
                        <button class="close-btn" @click=${this._handleClose} title="关闭">
                            <cgo-icon name="close" size="12"></cgo-icon>
                        </button>
                    </div>
                ` : null}

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
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-notice-card') || customElements.define('cgo-notice-card', CgoNoticeCard);
}
