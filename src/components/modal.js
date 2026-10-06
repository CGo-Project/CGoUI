import { LitElement, html, css, nothing } from 'lit';
import './icon.js';
import { getDeepActiveElement, getFocusableElements, composedContains, safeFocus, trapTabKey } from '../utils/focus.js';

/* 已打开的模态框（按打开顺序）；Esc 与 Tab 约束只作用于最上层那个 */
const _openModals = [];

/**
 * <cgo-modal open title="标题" max-width="420px">内容…</cgo-modal>
 * 遮罩 + 居中对话框 + 关闭按钮。移植自 cgo_element.css §9。
 * 事件: cgo-close（点击关闭按钮 / 遮罩 / Esc 时派发）。
 * 焦点: 打开时移入对话框（优先 [autofocus]，其次内容里第一个可聚焦元素），
 *       Tab 在框内循环，关闭后归还给打开前的元素。
 */
export class CgoModal extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        maxWidth: { type: String, attribute: 'max-width' },
        closeOnOverlay: { type: Boolean, attribute: 'close-on-overlay' },
    };

    static styles = css`
        :host {
            display: none;
        }
        :host([open]) {
            display: block;
        }
        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 9000;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            animation: overlayIn 0.2s ease;
        }
        @keyframes overlayIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        .dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--panel-bg, #fff);
            color: var(--text-main, #00263b);
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-lg, 12px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
            z-index: 9001;
            width: min(560px, 92dvw);
            max-height: 90dvh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: dialogIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes dialogIn {
            from {
                opacity: 0;
                transform: translate(-50%, -48%) scale(0.96);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        .close {
            position: absolute;
            top: 12px;
            right: 16px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.6rem;
            color: var(--text-light, #666);
            line-height: 1;
            padding: 0;
            z-index: 1;
            transition: color 0.2s;
        }
        .close:hover {
            color: var(--text-main, #00263b);
        }
        .close:focus-visible {
            outline: 2px solid var(--focus-ring, #00263b);
            outline-offset: 2px;
        }
        .dialog:focus {
            outline: none;
        }
        .title {
            margin: 0;
            padding: 22px 25px 0;
            font-size: 18px;
            font-weight: 700;
        }
        .body {
            padding: 16px 25px 22px;
            overflow-y: auto;
            color: var(--text-main, #00263b);
            font-family: var(--font-sans, system-ui, sans-serif);
            line-height: 1.6;
        }
        .body::slotted(p) {
            margin: 0 0 10px;
        }
        .body::slotted(.dialog-buttons) {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 16px;
        }
        @media screen and (max-width: 600px) {
            .dialog {
                top: auto;
                bottom: 0;
                left: 0;
                transform: none;
                width: 100dvw !important;
                max-width: 100dvw !important;
                max-height: 85dvh;
                border-radius: 20px 20px 0 0;
                animation: drawerIn 0.3s cubic-bezier(0.32, 0.94, 0.6, 1);
            }
        }
        @keyframes drawerIn {
            from {
                transform: translateY(100%);
            }
            to {
                transform: translateY(0);
            }
        }
        @media (prefers-reduced-motion: reduce) {
            .overlay,
            .dialog {
                animation: none !important;
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.title = '';
        this.maxWidth = '';
        this.closeOnOverlay = true;
        this._onKey = this._onKey.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', this._onKey);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this._onKey);
        this._unregister();
        this._returnFocus = null;
    }
    _unregister() {
        const index = _openModals.indexOf(this);
        if (index >= 0) _openModals.splice(index, 1);
    }
    _onKey(e) {
        if (!this.open) return;
        // 叠放多个模态框时只有最上层响应
        if (_openModals.length && _openModals[_openModals.length - 1] !== this) return;
        if (e.key === 'Escape') {
            // 内部弹层（下拉等）已经用这次 Esc 收起自己时，不再关闭模态框
            if (e.defaultPrevented) return;
            this._close();
        } else if (e.key === 'Tab') {
            const dialog = this.renderRoot.querySelector('.dialog');
            if (dialog) trapTabKey(e, dialog, dialog);
        }
    }
    willUpdate(changed) {
        // 记住打开前持有焦点的元素，关闭时归还
        if (changed.has('open') && this.open && !this._returnFocus) {
            this._returnFocus = getDeepActiveElement();
        }
    }
    updated(changed) {
        if (!changed.has('open')) return;
        if (this.open) {
            if (!_openModals.includes(this)) _openModals.push(this);
            this._focusInitial();
        } else if (changed.get('open')) {
            this._unregister();
            this._restoreFocus();
        }
    }
    _focusInitial() {
        const dialog = this.renderRoot.querySelector('.dialog');
        if (!dialog) return;
        // 焦点已经在框内（例如内容自行聚焦）时不抢
        if (composedContains(dialog, getDeepActiveElement())) return;
        const body = this.renderRoot.querySelector('.body');
        const inBody = getFocusableElements(body);
        const preferred = this.querySelector('[autofocus]');
        const target =
            (preferred && inBody.find((el) => el === preferred || composedContains(preferred, el))) ||
            inBody[0] ||
            this.renderRoot.querySelector('.close') ||
            dialog;
        if (!safeFocus(target)) safeFocus(dialog);
    }
    _restoreFocus() {
        const target = this._returnFocus;
        this._returnFocus = null;
        // 关闭后焦点已被宿主页面移到别处时不干预
        const active = getDeepActiveElement();
        if (active && active !== document.body && active !== this && !composedContains(this, active)) return;
        if (target && target !== document.body) safeFocus(target);
    }
    _close() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('cgo-close', { bubbles: true, composed: true }));
    }
    show() {
        this.open = true;
    }

    render() {
        if (!this.open) return html``;
        const style = this.maxWidth ? `width:min(${this.maxWidth},92dvw)` : '';
        return html`
            <div class="overlay" @click=${() => this.closeOnOverlay && this._close()}></div>
            <div
                class="dialog"
                style=${style}
                role="dialog"
                aria-modal="true"
                aria-labelledby=${this.title ? 'dialog-title' : nothing}
                aria-label=${this.title ? nothing : this.getAttribute('aria-label') || nothing}
                tabindex="-1"
            >
                <button class="close" type="button" @click=${this._close} aria-label="关闭"><cgo-icon name="close" size="14"></cgo-icon></button>
                ${this.title
                    ? html`
                          <h3 class="title" id="dialog-title">${this.title}</h3>
                      `
                    : null}
                <div class="body"><slot></slot></div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-modal') || customElements.define('cgo-modal', CgoModal);
}
