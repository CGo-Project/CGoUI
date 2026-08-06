import { LitElement, html, css } from 'lit';

const LINE_TEXT = new Map([
    ['7', 'dark'],
    ['9', 'dark'],
    ['13', 'dark'],
    ['14', 'dark'],
    ['19', 'dark'],
    ['22', 'dark'],
    ['27', 'dark'],
    ['cae', 'dark'],
]);

export class CgoLineBadge extends LitElement {
    static properties = {
        line: { type: String },
    };

    static styles = css`
        :host {
            display: inline-flex;
            vertical-align: middle;
        }
        .chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            height: 24px;
            padding: 0 14px;
            border-radius: var(--radius-full, 9999px);
            background: var(--line-bg, var(--primary-color, #00263b));
            color: var(--line-fg, #fff);
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: 12px;
            font-weight: 700;
            line-height: 1;
            white-space: nowrap;
            box-sizing: border-box;
        }
    `;

    constructor() {
        super();
        this.line = '1';
    }

    _token() {
        const key = String(this.line || '').toLowerCase();
        const map = {
            亦庄: '24',
            亦庄线: '24',
            亦庄t1: 't1',
            t1: 't1',
            房山: '25',
            房山线: '25',
            燕房: '25w',
            燕房线: '25w',
            昌平: '27',
            昌平线: '27',
            西郊: 'xj',
            西郊线: 'xj',
            首都机场: 'cae',
            大兴机场: 'dae',
            s1: 'sub-s1',
            s2: 'sub-s2',
            s5: 'sub-s5',
            s6: 'sub-s6',
        };
        return map[key] || key;
    }

    render() {
        const token = this._token();
        const fg = LINE_TEXT.has(token) ? 'var(--line-color-text-dark, #00263b)' : 'var(--line-color-text-light, #fff)';
        const style = `--line-bg:var(--line-color-${token});--line-fg:${fg}`;
        return html`
            <span class="chip" style=${style}><slot>${this.line}号线</slot></span>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-line-badge') || customElements.define('cgo-line-badge', CgoLineBadge);
}
