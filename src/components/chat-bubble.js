import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import { glassRefractionStyles, tierBRimWeakRules } from '../styles/glass-shared.js';

/**
 * <cgo-chat-bubble role="user|bot" sender="管理员" time="19:16">消息内容</cgo-chat-bubble>
 * 对话气泡。遵循次世代 Liquid Glass Tier B 不可交互底板规范。
 */
export class CgoChatBubble extends LitElement {
    static properties = {
        role: { type: String, reflect: true },
        sender: { type: String },
        time: { type: String },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
    };

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            margin: 8px 0;
            align-items: flex-start;
            box-sizing: border-box;
        }

        :host([role='user']) {
            align-items: flex-end;
        }

        .bubble {
            position: relative;
            max-width: 80%;
            padding: 10px 15px;
            font-size: var(--text-base, 14px);
            line-height: 1.5;
            font-family: var(--font-sans, system-ui, sans-serif);
            word-break: break-word;
            background: transparent;
            border: none;
            box-shadow: var(--cgo-shadow-dropdown, var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)));
            overflow: hidden;
            isolation: isolate;
            box-sizing: border-box;
            transition: box-shadow 0.25s ease;
        }

        .bot {
            border-radius: 16px 16px 16px 4px;
            color: var(--text-main, #00263b);
            transform-origin: bottom left;
            animation: bubbleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .user {
            border-radius: 16px 16px 4px 16px;
            color: #ffffff;
            box-shadow: 0 6px 20px rgba(0, 96, 152, 0.16), 0 2px 6px rgba(0, 0, 0, 0.04);
            transform-origin: bottom right;
            animation: bubbleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes bubbleIn {
            from {
                opacity: 0;
                transform: translateY(6px) scale(0.97);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .bot,
            .user {
                animation: none !important;
            }
        }

        ${glassRefractionStyles}

        .bubble::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        .bot::after {
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.9));
        }

        .user::after {
            background: var(--primary-color, #006098);
            opacity: 0.9;
        }

        .bubble::before {
            ${tierBRimWeakRules}
        }

        .bubble-content {
            position: relative;
            z-index: 3;
        }

        .meta {
            font-size: var(--text-xs, 11px);
            color: var(--text-light, #888888);
            margin-top: 4px;
            padding: 0 4px;
        }

        :host([glass-mode='flat']) .bubble,
        :host([glass-mode='none']) .bubble {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .bot,
        :host([glass-mode='none']) .bot {
            background: var(--btn-info-bg, #e9ecef);
            border: 1px solid var(--border-color, #dee2e6);
        }
        :host([glass-mode='flat']) .user,
        :host([glass-mode='none']) .user {
            background: var(--primary-color, #006098);
        }
        :host([glass-mode='flat']) .bubble::before,
        :host([glass-mode='flat']) .bubble::after,
        :host([glass-mode='none']) .bubble::before,
        :host([glass-mode='none']) .bubble::after {
            display: none;
        }
    `;

    constructor() {
        super();
        this.role = 'bot';
        this.sender = '';
        this.time = '';
        this.glassMode = '';
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    render() {
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        const meta =
            this.sender || this.time
                ? html`<div class="meta">${[this.sender, this.time].filter(Boolean).join(' · ')}</div>`
                : null;
        return html`
            <div class="bubble ${this.role === 'user' ? 'user' : 'bot'}">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="bubble-content">
                    <slot></slot>
                </div>
            </div>
            ${meta}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-chat-bubble') || customElements.define('cgo-chat-bubble', CgoChatBubble);
}
