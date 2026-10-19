import { LitElement, html, css } from 'lit';
import './icon.js';
import { injectLiquidGlassFilter } from '../theme.js';
import {
    glassRefractionStyles,
    tierBPanelUnderlayRules,
    tierBPanelUnderlayDarkRules,
    tierBRimWeakRules,
    tierBRimWeakDarkRules,
    tierCRimRules,
    tierCRimDarkRules,
    tierCSurfaceUnderlayRules,
    tierCSurfaceUnderlayDarkRules,
} from '../styles/glass-shared.js';

/**
 * <cgo-modal open title="标题" max-width="420px">内容…</cgo-modal>
 * 遮罩 + 居中对话框 + 关闭按钮。遵循次世代 Liquid Glass Tier B 不可交互底板规范。
 * 面板主题严格对齐 Tier B；若面板内容包含 card 类型，则内容对齐 Tier C 强调表面规范。
 * 事件: cgo-close（点击关闭按钮 / 遮罩 / Esc 时派发）。
 */
export class CgoModal extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        maxWidth: { type: String, attribute: 'max-width' },
        closeOnOverlay: { type: Boolean, attribute: 'close-on-overlay' },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
        tier: { type: String, reflect: true },
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

        /* 遵循 Tier B 不可交互底板规范 (0.9 衬底，柔和顶部微光圈，严禁 hover 任何位移动效) */
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
            animation: dialogIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);
            overscroll-behavior: contain;
        }

        /* Layer 0: 折射磨砂层 (Tier B 规范: 14px 物理高斯模糊 + 135% 饱和度 + SVG 空间微折射) */
        ${glassRefractionStyles}

        /* Layer 1: 半透明底色衬底层 (Tier B 规范: 0.9 固定) */
        .dialog::after {
            ${tierBPanelUnderlayRules}
        }
        :host-context([data-theme='dark']) .dialog::after {
            ${tierBPanelUnderlayDarkRules}
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与 0.9 高不透明底板自然融合) */
        .dialog::before {
            ${tierBRimWeakRules}
        }

        :host-context([data-theme='dark']) .dialog::before {
            ${tierBRimWeakDarkRules}
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
        /* C-04: 弹窗退出动画 — 干脆收缩，不反弹 */
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
            animation: overlayOut 0.18s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes overlayOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .dialog.closing {
            /* C-04: 出场使用 ease-in，无反弹 */
            animation: dialogOut 0.16s cubic-bezier(0.4, 0, 1, 1) forwards;
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
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            user-select: none;
            transition: color 0.16s ease, transform 0.12s cubic-bezier(0.2, 0, 0, 1);
        }
        @media (hover: hover) and (pointer: fine) {
            .close:hover {
                color: var(--text-main, #00263b);
                transform: scale(1.08);
            }
        }
        .close:active {
            transform: scale(0.92);
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
            overscroll-behavior-y: contain;
            color: var(--text-main, #00263b);
            font-family: var(--font-sans, system-ui, sans-serif);
            line-height: 1.6;
        }
        ::slotted(p),
        .body::slotted(p) {
            margin: 0 0 10px;
        }
        ::slotted(.dialog-buttons),
        .body::slotted(.dialog-buttons) {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 16px;
        }

        /* ══════════════════════════════════════════════════════
           面板内容如果包含 card 类型，则内容对齐 Tier C 强调表面规范
           (固定 0.72 衬底 + 完整双轴微光圈 + 零 hover 位移抖动)
           ══════════════════════════════════════════════════════ */
        ::slotted(cgo-card),
        .body::slotted(cgo-card) {
            display: block;
            margin-bottom: 12px;
            --glass-bg-surface: rgba(255, 255, 255, 0.72);
        }
        :host-context([data-theme='dark']) ::slotted(cgo-card),
        :host-context([data-theme='dark']) .body::slotted(cgo-card) {
            --glass-bg-surface: rgba(31, 32, 34, 0.72);
        }

        ::slotted(.card),
        ::slotted(.help-card),
        ::slotted(.modal-card),
        ::slotted([data-card]),
        .body::slotted(.card),
        .body::slotted(.help-card),
        .body::slotted(.modal-card),
        .body::slotted([data-card]) {
            display: block;
            position: relative;
            background: transparent !important;
            border: none !important;
            border-radius: var(--radius-lg, 12px);
            padding: 14px 16px;
            margin-bottom: 12px;
            box-sizing: border-box;
            color: var(--text-main, #00263b);
            overflow: hidden;
            isolation: isolate;
            box-shadow: var(--glass-shadow-surface, 0 4px 16px rgba(0, 38, 59, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04));
            cursor: default;
            transform: none !important;
        }

        :host-context([data-theme='dark']) ::slotted(.card),
        :host-context([data-theme='dark']) ::slotted(.help-card),
        :host-context([data-theme='dark']) ::slotted(.modal-card),
        :host-context([data-theme='dark']) ::slotted([data-card]),
        :host-context([data-theme='dark']) .body::slotted(.card),
        :host-context([data-theme='dark']) .body::slotted(.help-card),
        :host-context([data-theme='dark']) .body::slotted(.modal-card),
        :host-context([data-theme='dark']) .body::slotted([data-card]) {
            color: var(--text-main, #e5e8ea);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
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
                animation: drawerIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .dialog.closing {
                animation: drawerOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
            }
            .body {
                padding-bottom: max(24px, env(safe-area-inset-bottom, 20px));
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
        @keyframes drawerOut {
            from {
                transform: translateY(0);
            }
            to {
                transform: translateY(100%);
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
        this.tier = 'b'; /* 模态弹窗面板主题默认且固定对齐 Tier B */
        this._closing = false; /* C-04: 退出动画中标记 */
        this._onKey = this._onKey.bind(this);
        this._syncNestedCards = this._syncNestedCards.bind(this);
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

    firstUpdated() {
        this._syncNestedCards();
    }

    _syncNestedCards() {
        const slot = this.shadowRoot?.querySelector('slot');
        if (!slot) return;
        const elements = slot.assignedElements ? slot.assignedElements({ flatten: true }) : [];
        elements.forEach((el) => {
            if (el.tagName?.toLowerCase() === 'cgo-card') {
                if (el.getAttribute('tier') !== 'c') {
                    el.setAttribute('tier', 'c');
                }
            }
            const nestedCards = el.querySelectorAll?.('cgo-card');
            nestedCards?.forEach((card) => {
                if (card.getAttribute('tier') !== 'c') {
                    card.setAttribute('tier', 'c');
                }
            });
        });
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
                <div class="body"><slot @slotchange=${this._syncNestedCards}></slot></div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-modal') || customElements.define('cgo-modal', CgoModal);
}
