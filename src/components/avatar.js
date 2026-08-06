import { LitElement, html, css } from 'lit';

/**
 * <cgo-avatar name="张三" color="#006098" size="60"></cgo-avatar>
 * <cgo-avatar src="/u.png" size="96"></cgo-avatar>
 * 圆形头像，支持图片或首字母占位。参考 cgo_element.css §16 头像预览。
 */
export class CgoAvatar extends LitElement {
    static properties = {
        name: { type: String },
        src: { type: String },
        color: { type: String },
        size: { type: String },
    };

    static styles = css`
        :host {
            display: inline-flex;
        }
        .av {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            overflow: hidden;
            background: var(--card-bg, #fff);
            box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
            color: #fff;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-weight: 700;
            width: var(--cgo-avatar-size, 60px);
            height: var(--cgo-avatar-size, 60px);
            font-size: calc(var(--cgo-avatar-size, 60px) * 0.4);
        }
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    `;

    constructor() {
        super();
        this.name = '';
        this.src = '';
        this.color = '';
        this.size = '60';
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
        const bg = this.color || 'var(--primary-color, #006098)';
        const style = `--cgo-avatar-size:${sizeStr};${this.src ? '' : `background:${bg}`}`;
        return html`
            <div class="av" style=${style}>
                ${this.src
                    ? html`
                          <img src=${this.src} alt=${this.name || 'avatar'} />
                      `
                    : html`
                          <span>${this._initials()}</span>
                      `}
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-avatar') || customElements.define('cgo-avatar', CgoAvatar);
}
