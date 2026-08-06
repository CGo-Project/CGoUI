import { LitElement, html, css } from 'lit';

export class CgoMediaViewer extends LitElement {
    static properties = {
        label: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        .viewer {
            overflow: hidden;
            border-radius: var(--radius-lg, 12px);
            border: 1px solid var(--border-color, #dee2e6);
            background: var(--card-bg, #fff);
            box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.06));
        }
        .display {
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background-image: radial-gradient(var(--border-color, #dee2e6) 1px, transparent 1px);
            background-size: 16px 16px;
            color: var(--text-light, #666);
            font-size: 13px;
            text-align: center;
        }
        .actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px;
            border-top: 1px solid var(--border-color, #dee2e6);
            background: var(--card-bg, #fff);
        }
    `;

    constructor() {
        super();
        this.label = '图片/媒体预览区域 (自适应背景网格点)';
    }

    render() {
        return html`
            <div class="viewer">
                <div class="display"><slot>${this.label}</slot></div>
                <div class="actions"><slot name="actions"></slot></div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-media-viewer') || customElements.define('cgo-media-viewer', CgoMediaViewer);
}
