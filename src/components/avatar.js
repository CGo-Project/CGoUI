import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import { glassRefractionStyles, tierBRimWeakRules } from '../styles/glass-shared.js';

/**
 * <cgo-avatar name="张三" color="#006098" size="60"></cgo-avatar>
 * <cgo-avatar src="/u.png" size="96"></cgo-avatar>
 * 圆形头像，支持图片或首字母占位。遵循次世代 Liquid Glass Tier B 不可交互底板规范。
 */
export class CgoAvatar extends LitElement {
    static properties = {
        name: { type: String },
        src: { type: String },
        color: { type: String },
        size: { type: String },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
        _imgFailed: { state: true },
    };

    static styles = css`
        :host {
            display: inline-flex;
            vertical-align: middle;
        }

        .av {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            overflow: hidden;
            isolation: isolate;
            box-sizing: border-box;
            background: transparent;
            border: none;
            box-shadow: var(--cgo-shadow-dropdown, var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)));
            color: #ffffff;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-weight: 700;
            width: var(--cgo-avatar-size, 60px);
            height: var(--cgo-avatar-size, 60px);
            font-size: calc(var(--cgo-avatar-size, 60px) * 0.4);
            user-select: none;
            flex-shrink: 0;
            transition: box-shadow 0.25s ease;
        }

        ${glassRefractionStyles}

        .av::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--cgo-avatar-bg, var(--glass-bg-panel, rgba(255, 255, 255, 0.9)));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        .av::before {
            ${tierBRimWeakRules}
        }

        .av-content {
            position: relative;
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            border-radius: inherit;
            overflow: hidden;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        :host([glass-mode='flat']) .av,
        :host([glass-mode='none']) .av {
            background: var(--cgo-avatar-flat-bg, var(--card-bg, #fff));
            box-shadow: var(--shadow-sm, 0 2px 6px rgba(0, 0, 0, 0.08));
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .av::before,
        :host([glass-mode='flat']) .av::after,
        :host([glass-mode='none']) .av::before,
        :host([glass-mode='none']) .av::after {
            display: none;
        }
    `;

    constructor() {
        super();
        this.name = '';
        this.src = '';
        this.color = '';
        this.size = '60';
        this.glassMode = '';
        this._imgFailed = false;
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    updated(changedProperties) {
        if (changedProperties.has('src')) {
            this._imgFailed = false;
        }
        if (changedProperties.has('size') || changedProperties.has('color') || changedProperties.has('src')) {
            const rawSize = String(this.size || '').trim();
            if (rawSize) {
                const sizeStr = /^\d+(?:\.\d+)?$/.test(rawSize) ? `${rawSize}px` : rawSize;
                this.style.setProperty('--cgo-avatar-size', sizeStr);
            } else {
                this.style.removeProperty('--cgo-avatar-size');
            }
            const rawColor = String(this.color || '').trim() || 'var(--primary-color, #006098)';
            if (this.src && !this._imgFailed) {
                this.style.setProperty('--cgo-avatar-bg', 'var(--glass-bg-panel, rgba(255, 255, 255, 0.9))');
                this.style.removeProperty('--cgo-avatar-flat-bg');
            } else {
                this.style.setProperty('--cgo-avatar-bg', `color-mix(in srgb, ${rawColor} 90%, transparent)`);
                this.style.setProperty('--cgo-avatar-flat-bg', rawColor);
            }
        }
    }

    _initials() {
        if (!this.name) return '';
        const n = this.name.trim();
        if (!n) return '';
        if (/[\u4e00-\u9fa5]/.test(n)) return [...n].slice(-1)[0];
        return n
            .split(/\s+/)
            .map((s) => [...s][0] || '')
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    render() {
        const showImg = Boolean(this.src) && !this._imgFailed;
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        const classes = ['av', this.color ? 'has-color' : '', showImg ? 'has-src' : ''].filter(Boolean).join(' ');

        return html`
            <div class="${classes}">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="av-content">
                    ${showImg
                        ? html`<img src=${this.src} alt=${this.name || 'avatar'} @error=${() => (this._imgFailed = true)} />`
                        : html`<span>${this._initials()}</span>`}
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-avatar') || customElements.define('cgo-avatar', CgoAvatar);
}
