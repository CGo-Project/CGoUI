import { LitElement, html, css } from 'lit';
import './icon.js';
import { injectLiquidGlassFilter } from '../theme.js';

/**
 * <cgo-modal open title="标题" max-width="420px">内容…</cgo-modal>
 * 遮罩 + 居中对话框 + 关闭按钮。遵循次世代 Liquid Glass Tier B 不可交互底板规范。
 * 事件: cgo-close（点击关闭按钮 / 遮罩 / Esc 时派发）。
 */
export class CgoModal extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        maxWidth: { type: String, attribute: 'max-width' },
        closeOnOverlay: { type: Boolean, attribute: 'close-on-overlay' },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
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
            background: transparent;
            z-index: 99990;
            backdrop-filter: blur(8px) saturate(120%);
            -webkit-backdrop-filter: blur(8px) saturate(120%);
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

        /* 遵循 Tier B 不可交互底板规范 (0.82 衬底，柔和顶部微光圈) */
        .dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: transparent;
            color: var(--text-main, #00263b);
            border: none;
            border-radius: var(--radius-lg, 12px);
            box-shadow: 0 20px 50px -10px rgba(0, 38, 59, 0.2), 0 8px 24px -4px rgba(0, 38, 59, 0.12);
            z-index: 100000;
            width: min(560px, 92dvw);
            max-height: 90dvh;
            overflow: hidden;
            isolation: isolate;
            display: flex;
            flex-direction: column;
            animation: dialogIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
            -webkit-backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
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
        .dialog::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }
        :host-context([data-theme='dark']) .dialog::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82));
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与 0.82 高不透明底板自然融合) */
        .dialog::before {
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

        :host-context([data-theme='dark']) .dialog::before {
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 1px,
                rgba(255, 255, 255, 0) 8px);
        }

        :host-context([data-theme='dark']) .dialog {
            box-shadow: 0 24px 60px -10px rgba(0, 0, 0, 0.7), 0 8px 24px -4px rgba(0, 0, 0, 0.5);
        }

        /* 传统扁平降级 */
        :host([glass-mode='flat']) .dialog,
        :host([glass-mode='none']) .dialog {
            background: var(--panel-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .dialog::before,
        :host([glass-mode='flat']) .dialog::after,
        :host([glass-mode='none']) .dialog::before,
        :host([glass-mode='none']) .dialog::after {
            display: none;
        }
        :host-context([data-theme='dark']):host([glass-mode='flat']) .dialog {
            background: var(--panel-bg, #1f2020);
            border-color: var(--border-color, #383a3c);
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
        /* C-04: 弹窗退出动画 — 干脱收缩，不反弹 */
        @keyframes dialogOut {
            from {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -48%) scale(0.97);
            }
        }
        .overlay.closing {
            animation: overlayOut 0.2s ease-in forwards;
        }
        @keyframes overlayOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .dialog.closing {
            /* C-04: 出场使用 ease-in，无弹跨 */
            animation: dialogOut 0.18s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        .close {
            position: absolute;
            top: 14px;
            right: 16px;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-light, #666);
            line-height: 1;
            padding: 4px;
            z-index: 10;
            transition: color 0.2s, transform 0.15s;
        }
        .close:hover {
            color: var(--text-main, #00263b);
            transform: scale(1.08);
        }
        .title {
            position: relative;
            z-index: 3;
            margin: 0;
            padding: 22px 25px 0;
            font-size: 18px;
            font-weight: 700;
        }
        .body {
            position: relative;
            z-index: 3;
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
        @media screen and (max-width: 640px) {
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
        this.glassMode = '';
        this._closing = false; /* C-04: 退出动画中标记 */
        this._onKey = this._onKey.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
        document.addEventListener('keydown', this._onKey);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this._onKey);
    }
    _onKey(e) {
        if (e.key === 'Escape' && this.open && !this._closing) this._close();
    }
    _close() {
        if (this._closing) return;
        /* C-04: 播放退出动画，动画结束后再关闭 */
        this._closing = true;
        this.requestUpdate();
        const dialog = this.shadowRoot?.querySelector('.dialog');
        const overlay = this.shadowRoot?.querySelector('.overlay');
        const done = () => {
            this._closing = false;
            this.open = false;
            this.dispatchEvent(new CustomEvent('cgo-close', { bubbles: true, composed: true }));
        };
        if (dialog) {
            dialog.addEventListener('animationend', done, { once: true });
        } else {
            done();
        }
    }
    show() {
        this.open = true;
    }

    render() {
        if (!this.open && !this._closing) return html``;
        const style = this.maxWidth ? `width:min(${this.maxWidth},92dvw)` : '';
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        return html`
            <div class="overlay ${this._closing ? 'closing' : ''}" @click=${() => !this._closing && this.closeOnOverlay && this._close()}></div>
            <div class="dialog ${this._closing ? 'closing' : ''}" style=${style} role="dialog" aria-modal="true">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
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
