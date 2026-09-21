import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import './notice-card.js';
import './spinner.js';

/**
 * <cgo-notice-popup> — CGoPush 标准浮动通知弹窗容器组件
 */
export class CgoNoticePopup extends LitElement {
    static properties = {
        position: { type: String, reflect: true },
        _popups: { state: true }
    };

    static styles = css`
        :host {
            position: fixed;
            z-index: 10010;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
        }

        :host([position="top-right"]), :host(:not([position])) {
            top: 76px;
            right: 18px;
        }

        :host([position="top-left"]) {
            top: 76px;
            left: 18px;
        }

        :host([position="bottom-right"]) {
            bottom: 24px;
            right: 18px;
        }

        :host([position="bottom-left"]) {
            bottom: 24px;
            left: 18px;
        }

        .popup-item {
            pointer-events: auto;
            transform: translateX(125%);
            opacity: 0;
            max-height: 0;
            overflow: hidden;
            transition: 
                transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.35s ease-out,
                max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                margin-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .popup-item.show {
            transform: translateX(0);
            opacity: 1;
            max-height: 400px;
            overflow: visible;
        }

        .popup-item.leaving {
            transform: translateX(125%);
            opacity: 0;
            max-height: 0 !important;
            margin-bottom: -10px !important;
            overflow: hidden !important;
        }

        .toast-card {
            width: 280px;
            max-width: 80vw;
            box-sizing: border-box;
            padding: 9px 10px 9px 14px;
            border-radius: var(--radius-md, 10px);
            font-size: 13px;
            font-weight: 500;
            line-height: 1.4;
            word-break: break-word;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
            border: 1px solid rgba(0, 0, 0, 0.05);
            background: var(--text-main, #00263b);
            color: var(--bg-color, #f8f9fa);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        :host-context([glass-mode="liquid"]) .toast-card,
        :host-context([glass-mode="blur"]) .toast-card,
        :host-context([data-glass-mode="liquid"]) .toast-card,
        :host-context([data-glass-mode="blur"]) .toast-card {
            background: rgba(0, 38, 59, 0.85);
            backdrop-filter: blur(14px) saturate(140%);
            -webkit-backdrop-filter: blur(14px) saturate(140%);
            border-color: rgba(255, 255, 255, 0.12);
            box-shadow:
                0 0 0 0.5px rgba(255, 255, 255, 0.1),
                0 10px 30px -4px rgba(0, 0, 0, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        :host-context([data-theme="dark"][glass-mode="liquid"]) .toast-card,
        :host-context([data-theme="dark"][glass-mode="blur"]) .toast-card,
        :host-context([data-theme="dark"][data-glass-mode="liquid"]) .toast-card,
        :host-context([data-theme="dark"][data-glass-mode="blur"]) .toast-card {
            background: rgba(24, 26, 28, 0.85);
            backdrop-filter: blur(14px) saturate(140%);
            -webkit-backdrop-filter: blur(14px) saturate(140%);
            border-color: rgba(255, 255, 255, 0.12);
            box-shadow:
                0 0 0 0.5px rgba(255, 255, 255, 0.12),
                0 12px 34px -4px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .toast-message {
            flex: 1;
        }

        .toast-progress-ring {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            margin-right: 0px;
            --primary-color: rgba(255, 255, 255, 0.95);
            --border-color: rgba(255, 255, 255, 0.25);
        }

        .toast-card.success {
            background: var(--success-color, #34a853);
            color: #ffffff;
        }

        .toast-card.danger {
            background: var(--danger-color, #ea4335);
            color: #ffffff;
        }

        .toast-card.warning {
            background: var(--warning-color, #f59e0b);
            color: #ffffff;
        }
    `;

    constructor() {
        super();
        this.position = 'top-right';
        this._popups = [];
        this._seq = 0;
    }

    /**
     * 推送一条通知气泡或 Toast 提示
     * @param {Object} item - 配置项。支持通知 ({ title, category, content, actions, imageUrl }) 或 Toast ({ isToast: true, message, type })
     * @param {number} [duration] - 自动关闭显示时长(ms)，默认 5000，传 0 则不自动关闭
     */
    push(item, duration = 5000) {
        const id = item.id || `popup_${++this._seq}`;
        let popupItem;
        if (item.isToast) {
            popupItem = {
                id,
                isToast: true,
                message: item.message || '',
                type: item.type || 'info',
                duration: duration || 3000,
                state: 'entering'
            };
        } else {
            popupItem = {
                id,
                isToast: false,
                category: item.category || 'software',
                title: item.title || item.noticeTitle || '',
                content: item.content || '',
                imageUrl: item.imageUrl || item.image || '',
                actions: item.actions || [],
                duration: duration,
                state: 'entering'
            };
        }

        this._popups = [...this._popups, popupItem];

        // 触发滑入动画
        requestAnimationFrame(() => {
            this._popups = this._popups.map(p => p.id === id ? { ...p, state: 'show' } : p);
        });

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    }

    /**
     * 移除特定 ID 的气泡
     */
    remove(id) {
        this._popups = this._popups.map(p => p.id === id ? { ...p, state: 'leaving' } : p);
        setTimeout(() => {
            this._popups = this._popups.filter(p => p.id !== id);
        }, 400);
    }

    /**
     * 清空所有气泡
     */
    clear() {
        this._popups = this._popups.map(p => ({ ...p, state: 'leaving' }));
        setTimeout(() => {
            this._popups = [];
        }, 400);
    }

    _handleItemClose(id, e) {
        e.stopPropagation();
        this.remove(id);
        this.dispatchEvent(new CustomEvent('cgo-popup-close', {
            bubbles: true,
            composed: true,
            detail: { id }
        }));
    }

    _handleItemAction(id, e) {
        this.dispatchEvent(new CustomEvent('cgo-popup-action', {
            bubbles: true,
            composed: true,
            detail: { id, eventDetail: e.detail }
        }));
    }

    render() {
        return html`
            ${repeat(this._popups, p => p.id, p => html`
                <div class="popup-item ${p.state}">
                    ${p.isToast ? html`
                        <div class="toast-card ${p.type === 'success' ? 'success' : p.type === 'error' || p.type === 'danger' ? 'danger' : p.type === 'warning' ? 'warning' : 'info'}">
                            <span class="toast-message">${p.message}</span>
                            <cgo-spinner
                                mode="progress"
                                size="20"
                                duration="${p.duration}"
                                fill-mode="fill"
                                direction="cw"
                                class="toast-progress-ring"
                            ></cgo-spinner>
                        </div>
                    ` : html`
                        <cgo-notice-card
                            popup
                            closable
                            category=${p.category}
                            notice-title=${p.title}
                            content=${p.content}
                            image-url=${p.imageUrl}
                            .actions=${p.actions}
                            duration=${p.duration || 0}
                            @cgo-notice-close=${(e) => this._handleItemClose(p.id, e)}
                            @cgo-notice-action=${(e) => this._handleItemAction(p.id, e)}
                        ></cgo-notice-card>
                    `}
                </div>
            `)}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-notice-popup') || customElements.define('cgo-notice-popup', CgoNoticePopup);
}

let _singletonPopup = null;

export function showNoticePopup(noticeConfig, duration = 5000) {
    if (typeof window === 'undefined') return null;
    if (!_singletonPopup || !document.body.contains(_singletonPopup)) {
        _singletonPopup = document.createElement('cgo-notice-popup');
        document.body.appendChild(_singletonPopup);
    }
    return _singletonPopup.push(noticeConfig, duration);
}
