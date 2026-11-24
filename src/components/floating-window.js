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
            touch-action: none;
        }
        .window {
            width: min(320px, 100%);
            border: 1px solid var(--cgo-subtle-border, var(--border-color, #dee2e6));
            border-radius: var(--radius-lg, 12px);
            background: var(--glass-bg-panel, var(--panel-bg, #fff));
            backdrop-filter: var(--glass-backdrop-filter-panel, none);
            -webkit-backdrop-filter: var(--glass-backdrop-filter-panel, none);
            box-shadow: var(--cgo-shadow-dropdown, var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12)));
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100%;
            box-sizing: border-box;
        }
        :host([snapped]) .window {
            border-color: var(--primary-color, #00263b);
            box-shadow:
                0 0 0 3px color-mix(in srgb, var(--primary-color, #00263b) 16%, transparent),
                var(--cgo-shadow-dropdown, var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12)));
        }
        .header {
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px 0 14px;
            border-bottom: 1px solid var(--cgo-floating-header-border, var(--border-color, #dee2e6));
            background: var(--cgo-floating-header-bg, var(--card-bg, #fff));
            flex-shrink: 0;
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
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            user-select: none;
            transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
        }
        @media (hover: hover) and (pointer: fine) {
            .ctrl:hover {
                background: var(--btn-info-hover, #e9ecef);
                color: var(--text-main, #00263b);
            }
        }
        .ctrl:active {
            transform: scale(0.92);
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
        this._onPointerMoveBound = this._onPointerMove.bind(this);
        this._onPointerUpBound = this._onPointerUp.bind(this);
        this._toggleMinimize = this._toggleMinimize.bind(this);
        this._close = this._close.bind(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._cleanupDrag();
    }

    _cleanupDrag() {
        this._isDragging = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        if (this._pointerId !== undefined && this._dragHeader && this._dragHeader.releasePointerCapture) {
            try {
                this._dragHeader.releasePointerCapture(this._pointerId);
            } catch (_) {}
            this._pointerId = undefined;
        }
        document.removeEventListener('pointermove', this._onPointerMoveBound);
        document.removeEventListener('pointerup', this._onPointerUpBound);
        document.removeEventListener('pointercancel', this._onPointerUpBound);
    }

    _onPointerDown(e) {
        if (!this.interactive) return;
        if (e.button !== 0) return;
        if (e.target.closest('.controls')) return;

        const rect = this.getBoundingClientRect();
        const style = window.getComputedStyle(this);
        const isFixed = style.position === 'fixed';
        const offsetParent = isFixed ? null : (this.offsetParent || document.body);
        const parentRect = isFixed
            ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
            : offsetParent.getBoundingClientRect();

        const initialX = rect.left - parentRect.left;
        const initialY = rect.top - parentRect.top;

        if (style.position !== 'absolute' && style.position !== 'fixed') {
            this.style.position = 'absolute';
            this.style.zIndex = '1000';
            this.style.left = `${initialX}px`;
            this.style.top = `${initialY}px`;
            this.style.margin = '0';
        }

        this._isFixedDrag = isFixed;
        this._x = parseFloat(this.style.left);
        if (isNaN(this._x)) this._x = initialX;

        this._y = parseFloat(this.style.top);
        if (isNaN(this._y)) this._y = initialY;

        this._parentWidth = parentRect.width;
        this._parentHeight = parentRect.height;
        this._compWidth = rect.width;
        this._compHeight = rect.height;

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

        document.addEventListener('pointermove', this._onPointerMoveBound);
        document.addEventListener('pointerup', this._onPointerUpBound);
        document.addEventListener('pointercancel', this._onPointerUpBound);

        this.dispatchEvent(new CustomEvent('cgo-dragstart', { bubbles: true, composed: true }));
        e.preventDefault();
    }

    _onPointerMove(e) {
        if (!this._isDragging) return;

        const dx = e.clientX - this._startX;
        const dy = e.clientY - this._startY;

        let newX = this._x + dx;
        let newY = this._y + dy;

        if (this._isFixedDrag || this.offsetParent) {
            const maxX = Math.max(0, (this._parentWidth || 0) - (this._compWidth || 0));
            const maxY = Math.max(0, (this._parentHeight || 0) - (this._compHeight || 0));

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

        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
        }
        this._pendingX = newX;
        this._pendingY = newY;
        this._rafId = requestAnimationFrame(() => {
            this.style.left = `${newX}px`;
            this.style.top = `${newY}px`;
            this._rafId = null;
        });

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
        this._cleanupDrag();

        const clientX = e && e.clientX !== undefined ? e.clientX : 0;
        const clientY = e && e.clientY !== undefined ? e.clientY : 0;

        const currentLeft = this._pendingX !== undefined ? this._pendingX : parseFloat(this.style.left);
        const currentTop = this._pendingY !== undefined ? this._pendingY : parseFloat(this.style.top);
        if (!isNaN(currentLeft)) {
            this._x = currentLeft;
            this.style.left = `${currentLeft}px`;
        }
        if (!isNaN(currentTop)) {
            this._y = currentTop;
            this.style.top = `${currentTop}px`;
        }
        this._pendingX = undefined;
        this._pendingY = undefined;

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
                        <button
                            type="button"
                            class="ctrl"
                            title=${this.minimized ? '还原' : '最小化'}
                            aria-label=${this.minimized ? '还原' : '最小化'}
                            @click=${this._toggleMinimize}
                        >
                            ${this.minimized ? '+' : '-'}
                        </button>
                        ${!this.noclose
                            ? html`<button type="button" class="ctrl" title="关闭" aria-label="关闭" @click=${this._close}><cgo-icon name="close" size="12"></cgo-icon></button>`
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
