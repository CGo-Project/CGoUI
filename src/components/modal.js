import { LitElement, html, css } from 'lit';
import './icon.js';

/**
 * <cgo-modal open title="标题" max-width="420px">内容…</cgo-modal>
 * 遮罩 + 居中对话框 + 关闭按钮。移植自 cgo_element.css §9。
 * 事件: cgo-close（点击关闭按钮 / 遮罩 / Esc 时派发）。
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
        :host-context([glass-mode="liquid"]) .overlay,
        :host-context([glass-mode="blur"]) .overlay,
        :host-context([data-glass-mode="liquid"]) .overlay,
        :host-context([data-glass-mode="blur"]) .overlay {
            backdrop-filter: blur(8px) saturate(120%);
            -webkit-backdrop-filter: blur(8px) saturate(120%);
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
            backdrop-filter: var(--glass-backdrop-blur-surface, none);
            -webkit-backdrop-filter: var(--glass-backdrop-blur-surface, none);
        }
        :host-context([glass-mode="liquid"]) .dialog,
        :host-context([glass-mode="blur"]) .dialog,
        :host-context([data-glass-mode="liquid"]) .dialog,
        :host-context([data-glass-mode="blur"]) .dialog {
            background: rgba(255, 255, 255, 0.82);
            border-color: var(--glass-border, rgba(255, 255, 255, 0.4));
            box-shadow:
                0 0 0 0.5px rgba(0, 0, 0, 0.08),
                0 20px 50px -10px rgba(0, 38, 59, 0.2),
                0 6px 16px -4px rgba(0, 38, 59, 0.1),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.9);
        }
        :host-context([data-theme="dark"][glass-mode="liquid"]) .dialog,
        :host-context([data-theme="dark"][glass-mode="blur"]) .dialog,
        :host-context([data-theme="dark"][data-glass-mode="liquid"]) .dialog,
        :host-context([data-theme="dark"][data-glass-mode="blur"]) .dialog {
            background: rgba(28, 30, 32, 0.85);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow:
                0 0 0 0.5px rgba(255, 255, 255, 0.12),
                0 24px 60px -10px rgba(0, 0, 0, 0.7),
                0 8px 20px -4px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.16);
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
    }
    _onKey(e) {
        if (e.key === 'Escape' && this.open) this._close();
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
            <div class="dialog" style=${style} role="dialog" aria-modal="true">
                <button class="close" @click=${this._close} aria-label="关闭"><cgo-icon name="close" size="14"></cgo-icon></button>
                ${this.title
                    ? html`
                          <h3 class="title">${this.title}</h3>
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
