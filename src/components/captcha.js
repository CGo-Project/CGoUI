import { LitElement, html, css } from 'lit';

/**
 * generateCaptcha() — 纯前端生成 SVG 计算题验证码。
 * 与 CGO.generateCaptcha 行为一致。
 * @returns {{svg:string, answer:string}}
 */
export function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const op = ['+', '-'][Math.floor(Math.random() * 2)];
    let text = '',
        answer = 0;
    if (op === '+') {
        text = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
    } else {
        const max = Math.max(num1, num2),
            min = Math.min(num1, num2);
        text = `${max} - ${min} = ?`;
        answer = max - min;
    }

    const width = 120,
        height = 36;
    let lines = '';
    for (let i = 0; i < 3; i++) {
        const x1 = Math.floor(Math.random() * width),
            y1 = Math.floor(Math.random() * height);
        const x2 = Math.floor(Math.random() * width),
            y2 = Math.floor(Math.random() * height);
        const c = `rgb(${Math.floor(Math.random() * 120) + 50},${Math.floor(Math.random() * 120) + 50},${Math.floor(Math.random() * 120) + 50})`;
        lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.5" />`;
    }
    let dots = '';
    for (let i = 0; i < 30; i++) {
        const cx = Math.floor(Math.random() * width),
            cy = Math.floor(Math.random() * height);
        const r = Math.random() * 1.2 + 0.4;
        const c = `rgb(${Math.floor(Math.random() * 150) + 50},${Math.floor(Math.random() * 150) + 50},${Math.floor(Math.random() * 150) + 50})`;
        dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" />`;
    }
    const chars = text.split(' ');
    let textElements = '',
        startX = 12;
    for (const char of chars) {
        const rot = Math.floor(Math.random() * 24) - 12;
        const dy = Math.floor(Math.random() * 8) - 4;
        const c = `rgb(${Math.floor(Math.random() * 120)},${Math.floor(Math.random() * 120)},${Math.floor(Math.random() * 120)})`;
        textElements += `<text x="${startX}" y="${25 + dy}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${c}" transform="rotate(${rot}, ${startX + 5}, ${22 + dy})">${char}</text>`;
        startX += char.length * 10 + 6;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="background:#f3f4f6;border-radius:4px;user-select:none;width:100%;height:100%;display:block;">${lines}${textElements}${dots}</svg>`;
    return { svg, answer: String(answer) };
}

/**
 * <cgo-captcha></cgo-captcha>
 * 渲染一个验证码图，提供 .answer 属性与 refresh() 方法；点击图自身刷新。
 */
export class CgoCaptcha extends LitElement {
    static properties = {
        answer: { type: String },
        zoom: { type: Boolean, reflect: true },
        zoomed: { type: Boolean, reflect: true },
        _svg: { state: true },
    };

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .zoom-btn {
            width: 38px;
            height: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-sm, 6px);
            background: var(--btn-info-bg, #e9ecef);
            color: var(--btn-info-text, #495057);
            cursor: pointer;
            flex-shrink: 0;
        }
        .zoom-btn:hover {
            background: var(--btn-info-hover, #dee2e6);
            color: var(--text-main, #00263b);
        }
        .zoom-btn svg {
            width: 19px;
            height: 19px;
        }
        .box {
            width: 120px;
            height: 36px;
            cursor: pointer;
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-xs, 4px);
            overflow: hidden;
            transform-origin: left center;
            transition:
                transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.2s ease;
        }
        :host([zoomed]) .box {
            transform: scale(1.65);
            box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12));
            z-index: 3;
        }
    `;

    constructor() {
        super();
        this.answer = '';
        this.zoom = false;
        this.zoomed = false;
        this._svg = '';
        this.refresh();
    }

    refresh() {
        const { svg, answer } = generateCaptcha();
        this.answer = answer;
        this._svg = svg;
        this.dispatchEvent(
            new CustomEvent('cgo-captcha-refresh', { detail: { answer }, bubbles: true, composed: true })
        );
    }

    render() {
        const tpl = document.createElement('template');
        tpl.innerHTML = this._svg;
        return html`
            ${this.zoom
                ? html`
                      <button
                          class="zoom-btn"
                          type="button"
                          title=${this.zoomed ? '收起验证码' : '放大验证码'}
                          @click=${(event) => {
                              event.stopPropagation();
                              this.zoomed = !this.zoomed;
                          }}
                      >
                          <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              aria-hidden="true"
                          >
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              ${this.zoomed
                                  ? html`
                                        <line x1="8" y1="11" x2="14" y2="11"></line>
                                    `
                                  : html`
                                        <line x1="11" y1="8" x2="11" y2="14"></line>
                                        <line x1="8" y1="11" x2="14" y2="11"></line>
                                    `}
                          </svg>
                      </button>
                  `
                : null}
            <div class="box" title="点击刷新" @click=${() => this.refresh()}>${tpl.content.cloneNode(true)}</div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-captcha') || customElements.define('cgo-captcha', CgoCaptcha);
}
