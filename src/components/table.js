import { LitElement, html, css } from 'lit';

export class CgoTable extends LitElement {
    static styles = css`
        :host {
            display: block;
            overflow-x: auto;
            border-radius: var(--radius-md, 8px);
            border: 1px solid var(--border-color, #dee2e6);
        }
        ::slotted(table) {
            width: 100%;
            border-collapse: collapse;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: 13px;
            color: var(--text-main, #00263b);
        }
        ::slotted(table th) {
            text-align: left;
            padding: 10px 12px;
            background: var(--table-head-bg, #f1f3f5);
            color: var(--table-head-text, #00263b);
            font-weight: 600;
        }
        ::slotted(table td) {
            padding: 10px 12px;
            border-top: 1px solid var(--table-cell-border, #eee);
        }
    `;

    render() {
        return html`
            <slot></slot>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-table') || customElements.define('cgo-table', CgoTable);
}
