import { LitElement, html, css, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import './notice-card.js';
import './spinner.js';
import './icon.js';

/**
 * <cgo-notice-popup> — CGoPush 标准浮动通知弹窗容器组件
 *
 * 无障碍: 容器是 role="status" 的 live region，error 类型的 Toast 用 role="alert"；
 * 鼠标悬停或焦点在某条通知内时暂停它的自动消失计时；
 * duration 为 0 的 Toast 不会自动消失，改为显示关闭按钮。
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

        .toast-close {
            flex-shrink: 0;
            width: 22px;
            height: 22px;
            padding: 0;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.18);
            color: inherit;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .toast-close:hover {
            background: rgba(255, 255, 255, 0.32);
        }

        .toast-close:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
            .popup-item {
                transform: none;
                transition: opacity 0.2s ease-out;
            }
            .popup-item.leaving {
                transform: none;
            }
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
        // id -> { remaining, startedAt, handle }，用于悬停 / 聚焦时暂停自动消失
        this._timers = new Map();
    }

    connectedCallback() {
        super.connectedCallback();
        // live region 必须先于内容存在，读屏才会播报后续插入的通知
        if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
        if (!this.hasAttribute('aria-live')) this.setAttribute('aria-live', 'polite');
        // role=status 默认整块重读，这里只播报新增的那一条
        if (!this.hasAttribute('aria-atomic')) this.setAttribute('aria-atomic', 'false');
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._timers.forEach((timer) => clearTimeout(timer.handle));
        this._timers.clear();
    }

    _startTimer(id, duration) {
        this._timers.set(id, {
            remaining: duration,
            startedAt: Date.now(),
            handle: setTimeout(() => this.remove(id), duration),
        });
    }

    _pauseTimer(id) {
        const timer = this._timers.get(id);
        if (!timer || timer.handle === null) return;
        clearTimeout(timer.handle);
        timer.handle = null;
        timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
        this._popups = this._popups.map((p) => (p.id === id ? { ...p, paused: true } : p));
    }

    _resumeTimer(id, event) {
        const timer = this._timers.get(id);
        if (!timer || timer.handle !== null) return;
        // 指针还悬停着或焦点仍在这条通知里时继续暂停
        const item = event && event.currentTarget;
        if (item && item.matches) {
            if (event.type === 'focusout') {
                if (event.relatedTarget && item.contains(event.relatedTarget)) return;
                if (item.matches(':hover')) return;
            } else if (item.contains(this.shadowRoot.activeElement)) {
                return;
            }
        }
        timer.startedAt = Date.now();
        timer.handle = setTimeout(() => this.remove(id), timer.remaining);
        this._popups = this._popups.map((p) => (p.id === id ? { ...p, paused: false } : p));
    }

    _clearTimer(id) {
        const timer = this._timers.get(id);
        if (timer) clearTimeout(timer.handle);
        this._timers.delete(id);
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
                // duration 为 0 表示不自动消失，渲染时改为显示关闭按钮
                duration: duration > 0 ? duration : 0,
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

        const insert = () => {
            this._popups = [...this._popups, popupItem];

            // 触发滑入动画
            requestAnimationFrame(() => {
                this._popups = this._popups.map(p => p.id === id ? { ...p, state: 'show' } : p);
            });

            if (duration > 0) this._startTimer(id, duration);
        };

        if (this.hasUpdated) {
            insert();
        } else {
            // 容器刚创建：等 live region 先渲染出来再插入内容，否则首条通知可能不被播报
            this.updateComplete.then(() => requestAnimationFrame(insert));
        }

        return id;
    }

    /**
     * 移除特定 ID 的气泡
     */
    remove(id) {
        this._clearTimer(id);
        this._popups = this._popups.map(p => p.id === id ? { ...p, state: 'leaving' } : p);
        setTimeout(() => {
            this._popups = this._popups.filter(p => p.id !== id);
        }, 400);
    }

    /**
     * 清空所有气泡
     */
    clear() {
        this._timers.forEach((timer) => clearTimeout(timer.handle));
        this._timers.clear();
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
                <div
                    class="popup-item ${p.state}"
                    role=${p.isToast && (p.type === 'error' || p.type === 'danger') ? 'alert' : nothing}
                    @pointerenter=${() => this._pauseTimer(p.id)}
                    @pointerleave=${(e) => this._resumeTimer(p.id, e)}
                    @focusin=${() => this._pauseTimer(p.id)}
                    @focusout=${(e) => this._resumeTimer(p.id, e)}
                >
                    ${p.isToast ? html`
                        <div class="toast-card ${p.type === 'success' ? 'success' : p.type === 'error' || p.type === 'danger' ? 'danger' : p.type === 'warning' ? 'warning' : 'info'}">
                            <span class="toast-message">${p.message}</span>
                            ${p.duration > 0 ? html`
                                <cgo-spinner
                                    mode="progress"
                                    size="20"
                                    duration="${p.duration}"
                                    fill-mode="fill"
                                    direction="cw"
                                    class="toast-progress-ring"
                                    aria-hidden="true"
                                    ?paused=${!!p.paused}
                                ></cgo-spinner>
                            ` : html`
                                <button class="toast-close" type="button" aria-label="关闭" @click=${(e) => this._handleItemClose(p.id, e)}>
                                    <cgo-icon name="close" size="12"></cgo-icon>
                                </button>
                            `}
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
                            ?paused=${!!p.paused}
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

function ensureSingletonPopup() {
    if (!_singletonPopup || !document.body.contains(_singletonPopup)) {
        _singletonPopup = document.createElement('cgo-notice-popup');
        document.body.appendChild(_singletonPopup);
    }
    return _singletonPopup;
}

export function showNoticePopup(noticeConfig, duration = 5000) {
    if (typeof window === 'undefined') return null;
    return ensureSingletonPopup().push(noticeConfig, duration);
}

// 注册后预先创建空容器（fixed 定位、无内容、pointer-events: none，不可见也不占位），
// 让 live region 早于首条通知存在。放到页面就绪后的空闲时刻，避开框架的首屏水合。
if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.customElements) {
    const precreate = () => {
        const run = () => {
            try {
                if (document.body) ensureSingletonPopup();
            } catch (_) {}
        };
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 2000 });
        else setTimeout(run, 300);
    };
    if (document.readyState === 'complete') precreate();
    else window.addEventListener('load', precreate, { once: true });
}
