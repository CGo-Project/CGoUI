import { LitElement, html, css } from 'lit';

/**
 * <cgo-chat-bubble role="user|bot" sender="管理员" time="19:16">消息内容</cgo-chat-bubble>
 * 对话气泡。role=user 右侧主色，role=bot 左侧浅色。
 * 可选 sender / time 显示在气泡下方的 meta 行（对齐方向随 role）。
 */
export class CgoChatBubble extends LitElement {
    static properties = {
        role: { type: String },
        sender: { type: String },
        time: { type: String },
    };

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            margin: 6px 0;
            align-items: flex-start;
        }
        :host([role='user']) {
            align-items: flex-end;
        }
        .bubble {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 16px;
            font-size: var(--text-base, 14px);
            line-height: 1.5;
            font-family: var(--font-sans, system-ui, sans-serif);
            word-break: break-word;
        }
        .bot {
            background: var(--btn-info-bg, #e9ecef);
            color: var(--text-main, #00263b);
            border-radius: 16px 16px 16px 4px;
        }
        .user {
            background: var(--primary-color, #006098);
            color: var(--btn-text, #fff);
            border-radius: 16px 16px 4px 16px;
        }
        .meta {
            font-size: var(--text-xs, 11px);
            color: var(--text-light, #666);
            margin-top: 4px;
            padding: 0 4px;
        }
    `;

    constructor() {
        super();
        this.role = 'bot';
        this.sender = '';
        this.time = '';
    }

    render() {
        const meta =
            this.sender || this.time
                ? html`
                      <div class="meta">${[this.sender, this.time].filter(Boolean).join(' · ')}</div>
                  `
                : null;
        return html`
            <div class="bubble ${this.role === 'user' ? 'user' : 'bot'}"><slot></slot></div>
            ${meta}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-chat-bubble') || customElements.define('cgo-chat-bubble', CgoChatBubble);
}
