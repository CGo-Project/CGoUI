import { LitElement, html, css } from 'lit';

/**
 * <cgo-tooltip text="说明文字"><button>悬停我</button></cgo-tooltip>
 * 悬停在被包裹内容上时，于上方显示气泡。移植自 cgo_element.css §12 的 [data-tooltip]。
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
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            padding: 5px 10px;
            border-radius: var(--radius-xs, 4px);
            background: rgba(0, 0, 0, 0.82);
            color: #fff;
            font-size: var(--text-sm, 12px);
            font-family: var(--font-sans, system-ui, sans-serif);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--transition-base, 0.2s ease);
            z-index: 200;
        }
        .bubble.bottom {
            bottom: auto;
            top: calc(100% + 8px);
        }
        :host(:hover) .bubble {
            opacity: 1;
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
                      <span class="bubble ${this.placement === 'bottom' ? 'bottom' : ''}">${this.text}</span>
                  `
                : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-tooltip') || customElements.define('cgo-tooltip', CgoTooltip);
}
