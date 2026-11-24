import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { injectLiquidGlassFilter } from '../theme.js';
import './notice-card.js';
import './spinner.js';

/**
 * <cgo-notice-popup> — CGoPush 标准浮动通知弹窗容器组件
 */
export class CgoNoticePopup extends LitElement {
    static properties = {
        position: { type: String, reflect: true },
        maxVisible: { type: Number, attribute: 'max-visible' },
        _popups: { state: true }
    };

    static styles = css`
        :host {
            position: fixed;
            z-index: 100100;
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
            transform: translateX(110%);
            opacity: 0;
            transition:
                transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.22s ease-out;
        }

        .popup-item.show {
            transform: none;
            opacity: 1;
        }

        .popup-item.leaving {
            transform: translateX(110%) scale(0.95);
            opacity: 0;
            pointer-events: none;
            transition:
                transform 0.18s cubic-bezier(0.4, 0, 1, 1),
                opacity 0.14s ease-in !important;
        }

        :host([position="top-left"]) .popup-item,
        :host([position="bottom-left"]) .popup-item {
            transform: translateX(-110%);
        }

        :host([position="top-left"]) .popup-item.show,
        :host([position="bottom-left"]) .popup-item.show {
            transform: none;
        }

        :host([position="top-left"]) .popup-item.leaving,
        :host([position="bottom-left"]) .popup-item.leaving {
            transform: translateX(-110%) scale(0.95);
        }

        @media (prefers-reduced-motion: reduce) {
            .popup-item {
                transition: opacity 0.15s ease !important;
                transform: none !important;
            }
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
            border: none;
            background: var(--cgo-tooltip-bg, rgba(0, 38, 59, 0.85));
            color: #ffffff;
            backdrop-filter: blur(14px) saturate(140%);
            -webkit-backdrop-filter: blur(14px) saturate(140%);
            box-shadow:
                0 0 0 0.5px rgba(255, 255, 255, 0.12),
                0 10px 30px -4px rgba(0, 0, 0, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.25);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .toast-message {
            flex: 1;
            color: #ffffff;
        }

        .toast-progress-ring {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            margin-right: 0px;
            --primary-color: rgba(255, 255, 255, 0.95);
            --border-color: rgba(255, 255, 255, 0.25);
        }

        .toast-card.info {
            background: var(--primary-color) !important;
            color: #ffffff !important;
        }

        .toast-card.success {
            background: var(--success-color) !important;
            color: #ffffff !important;
        }

        .toast-card.danger,
        .toast-card.error {
            background: var(--danger-color) !important;
            color: #ffffff !important;
        }

        .toast-card.warning,
        .toast-card.warn {
            background: var(--warning-color) !important;
            color: #ffffff !important;
        }
    `;

    constructor() {
        super();
        this.position = 'top-right';
        this.maxVisible = 5;
        this._popups = [];
        this._seq = 0;
        this._leaveTimers = new Set();
        this._onVisibilityChange = () => {
            if (document.hidden) {
                this._pauseAll();
            } else {
                this._resumeAll();
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
        document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('visibilitychange', this._onVisibilityChange);
        this._clearAllTimers();
    }

    _clearAllTimers() {
        this._popups.forEach(p => {
            if (p.timerId) {
                clearTimeout(p.timerId);
                p.timerId = null;
            }
        });
        this._leaveTimers.forEach(t => clearTimeout(t));
        this._leaveTimers.clear();
    }

    _pauseItem(id) {
        const p = this._popups.find(item => item.id === id);
        if (!p || p.state === 'leaving' || !p.duration || p.paused) return;
        if (p.timerId) {
            clearTimeout(p.timerId);
            p.timerId = null;
        }
        const elapsed = Date.now() - (p.startTime || Date.now());
        p.remaining = Math.max(0, (p.remaining ?? p.duration) - elapsed);
        p.paused = true;
        this._popups = [...this._popups];
    }

    _resumeItem(id) {
        const p = this._popups.find(item => item.id === id);
        if (!p || p.state === 'leaving' || !p.duration || !p.paused) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        p.paused = false;
        p.startTime = Date.now();
        const rem = p.remaining ?? p.duration;
        if (rem > 0) {
            p.timerId = setTimeout(() => {
                this.remove(id);
            }, rem);
        } else {
            this.remove(id);
        }
        this._popups = [...this._popups];
    }

    _pauseAll() {
        this._popups.forEach(p => this._pauseItem(p.id));
    }

    _resumeAll() {
        this._popups.forEach(p => this._resumeItem(p.id));
    }

    /**
     * 推送一条通知气泡或 Toast 提示
     * @param {Object} item - 配置项
     * @param {number} [duration] - 自动关闭显示时长(ms)，默认 5000，传 0 则不自动关闭
     */
    push(item = {}, duration = 5000) {
        const id = item.id || `popup_${++this._seq}`;
        const rawDuration = item.isToast ? (duration === undefined ? 3000 : duration) : duration;
        const resolvedDuration = Math.max(0, Number(rawDuration) || 0);
        const hiddenNow = typeof document !== 'undefined' && document.hidden;

        const popupItem = item.isToast
            ? {
                  id,
                  isToast: true,
                  message: item.message || '',
                  type: item.type || 'info',
                  duration: resolvedDuration,
                  remaining: resolvedDuration,
                  startTime: Date.now(),
                  paused: hiddenNow && resolvedDuration > 0,
                  timerId: null,
                  state: 'entering',
              }
            : {
                  id,
                  isToast: false,
                  category: item.category || 'software',
                  title: item.title || item.noticeTitle || '',
                  content: item.content || '',
                  imageUrl: item.imageUrl || item.image || '',
                  actions: item.actions || [],
                  duration: resolvedDuration,
                  remaining: resolvedDuration,
                  startTime: Date.now(),
                  paused: hiddenNow && resolvedDuration > 0,
                  timerId: null,
                  state: 'entering',
              };

        const active = this._popups.filter(p => p.state !== 'leaving');
        if (this.maxVisible > 0 && active.length >= this.maxVisible) {
            const overflow = active.slice(0, active.length - this.maxVisible + 1);
            overflow.forEach(old => this.remove(old.id));
        }

        this._popups = [...this._popups, popupItem];

        requestAnimationFrame(() => {
            this._popups = this._popups.map(p => (p.id === id && p.state === 'entering' ? { ...p, state: 'show' } : p));
        });

        if (resolvedDuration > 0 && !hiddenNow) {
            popupItem.timerId = setTimeout(() => {
                this.remove(id);
            }, resolvedDuration);
        }

        return id;
    }

    remove(id) {
        const item = this._popups.find(p => p.id === id);
        if (!item || item.state === 'leaving') return;
        if (item.timerId) {
            clearTimeout(item.timerId);
            item.timerId = null;
        }
        this._popups = this._popups.map(p => p.id === id ? { ...p, state: 'leaving' } : p);
        const t = setTimeout(() => {
            this._leaveTimers.delete(t);
            this._popups = this._popups.filter(p => p.id !== id);
        }, 220);
        this._leaveTimers.add(t);
    }

    clear() {
        this._clearAllTimers();
        this._popups = this._popups.map(p => ({ ...p, state: 'leaving' }));
        const t = setTimeout(() => {
            this._leaveTimers.delete(t);
            this._popups = [];
        }, 220);
        this._leaveTimers.add(t);
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
                <div class="popup-item ${p.state}"
                    @mouseenter=${() => this._pauseItem(p.id)}
                    @mouseleave=${() => this._resumeItem(p.id)}>
                    ${p.isToast ? html`
                        <div class="toast-card ${p.type === 'success' ? 'success' : p.type === 'error' || p.type === 'danger' ? 'danger' : p.type === 'warning' || p.type === 'warn' ? 'warning' : 'info'}">
                            <span class="toast-message">${p.message}</span>
                            ${p.duration > 0 ? html`
                                <cgo-spinner
                                    mode="progress"
                                    size="20"
                                    duration="${p.duration}"
                                    ?paused=${p.paused}
                                    fill-mode="fill"
                                    direction="cw"
                                    class="toast-progress-ring"
                                ></cgo-spinner>
                            ` : null}
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
                            ?paused=${p.paused}
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
