import { LitElement, html, css } from 'lit';
import './icon.js';
import { injectLiquidGlassFilter } from '../theme.js';
import { tierCRimRules } from '../styles/glass-shared.js';

/**
 * <cgo-nav-item>
 * 侧边导航中的单项。作为 <cgo-side-nav> 的子元素使用。
 */
export class CgoNavItem extends LitElement {
    static properties = {
        icon: { type: String },
        label: { type: String },
        target: { type: String },
        active: { type: Boolean, reflect: true },
        danger: { type: Boolean, reflect: true },
        heading: { type: Boolean, reflect: true },
        tag: { type: String },
        wrap: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: contents;
        }
    `;

    constructor() {
        super();
        this.icon = '';
        this.label = '';
        this.target = '';
        this.active = false;
        this.danger = false;
        this.heading = false;
        this.tag = '';
        this.wrap = false;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-nav-item') || customElements.define('cgo-nav-item', CgoNavItem);
}

/**
 * <cgo-side-nav>
 * 自适应侧边导航组件。
 * 事件: cgo-nav-change — detail = { target, index, item }
 */
export class CgoSideNav extends LitElement {
    static properties = {
        activeIndex: { type: Number, attribute: 'active-index' },
        docked: { type: Boolean, reflect: true },
        floating: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            --sidenav-width: var(--cgo-nav-width, var(--sidebar-width, 280px));
            --sidenav-bg: var(--glass-bg, rgba(248, 249, 250, 0.85));
            --sidenav-border: var(--border-color, rgba(0, 0, 0, 0.08));
            --sidenav-radius: var(--header-floating-radius, 12px);
            --sidenav-shadow: var(--header-floating-shadow, 0 4px 20px rgba(0, 0, 0, 0.12));
            --sidenav-item-gap: 4px;
            --sidenav-item-radius: 6px;
            --sidenav-item-px: 12px;
            --sidenav-item-py: 10px;
            --sidenav-active-bg: var(--primary-color, #006098);
            --sidenav-active-fg: var(--btn-text, #fff);
            --sidenav-active-border-left: transparent;
            --sidenav-danger-bg: var(--danger-color, #dc3545);
            --sidenav-danger-fg: #fff;
            --sidenav-user-brief-border: var(--glass-border, rgba(0, 0, 0, 0.08));
            --sidenav-footer-border: var(--glass-border, rgba(0, 0, 0, 0.08));

            display: block;
            font-family: var(--font-sans, system-ui, -apple-system, 'Noto Sans SC', sans-serif);
        }

        .sidenav {
            display: flex;
            flex-direction: column;
            width: var(--sidenav-width);
            height: 100%;
            background: transparent;
            border: none;
            border-radius: var(--sidenav-radius, 12px);
            box-shadow: var(--glass-shadow);
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            isolation: isolate;
            transition: transform var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1)),
                        box-shadow var(--glass-duration, 0.28s) var(--glass-easing, cubic-bezier(0.32, 0.72, 0, 1));
        }

        .liquid-glass-effect {
            position: absolute;
            z-index: 0;
            inset: 0;
            border-radius: inherit;
            backdrop-filter: var(--glass-backdrop-filter, blur(5px) saturate(130%));
            -webkit-backdrop-filter: var(--glass-backdrop-filter, blur(5px) saturate(130%));
            filter: var(--glass-refraction-filter, url(#glass-distortion));
            overflow: hidden;
            pointer-events: none;
            isolation: isolate;
        }

        .sidenav::after {
            content: "";
            position: absolute;
            z-index: 1;
            inset: 0;
            border-radius: inherit;
            background: var(--glass-bg, rgba(255, 255, 255, 0.60));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        .sidenav::before {
            ${tierCRimRules}
        }

        :host([docked]) .sidenav,
        :host(:not([floating])) .sidenav {
            border-radius: 0 !important;
            border-top: none !important;
            border-bottom: none !important;
            border-left: none !important;
            border-right: 1px solid var(--sidenav-border, var(--border-color)) !important;
            box-shadow: none !important;
        }
        :host([docked]) .sidenav::before,
        :host(:not([floating])) .sidenav::before {
            display: none !important;
        }

        .sidenav-user-brief,
        .sidenav-menu,
        .sidenav-footer {
            position: relative;
            z-index: 3;
        }

        .sidenav-user-brief {
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: 1px solid var(--sidenav-user-brief-border);
        }

        .sidenav-menu {
            flex: 1;
            overflow-y: auto;
            padding: 12px 10px;
            display: flex;
            flex-direction: column;
            gap: var(--sidenav-item-gap);
            scrollbar-width: thin;
        }

        .sidenav-footer {
            padding: 16px;
            border-top: 1px solid var(--sidenav-footer-border);
        }

        .sidenav-user-brief[hidden],
        .sidenav-footer[hidden] {
            display: none;
        }

        .sidenav-heading {
            padding: 12px var(--sidenav-item-px) 4px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: var(--text-light, #64748b);
            text-transform: uppercase;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .sidenav-heading:first-child {
            padding-top: 0;
        }
        .sidenav-heading-icon {
            font-size: 13px;
            line-height: 1;
        }

        .sidenav-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: var(--sidenav-item-py) var(--sidenav-item-px);
            border-radius: var(--sidenav-item-radius);
            border: none;
            color: var(--text-light, #64748b);
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9rem;
            background: none;
            width: 100%;
            text-align: left;
            font-family: inherit;
            line-height: 1.4;
            box-sizing: border-box;
            white-space: nowrap;
            user-select: none;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (hover: hover) and (pointer: fine) {
            .sidenav-item:hover {
                background-color: var(--btn-info-bg, #f1f3f5);
                color: var(--text-main, #102033);
            }
        }
        .sidenav-item:active {
            transform: scale(0.98);
        }
        .sidenav-item.active {
            background-color: var(--sidenav-active-bg);
            color: var(--sidenav-active-fg);
        }
        .sidenav-item.active .sidenav-item-tag {
            color: var(--sidenav-active-fg);
        }
        .sidenav-item.active cgo-icon {
            color: var(--sidenav-active-fg);
        }
        .sidenav-item.danger {
            color: var(--danger-color, #dc3545);
        }
        @media (hover: hover) and (pointer: fine) {
            .sidenav-item.danger:hover {
                background-color: rgba(217, 48, 37, 0.1);
                color: var(--danger-color, #dc3545);
            }
        }
        .sidenav-item.danger.active {
            background-color: var(--sidenav-danger-bg);
            color: var(--sidenav-danger-fg);
        }

        .sidenav-item-label {
            flex: 1;
            min-width: 0;
        }

        .sidenav-item-tag {
            font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
            font-size: 11px;
            color: var(--text-light, #64748b);
            margin-left: auto;
            flex-shrink: 0;
            font-weight: 400;
        }

        .sidenav-item.wrap {
            flex-wrap: wrap;
            white-space: normal;
            align-items: flex-start;
        }
        .sidenav-item.wrap .sidenav-item-label {
            flex: 0 0 100%;
        }
        .sidenav-item.wrap .sidenav-item-tag {
            margin-left: 0;
            width: 100%;
        }

        @media (max-width: 640px) {
            .sidenav {
                width: 100%;
                height: auto;
                flex-direction: row;
                align-items: center;
                border-radius: var(--header-floating-radius, 12px);
                border: none;
                background: transparent;
                box-shadow: var(--glass-shadow);
                padding: 0;
                flex-shrink: 0;
                box-sizing: border-box;
            }

            :host([floating]:not([docked])) {
                display: block;
                margin-left: calc(10px + env(safe-area-inset-left, 0px)) !important;
                margin-right: calc(10px + env(safe-area-inset-right, 0px)) !important;
                width: calc(100% - 20px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)) !important;
                max-width: calc(100% - 20px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)) !important;
                box-sizing: border-box;
            }

            :host(:not([floating])) .sidenav,
            :host([docked]) .sidenav {
                border-radius: 0 !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                border-right: none !important;
                border-bottom: 1px solid var(--sidenav-border, var(--border-color)) !important;
                box-shadow: none !important;
            }

            .sidenav-user-brief,
            .sidenav-footer,
            .sidenav-heading {
                display: none;
            }
            .sidenav-menu {
                flex-direction: row;
                padding: 10px 12px;
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;
                -webkit-overflow-scrolling: touch;
                touch-action: pan-x;
                overscroll-behavior-x: contain;
                gap: 8px;
                scrollbar-width: none;
                position: relative;
                z-index: 3;
            }
            .sidenav-menu::-webkit-scrollbar {
                display: none;
            }

            .sidenav-item {
                flex-shrink: 0;
                flex-direction: row;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                margin: 0;
                border-radius: var(--sidenav-item-radius, 6px);
                font-size: 0.85rem;
                width: auto;
                background-color: transparent;
                color: var(--text-light, #64748b);
            }
            .sidenav-item:hover {
                background-color: transparent;
            }
            .sidenav-item.active {
                background-color: var(--sidenav-active-bg);
                color: var(--sidenav-active-fg);
            }
            .sidenav-item.danger {
                color: var(--danger-color, #dc3545);
                background-color: var(--btn-info-bg, #f1f3f5);
            }
            .sidenav-item.danger.active {
                background-color: var(--sidenav-danger-bg);
                color: var(--sidenav-danger-fg);
            }
            .sidenav-item-tag {
                display: none;
            }
            .sidenav-item cgo-icon {
                width: 16px;
                height: 16px;
            }
        }
    `;

    constructor() {
        super();
        this.activeIndex = 0;
        this.docked = false;
        this.floating = false;
        this._manualFloating = false;
        this._lastItemsLen = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
        if (this.hasAttribute('floating')) {
            this._manualFloating = true;
        }
        this._syncFloatingState = (e) => {
            if (this.hasAttribute('docked')) {
                if (this.hasAttribute('floating')) this.removeAttribute('floating');
                return;
            }
            const eventMode = e?.detail?.mode;
            const rootHeaderMode =
                eventMode ||
                document.documentElement.getAttribute('header-mode') ||
                document.documentElement.getAttribute('data-header-mode') ||
                document.body?.getAttribute('header-mode') ||
                document.body?.getAttribute('data-header-mode');
            const isFloating = rootHeaderMode === 'floating';
            if (isFloating) {
                if (!this.hasAttribute('floating')) this.setAttribute('floating', '');
            } else if (!this._manualFloating) {
                if (this.hasAttribute('floating')) this.removeAttribute('floating');
            }
        };
        this._syncFloatingState();
        if (typeof window !== 'undefined') {
            window.addEventListener('cgo-header-mode-change', this._syncFloatingState);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (typeof window !== 'undefined' && this._syncFloatingState) {
            window.removeEventListener('cgo-header-mode-change', this._syncFloatingState);
        }
    }

    get _items() {
        return [...this.querySelectorAll('cgo-nav-item')];
    }

    get _clickableItems() {
        return this._items.filter((item) => !item.heading);
    }

    select(index) {
        const items = this._clickableItems;
        if (index < 0 || index >= items.length) return;
        this.activeIndex = index;
        items.forEach((item, i) => {
            item.active = i === index;
        });
        const target = items[index];
        this.dispatchEvent(
            new CustomEvent('cgo-nav-change', {
                detail: {
                    index,
                    target: target.target,
                    item: target,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    selectByTarget(targetId) {
        const items = this._clickableItems;
        const idx = items.findIndex((item) => item.target === targetId);
        if (idx >= 0) this.select(idx);
    }

    updated(changedProperties) {
        const currentLen = this._items.length;
        if (currentLen !== this._lastItemsLen) {
            this._lastItemsLen = currentLen;
            this._initActive();
        } else if (changedProperties.has('activeIndex')) {
            const items = this._clickableItems;
            if (items.length > 0 && this.activeIndex >= 0 && this.activeIndex < items.length) {
                items.forEach((item, i) => {
                    item.active = i === this.activeIndex;
                });
            }
        }
    }

    _onSlotChange() {
        const currentLen = this._items.length;
        if (currentLen !== this._lastItemsLen) {
            this._lastItemsLen = currentLen;
            this._initActive();
        }
        this.requestUpdate();
    }

    _initActive() {
        const items = this._clickableItems;
        if (items.length === 0) return;
        const preActive = items.findIndex((item) => item.active);
        if (preActive >= 0) {
            this.activeIndex = preActive;
        } else {
            const fallback = this.activeIndex >= 0 && this.activeIndex < items.length ? this.activeIndex : 0;
            items.forEach((item, i) => {
                item.active = i === fallback;
            });
            this.activeIndex = fallback;
        }
    }

    render() {
        const items = this._items;
        let clickableIdx = 0;

        const navItems = items.map((item, i) => {
            const icon = item.icon;
            const label = item.label;
            const isDanger = item.danger;
            const isHeading = item.heading;
            const isActive = item.active;
            const tag = item.tag;

            if (isHeading) {
                return html`
                    <div class="sidenav-heading">
                        ${icon ? html`<span class="sidenav-heading-icon">${icon}</span>` : null}
                        <span>${label}</span>
                    </div>
                `;
            }

            const currentClickableIdx = clickableIdx++;
            const wrapClass = item.wrap ? ' wrap' : '';
            return html`
                <button
                    class="sidenav-item ${isActive ? 'active' : ''} ${isDanger ? 'danger' : ''}${wrapClass}"
                    @click=${() => this.select(currentClickableIdx)}
                    type="button"
                >
                    ${icon ? html`<cgo-icon name=${icon} size="18"></cgo-icon>` : null}
                    <span class="sidenav-item-label">
                        ${label || html`<slot name="item-${i}"></slot>`}
                    </span>
                    ${tag ? html`<code class="sidenav-item-tag">${tag}</code>` : null}
                </button>
            `;
        });

        const hasBrief = this._hasSlot('user-brief');
        const hasFooter = this._hasSlot('footer');

        return html`
            <div class="sidenav">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div class="sidenav-user-brief" ?hidden=${!hasBrief}>
                    <slot name="user-brief" @slotchange=${this._onSlotChange}></slot>
                </div>

                <nav class="sidenav-menu">${navItems}</nav>

                <div class="sidenav-footer" ?hidden=${!hasFooter}>
                    <slot name="footer" @slotchange=${this._onSlotChange}></slot>
                </div>
                <slot hidden @slotchange=${this._onSlotChange}></slot>
            </div>
        `;
    }

    _hasSlot(name) {
        return this.querySelector(`[slot="${name}"]`) !== null;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-side-nav') || customElements.define('cgo-side-nav', CgoSideNav);
}
