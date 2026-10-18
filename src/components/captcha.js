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
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            padding: 0;
            border: none;
            border-radius: var(--radius-sm, 6px);
            background-color: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #00263b);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            cursor: pointer;
            flex-shrink: 0;
            user-select: none;
            overflow: hidden;
            isolation: isolate;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1),
                opacity var(--dur-fast, 140ms) ease;
        }

        /* 1px 双轴微光描边 (Layer 2 Masked 1px Hairline Rim Light, 与 cgo-button 一致，作为唯一精致描边) */
        .zoom-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background:
                linear-gradient(to right,
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 0,
                    rgba(0, 0, 0, 0) var(--lg-rim-side, 3px),
                    rgba(0, 0, 0, 0) calc(100% - var(--lg-rim-side, 3px)),
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 100%),
                linear-gradient(to bottom,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) 0,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) var(--lg-rim-hold, 1px),
                    rgba(255, 255, 255, 0) 8px,
                    rgba(0, 0, 0, 0.02) calc(100% - 4px),
                    rgba(0, 0, 0, 0.12) 100%);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
            opacity: 0.64;
            transition: opacity var(--dur-fast, 140ms) ease;
        }

        .zoom-btn:hover {
            background-color: var(--btn-info-hover, #e9ecef);
            color: var(--text-main, #00263b);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .zoom-btn:hover::before {
            opacity: 0.75;
        }

        .zoom-btn:active {
            transform: scale(0.98);
            background-color: #dee2e6;
        }

        .zoom-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px var(--bg-color, #ffffff), 0 0 0 4px var(--primary-color, #006098);
        }

        :host([zoomed]) .zoom-btn {
            background-color: var(--btn-info-hover, #e9ecef);
            color: var(--primary-color, #006098);
        }

        /* 暗色模式适配 */
        :host-context([data-theme='dark']) .zoom-btn {
            background-color: var(--btn-info-bg, #262729);
            color: var(--text-main, #e5e8ea);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }

        :host-context([data-theme='dark']) .zoom-btn::before {
            background:
                linear-gradient(to bottom,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 0,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 1px,
                    rgba(255, 255, 255, 0) 8px,
                    rgba(255, 255, 255, 0) calc(100% - 4px),
                    rgba(255, 255, 255, 0.08) 100%);
        }

        :host-context([data-theme='dark']) .zoom-btn:hover {
            background-color: var(--btn-info-hover, #323438);
            color: #ffffff;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
        }

        :host-context([data-theme='dark']) .zoom-btn:active {
            background-color: #383a3c;
        }

        :host-context([data-theme='dark']) .zoom-btn:focus-visible {
            box-shadow: 0 0 0 2px var(--bg-color, #1a1a1a), 0 0 0 4px var(--primary-hover, #0070b0);
        }

        :host-context([data-theme='dark']):host([zoomed]) .zoom-btn {
            background-color: var(--btn-info-hover, #323438);
            color: var(--primary-color, #4dabf7);
        }

        .zoom-btn svg {
            position: relative;
            z-index: 3;
            width: 18px;
            height: 18px;
            display: block;
            color: inherit;
        }

        .box {
            width: 120px;
            height: 36px;
            box-sizing: border-box;
            cursor: pointer;
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-sm, 6px);
            overflow: hidden;
            transform-origin: left center;
            transition:
                transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.2s ease,
                border-color 0.2s ease;
        }

        .box:hover {
            border-color: var(--border-hover, #ced4da);
        }

        :host-context([data-theme='dark']) .box {
            border-color: var(--border-color, #383a3c);
        }

        :host-context([data-theme='dark']) .box:hover {
            border-color: var(--border-hover, #44474b);
        }

        :host([zoomed]) .box {
            transform: scale(1.65);
            box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12));
            z-index: 3;
        }

        :host-context([data-theme='dark']):host([zoomed]) .box {
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
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
