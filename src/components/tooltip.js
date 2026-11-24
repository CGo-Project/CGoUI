import { LitElement, html, css } from 'lit';

/**
 * <cgo-tooltip text="说明文字"><button>悬停我</button></cgo-tooltip>
 * 悬停或键盘聚焦在被包裹内容上时，于上方/下方显示轻量气泡。
 */
export class CgoTooltip extends LitElement {
    static properties = {
        text: { type: String },
        placement: { type: String },
    };

    static styles = css`
        :host {
            position: relative;
            display: inline-flex;
        }

        .bubble {
            position: absolute;
            bottom: calc(100% + 7px);
            left: 50%;
            transform: translate(-50%, 3px);
            padding: 5px 9px;
            border-radius: var(--radius-sm, 6px);
            background: var(--cgo-tooltip-bg, rgba(18, 20, 24, 0.94));
            color: var(--cgo-tooltip-color, #ffffff);
            border: 1px solid var(--cgo-tooltip-border, transparent);
            backdrop-filter: var(--glass-backdrop-blur, blur(8px));
            -webkit-backdrop-filter: var(--glass-backdrop-blur, blur(8px));
            font-size: var(--text-xs, 12px);
            font-weight: 500;
            line-height: 1.4;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            letter-spacing: 0.01em;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            box-shadow: var(--cgo-shadow-dropdown, 0 3px 10px rgba(0, 0, 0, 0.16), 0 1px 2px rgba(0, 0, 0, 0.08));
            transition:
                opacity 140ms ease,
                transform 140ms cubic-bezier(0.16, 1, 0.3, 1),
                visibility 140ms;
            z-index: 200;
            box-sizing: border-box;
        }

        .bubble.bottom {
            bottom: auto;
            top: calc(100% + 7px);
            transform: translate(-50%, -3px);
        }

        @media (hover: hover) and (pointer: fine) {
            :host(:hover) .bubble {
                opacity: 1;
                visibility: visible;
                transform: translate(-50%, 0);
                transition-delay: 200ms;
            }
        }

        :host(:focus-within) .bubble {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, 0);
        }

        @media (prefers-reduced-motion: reduce) {
            .bubble {
                transition: opacity 100ms ease, visibility 100ms !important;
                transform: translate(-50%, 0) !important;
            }
        }
    `;

    constructor() {
        super();
        this.text = '';
        this.placement = 'top';
    }

    render() {
        return html`
            <slot></slot>
            ${this.text
                ? html`
                      <span class="bubble ${this.placement === 'bottom' ? 'bottom' : ''}" role="tooltip">
                          ${this.text}
                      </span>
                  `
                : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tooltip') || customElements.define('cgo-tooltip', CgoTooltip);
}
