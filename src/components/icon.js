import { LitElement, html, css } from 'lit';
import { ICONS, buildSvg } from '../icons/public-icons.js';

/**
 * <cgo-icon name="back" size="20"></cgo-icon>
 * Self-contained SVG icon component backed by the public CGoUI icon registry.
 */
export class CgoIcon extends LitElement {
    static properties = {
        name: { type: String },
        size: { type: String },
        color: { type: String },
        colorMode: { type: String, attribute: 'color-mode' },
    };

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            line-height: 1;
            vertical-align: middle;
            color: inherit;
        }
        svg {
            display: block;
            width: var(--cgo-icon-size, 20px);
            height: var(--cgo-icon-size, 20px);
        }
    `;

    constructor() {
        super();
        this.name = '';
        this.size = '';
        this.color = '';
        this.colorMode = '';
    }

    updated(changedProperties) {
        if (changedProperties.has('size')) {
            const s = this.size ? (isNaN(this.size) ? this.size : `${this.size}px`) : '';
            if (s) {
                this.style.setProperty('--cgo-icon-size', s);
                this.style.width = s;
                this.style.height = s;
            } else {
                this.style.removeProperty('--cgo-icon-size');
                this.style.width = '';
                this.style.height = '';
            }
        }
    }

    render() {
        const entry = ICONS[this.name];
        if (!entry) return html``;
        const svgStr = buildSvg(this.name, {
            size: this.size || undefined,
            color: this.color || undefined,
            colorMode: this.colorMode || undefined,
        });
        if (!svgStr) return html``;
        const tpl = document.createElement('template');
        tpl.innerHTML = svgStr;
        return html`${tpl.content.cloneNode(true)}`;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-icon') || customElements.define('cgo-icon', CgoIcon);
}
