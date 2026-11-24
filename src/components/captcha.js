import { LitElement, html, css } from 'lit';
import { hairlineRimLightRules } from '../styles/glass-shared.js';

function _randFloat() {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        return buf[0] / 4294967296;
    }
    return Math.random();
}

function _randInt(max) {
    return Math.floor(_randFloat() * max);
}

/**
 * generateCaptcha() — 纯前端生成 SVG 计算题验证码（仅用于界面交互提示，非服务端安全校验）。
 * @returns {{svg:string, answer:string}}
 */
export function generateCaptcha() {
    const num1 = _randInt(10) + 1;
    const num2 = _randInt(10) + 1;
    const op = ['+', '-'][_randInt(2)];
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
        const x1 = _randInt(width),
            y1 = _randInt(height);
        const x2 = _randInt(width),
            y2 = _randInt(height);
        const c = `rgb(${_randInt(120) + 50},${_randInt(120) + 50},${_randInt(120) + 50})`;
        lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.5" />`;
    }
    let dots = '';
    for (let i = 0; i < 30; i++) {
        const cx = _randInt(width),
            cy = _randInt(height);
        const r = _randFloat() * 1.2 + 0.4;
        const c = `rgb(${_randInt(150) + 50},${_randInt(150) + 50},${_randInt(150) + 50})`;
        dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" />`;
    }
    const chars = text.split(' ');
    let textElements = '',
        startX = 12;
    for (const char of chars) {
        const rot = _randInt(24) - 12;
        const dy = _randInt(8) - 4;
        const c = `rgb(${_randInt(120)},${_randInt(120)},${_randInt(120)})`;
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
            box-shadow: var(--cgo-shadow-control, 0 1px 2px rgba(0, 0, 0, 0.04));
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
            ${hairlineRimLightRules}
        }

        @media (hover: hover) and (pointer: fine) {
            .zoom-btn:hover {
                background-color: var(--btn-info-hover, #e9ecef);
                color: var(--text-main, #00263b);
                box-shadow: var(--cgo-shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.06));
            }

            .zoom-btn:hover::before {
                opacity: 0.75;
            }
        }

        .zoom-btn:active {
            transform: scale(0.96);
            background-color: var(--cgo-btn-info-active, #dee2e6);
        }

        .zoom-btn:focus-visible,
        .box:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px var(--bg-color, #ffffff), 0 0 0 4px var(--primary-color, #006098);
        }

        :host([zoomed]) .zoom-btn {
            background-color: var(--btn-info-hover, #e9ecef);
            color: var(--primary-color, #006098);
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
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            transition:
                transform 0.18s cubic-bezier(0.4, 0, 1, 1),
                box-shadow 0.18s ease,
                border-color 0.18s ease;
        }

        @media (hover: hover) and (pointer: fine) {
            .box:hover {
                border-color: var(--cgo-border-hover, #ced4da);
            }
        }

        :host([zoomed]) .box {
            transform: scale(1.65);
            box-shadow: var(--cgo-shadow-zoom, 0 8px 32px rgba(0, 0, 0, 0.12));
            z-index: 3;
            transition:
                transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.22s ease,
                border-color 0.22s ease;
        }

        @media (prefers-reduced-motion: reduce) {
            .box, .zoom-btn {
                transition: none !important;
            }
        }
    `;

    constructor() {
        super();
        this.answer = '';
        this.zoom = false;
        this.zoomed = false;
        this._svg = '';
    }

    connectedCallback() {
        super.connectedCallback();
        if (!this._svg) this.refresh();
    }

    verify(input) {
        return String(input ?? '').trim() === this.answer;
    }

    refresh() {
        const { svg, answer } = generateCaptcha();
        this.answer = answer;
        this._svg = svg;
        this.dispatchEvent(
            new CustomEvent('cgo-captcha-refresh', { detail: { answer }, bubbles: true, composed: true })
        );
    }

    _onBoxKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.refresh();
        }
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
                          aria-label=${this.zoomed ? '收起验证码' : '放大验证码'}
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
            <div
                class="box"
                role="button"
                tabindex="0"
                aria-label="刷新验证码"
                title="点击刷新"
                @click=${() => this.refresh()}
                @keydown=${this._onBoxKeyDown}
            >
                ${tpl.content.cloneNode(true)}
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-captcha') || customElements.define('cgo-captcha', CgoCaptcha);
}
