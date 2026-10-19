import { LitElement, html, css } from 'lit';

/**
 * <cgo-tooltip text="说明文字"><button>悬停我</button></cgo-tooltip>
 * 悬停在被包裹内容上时，于上方/下方显示轻量气泡。
 * 遵循极简干净清爽规范：单层纯净边缘、柔和微阴影、无杂乱玻璃重影。
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
            background: rgba(18, 20, 24, 0.94);
            color: #ffffff;
            font-size: var(--text-xs, 12px);
            font-weight: 500;
            line-height: 1.4;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            letter-spacing: 0.01em;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            border: none;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16), 0 1px 2px rgba(0, 0, 0, 0.08);
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

        @media (prefers-reduced-motion: reduce) {
            .bubble {
                transition: opacity 100ms ease, visibility 100ms !important;
                transform: translate(-50%, 0) !important;
            }
        }

        /* 暗色模式下：略微提亮背景并赋予极细单层柔和边缘，避免与深色底色完全混融，绝无双层套圈 */
        :host-context([data-theme='dark']) .bubble {
            background: rgba(38, 40, 45, 0.96);
            color: #f3f4f6;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
        }

        /* 在 glass 容器模式下保持极简干净，仅保留极轻微的背景微透与自然单层描边，绝无复杂玻璃套框 */
        :host-context([glass-mode='liquid']) .bubble,
        :host-context([glass-mode='blur']) .bubble,
        :host-context([data-glass-mode='liquid']) .bubble,
        :host-context([data-glass-mode='blur']) .bubble {
            background: rgba(18, 20, 24, 0.92);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: none;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
        }

        :host-context([data-theme='dark']):host-context([glass-mode='liquid']) .bubble,
        :host-context([data-theme='dark']):host-context([glass-mode='blur']) .bubble,
        :host-context([data-theme='dark']):host-context([data-glass-mode='liquid']) .bubble,
        :host-context([data-theme='dark']):host-context([data-glass-mode='blur']) .bubble {
            background: rgba(38, 40, 45, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
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
