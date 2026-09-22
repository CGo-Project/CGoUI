import { LitElement, html, css } from 'lit';
import './icon.js';

export class CgoFloatingWindow extends LitElement {
    static properties = {
        title: { type: String },
        snapped: { type: Boolean, reflect: true },
        minimized: { type: Boolean, reflect: true },
        closed: { type: Boolean, reflect: true },
        interactive: { type: Boolean, reflect: true },
        noclose: { type: Boolean, reflect: true },
        lockx: { type: Boolean, reflect: true },
        resetOnDragend: { type: Boolean, attribute: 'reset-on-dragend', reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        :host([closed]) {
            display: none !important;
        }
        :host([minimized]) .content {
            display: none;
        }
        :host([interactive]) .header {
            cursor: move;
            user-select: none;
        }
        .window {
            width: min(320px, 100%);
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-lg, 12px);
            background: var(--panel-bg, #fff);
            box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12));
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100%;
            box-sizing: border-box;
        }
        :host-context([glass-mode="liquid"]) .window,
        :host-context([glass-mode="blur"]) .window,
        :host-context([data-glass-mode="liquid"]) .window,
        :host-context([data-glass-mode="blur"]) .window {
            border: none;
            background: rgba(255, 255, 255, 0.80);
            backdrop-filter: blur(14px) saturate(135%);
            -webkit-backdrop-filter: blur(14px) saturate(135%);
            box-shadow:
                0 0 0 0.5px rgba(0, 0, 0, 0.06),
                0 14px 34px -6px rgba(0, 38, 59, 0.14),
                0 3px 8px -2px rgba(0, 38, 59, 0.06),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.85);
        }
        :host-context([data-theme="dark"][glass-mode="liquid"]) .window,
        :host-context([data-theme="dark"][glass-mode="blur"]) .window,
        :host-context([data-theme="dark"][data-glass-mode="liquid"]) .window,
        :host-context([data-theme="dark"][data-glass-mode="blur"]) .window {
            border: none;
            background: rgba(28, 30, 32, 0.82);
            backdrop-filter: blur(14px) saturate(135%);
            -webkit-backdrop-filter: blur(14px) saturate(135%);
            box-shadow:
                0 0 0 0.5px rgba(255, 255, 255, 0.1),
                0 18px 40px -6px rgba(0, 0, 0, 0.6),
                0 4px 10px -2px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
        }
        :host([snapped]) .window {
            border-color: var(--primary-color, #00263b);
            box-shadow:
                0 0 0 3px rgba(0, 29, 49, 0.12),
                var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12));
        }
        .header {
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px 0 14px;
            border-bottom: 1px solid var(--border-color, #dee2e6);
            background: var(--card-bg, #fff);
            flex-shrink: 0;
        }
        :host-context([glass-mode="liquid"]) .header,
        :host-context([glass-mode="blur"]) .header,
        :host-context([data-glass-mode="liquid"]) .header,
        :host-context([data-glass-mode="blur"]) .header {
            background: rgba(255, 255, 255, 0.5);
            border-bottom-color: rgba(0, 0, 0, 0.08);
        }
        :host-context([data-theme="dark"][glass-mode="liquid"]) .header,
        :host-context([data-theme="dark"][glass-mode="blur"]) .header,
        :host-context([data-theme="dark"][data-glass-mode="liquid"]) .header,
        :host-context([data-theme="dark"][data-glass-mode="blur"]) .header {
            background: rgba(35, 37, 40, 0.5);
            border-bottom-color: rgba(255, 255, 255, 0.08);
        }
        .title-wrapper {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow: hidden;
            min-width: 0;
            margin-right: 8px;
        }
        .title {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main, #00263b);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .controls {
            display: flex;
            gap: 4px;
            color: var(--text-light, #666);
            flex-shrink: 0;
        }
        .ctrl {
            width: 22px;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-xs, 4px);
            background: transparent;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
        }
        .ctrl:hover {
            background: var(--btn-info-hover, #e9ecef);
            color: var(--text-main, #00263b);
        }
        .content {
            padding: var(--cgo-floating-content-padding, 14px);
            color: var(--text-light, #666);
            font-size: 13px;
            line-height: 1.55;
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
        }
    `;

    constructor() {
        super();
        this.title = '浮动控制面板';
        this.snapped = false;
        this.minimized = false;
        this.closed = false;
        this.interactive = true;
        this.noclose = false;
        this.lockx = false;
        this.resetOnDragend = false;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._toggleMinimize = this._toggleMinimize.bind(this);
        this._close = this._close.bind(this);
    }

    _onPointerDown(e) {
        if (!this.interactive) return;
        if (e.button !== 0) return;
        if (e.target.closest('.controls')) return;

        const rect = this.getBoundingClientRect();
        const style = window.getComputedStyle(this);
        const offsetParent = this.offsetParent || document.body;
        const parentRect = offsetParent.getBoundingClientRect();

        let initialX = rect.left - parentRect.left;
        let initialY = rect.top - parentRect.top;

        if (style.position !== 'absolute' && style.position !== 'fixed') {
            this.style.position = 'absolute';
            this.style.zIndex = '1000';
            this.style.left = `${initialX}px`;
            this.style.top = `${initialY}px`;
            this.style.margin = '0';
        }

        this._x = parseFloat(this.style.left);
        if (isNaN(this._x)) this._x = initialX;

        this._y = parseFloat(this.style.top);
        if (isNaN(this._y)) this._y = initialY;

        this._startX = e.clientX;
        this._startY = e.clientY;
        this._isDragging = true;
        this._dragHeader = e.currentTarget;

        try {
            if (this._dragHeader && this._dragHeader.setPointerCapture) {
                this._dragHeader.setPointerCapture(e.pointerId);
                this._pointerId = e.pointerId;
            }
        } catch (_) {}

        this._onPointerMoveBound = this._onPointerMove.bind(this);
        this._onPointerUpBound = this._onPointerUp.bind(this);
        document.addEventListener('pointermove', this._onPointerMoveBound);
        document.addEventListener('pointerup', this._onPointerUpBound);

        this.dispatchEvent(new CustomEvent('cgo-dragstart', { bubbles: true, composed: true }));
        e.preventDefault();
    }

    _onPointerMove(e) {
        if (!this._isDragging) return;

        const dx = e.clientX - this._startX;
        const dy = e.clientY - this._startY;

        let newX = this._x + dx;
        let newY = this._y + dy;

        if (this.offsetParent) {
            const parentRect = this.offsetParent.getBoundingClientRect();
            const componentRect = this.getBoundingClientRect();

            const maxX = Math.max(0, parentRect.width - componentRect.width);
            const maxY = Math.max(0, parentRect.height - componentRect.height);

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            const threshold = 12;
            let hasSnapped = false;

            if (newX < threshold) {
                newX = 0;
                hasSnapped = true;
            } else if (newX > maxX - threshold) {
                newX = maxX;
                hasSnapped = true;
            }

            if (newY < threshold) {
                newY = 0;
                hasSnapped = true;
            } else if (newY > maxY - threshold) {
                newY = maxY;
                hasSnapped = true;
            }

            this.snapped = hasSnapped;
        }

        if (this.lockx) {
            newX = this._x;
        }

        this.style.left = `${newX}px`;
        this.style.top = `${newY}px`;

        this.dispatchEvent(
            new CustomEvent('cgo-drag', {
                detail: { x: newX, y: newY, clientX: e.clientX, clientY: e.clientY, snapped: this.snapped },
                bubbles: true,
                composed: true,
            })
        );
    }

    _onPointerUp(e) {
        if (!this._isDragging) return;
        this._isDragging = false;

        if (this._pointerId !== undefined && this._dragHeader && this._dragHeader.releasePointerCapture) {
            try {
                this._dragHeader.releasePointerCapture(this._pointerId);
            } catch (_) {}
            this._pointerId = undefined;
        }

        document.removeEventListener('pointermove', this._onPointerMoveBound);
        document.removeEventListener('pointerup', this._onPointerUpBound);

        const clientX = e && e.clientX !== undefined ? e.clientX : 0;
        const clientY = e && e.clientY !== undefined ? e.clientY : 0;

        const currentLeft = parseFloat(this.style.left);
        const currentTop = parseFloat(this.style.top);
        if (!isNaN(currentLeft)) this._x = currentLeft;
        if (!isNaN(currentTop)) this._y = currentTop;

        // 仅在明确开启了 map 专用重置模式 (resetOnDragend 或 lockx) 时清理内联 left/top 样式
        if (this.resetOnDragend || this.lockx) {
            this.style.left = '';
            this.style.top = '';
        }

        this.dispatchEvent(
            new CustomEvent('cgo-dragend', {
                detail: { clientX, clientY },
                bubbles: true,
                composed: true,
            })
        );
    }

    _toggleMinimize() {
        this.minimized = !this.minimized;
        this.dispatchEvent(
            new CustomEvent('cgo-minimize', {
                detail: { minimized: this.minimized },
                bubbles: true,
                composed: true,
            })
        );
    }

    _close() {
        this.closed = true;
        this.dispatchEvent(new CustomEvent('cgo-close', { bubbles: true, composed: true }));
    }

    render() {
        return html`
            <section class="window">
                <div class="header" part="header" @pointerdown=${this._onPointerDown}>
                    <div class="title-wrapper">
                        <div class="title">${this.title}</div>
                        <slot name="title-extra"></slot>
                    </div>
                    <div class="controls">
                        <slot name="header-extra"></slot>
                        <button class="ctrl" title=${this.minimized ? '还原' : '最小化'} @click=${this._toggleMinimize}>
                            ${this.minimized ? '+' : '-'}
                        </button>
                        ${!this.noclose
                            ? html`<button class="ctrl" title="关闭" @click=${this._close}><cgo-icon name="close" size="12"></cgo-icon></button>`
                            : ''}
                    </div>
                </div>
                <div class="content" part="content"><slot></slot></div>
            </section>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-floating-window') || customElements.define('cgo-floating-window', CgoFloatingWindow);
}

