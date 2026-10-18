import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';

/**
 * <cgo-chat-bubble role="user|bot" sender="管理员" time="19:16">消息内容</cgo-chat-bubble>
 * 对话气泡。遵循次世代 Liquid Glass Tier B 不可交互底板规范。
 * role=user 右侧主色半透明玻璃，role=bot 左侧高透白/黑灰面板玻璃。
 * 可选 sender / time 显示在气泡下方的 meta 行。
 */
export class CgoChatBubble extends LitElement {
    static properties = {
        role: { type: String },
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

        /* 遵循 Tier B 不可交互底板规范 (0.82 衬底，柔和微光圈，专属不对称气泡圆角) */
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
            box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04));
            overflow: hidden;
            isolation: isolate;
            box-sizing: border-box;
            transition: box-shadow 0.25s ease;
        }

        :host-context([data-theme='dark']) .bubble {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* 不对称圆角语义 */
        .bot {
            border-radius: 16px 16px 16px 4px;
            color: var(--text-main, #00263b);
        }
        :host-context([data-theme='dark']) .bot {
            color: var(--text-main, #e6edf3);
        }

        .user {
            border-radius: 16px 16px 4px 16px;
            color: #ffffff;
            box-shadow: 0 6px 20px rgba(0, 96, 152, 0.16), 0 2px 6px rgba(0, 0, 0, 0.04);
        }
        :host-context([data-theme='dark']) .user {
            color: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 112, 176, 0.2);
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
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82));
        }
        :host-context([data-theme='dark']) .bot::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82));
        }

        .user::after {
            background: color-mix(in srgb, var(--primary-color, #006098) 82%, transparent);
            background: var(--primary-color, #006098);
            opacity: 0.85;
        }
        :host-context([data-theme='dark']) .user::after {
            background: color-mix(in srgb, var(--primary-color, #0070b0) 82%, transparent);
            background: var(--primary-color, #0070b0);
            opacity: 0.85;
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与不对称圆角自然贴合) */
        .bubble::before {
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

        :host-context([data-theme='dark']) .bubble::before {
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 1px,
                rgba(255, 255, 255, 0) 8px);
        }

        /* Layer 3: 气泡内容层 */
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
        :host-context([data-theme='dark']) .meta {
            color: var(--text-light, #9ca3af);
        }

        /* 传统扁平降级 */
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
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    render() {
        const meta =
            this.sender || this.time
                ? html`
                      <div class="meta">${[this.sender, this.time].filter(Boolean).join(' · ')}</div>
                  `
                : null;
        return html`
            <div class="bubble ${this.role === 'user' ? 'user' : 'bot'}">
                <div class="glass-refraction" aria-hidden="true"></div>
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
