import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';

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
    };

    static styles = css`
        :host {
            display: inline-flex;
            vertical-align: middle;
        }

        /* 遵循 Tier B 不可交互底板规范 (0.82 衬底，柔和微光圈，50% 纯圆轮廓) */
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
            box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04));
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

        :host-context([data-theme='dark']) .av {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
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
        .av::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--cgo-avatar-bg, var(--glass-bg-panel, rgba(255, 255, 255, 0.82)));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        :host-context([data-theme='dark']) .av:not(.has-color):not(.has-src)::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82));
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，在 50% 圆形上呈现精致穹顶高光) */
        .av::before {
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
            opacity: 0.85;
        }

        :host-context([data-theme='dark']) .av::before {
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 1px,
                rgba(255, 255, 255, 0) 8px);
        }

        /* Layer 3: 头像内容区 (首字母文本或图片) */
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

        /* 传统扁平降级 */
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
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
    }

    _initials() {
        if (!this.name) return '';
        const n = this.name.trim();
        // 中文取末字，英文取首字母
        if (/[一-龥]/.test(n)) return n.slice(-1);
        return n
            .split(/\s+/)
            .map((s) => s[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    render() {
        const sizeStr = /^\d+$/.test(this.size) ? this.size + 'px' : this.size;
        const rawColor = this.color || 'var(--primary-color, #006098)';
        // 0.82 高不透明度衬底与折射融合
        const glassBg = `color-mix(in srgb, ${rawColor} 82%, transparent)`;
        
        let styles = `--cgo-avatar-size:${sizeStr};`;
        if (this.src) {
            styles += `--cgo-avatar-bg:var(--glass-bg-panel, rgba(255, 255, 255, 0.82));`;
        } else {
            styles += `--cgo-avatar-bg:${glassBg};--cgo-avatar-flat-bg:${rawColor};`;
        }

        const classes = [
            'av',
            this.color ? 'has-color' : '',
            this.src ? 'has-src' : ''
        ].filter(Boolean).join(' ');

        return html`
            <div class="${classes}" style="${styles}">
                <div class="glass-refraction" aria-hidden="true"></div>
                <div class="av-content">
                    ${this.src
                        ? html`<img src=${this.src} alt=${this.name || 'avatar'} />`
                        : html`<span>${this._initials()}</span>`}
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-avatar') || customElements.define('cgo-avatar', CgoAvatar);
}
