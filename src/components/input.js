import { LitElement, html, css } from 'lit';

export class CgoInput extends LitElement {
    static properties = {
        label: { type: String },
        value: { type: String },
        placeholder: { type: String },
        type: { type: String },
        hint: { type: String },
        state: { type: String },
        disabled: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--font-sans, system-ui, sans-serif);
        }
        label {
            display: block;
            margin-bottom: 6px;
            color: var(--text-main, #00263b);
            font-size: var(--text-sm, 12px);
            font-weight: 600;
        }
        input {
            width: 100%;
            height: 38px;
            padding: 8px 12px;
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--radius-md, 8px);
            background: var(--card-bg, #fff);
            color: var(--text-main, #00263b);
            font: inherit;
            font-size: 14px;
            box-sizing: border-box;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
            transition:
                border-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease;
        }
        input::placeholder {
            color: transparent;
        }
        input:focus::placeholder {
            color: var(--text-light, #636f75);
            opacity: 0.65;
        }
        input:focus {
            outline: none;
            border-color: var(--primary-color, #006098);
            box-shadow:
                0 0 0 3.5px rgba(0, 96, 152, 0.14),
                0 1px 2px rgba(0, 96, 152, 0.08);
        }
        :host-context([data-theme='dark']) input {
            background: var(--card-bg, #1e2023);
            border-color: var(--border-color, rgba(255, 255, 255, 0.14));
            color: var(--text-main, #e5e8ea);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        :host-context([data-theme='dark']) input:focus {
            border-color: var(--primary-color, #4dabf7);
            box-shadow:
                0 0 0 3.5px rgba(77, 171, 247, 0.22),
                0 1px 3px rgba(0, 0, 0, 0.35);
        }
        :host([state='success']) input {
            border-color: var(--success-color, #34a853);
        }
        :host([state='success']) input:focus {
            border-color: var(--success-color, #34a853);
            box-shadow:
                0 0 0 3.5px rgba(52, 168, 83, 0.18),
                0 1px 2px rgba(52, 168, 83, 0.08);
        }
        :host([state='danger']) input {
            border-color: var(--danger-color, #ea4335);
        }
        :host([state='danger']) input:focus {
            border-color: var(--danger-color, #ea4335);
            box-shadow:
                0 0 0 3.5px rgba(234, 67, 53, 0.18),
                0 1px 2px rgba(234, 67, 53, 0.08);
        }
        input:disabled {
            background: var(--btn-info-bg, #e9ecef);
            color: var(--text-light, #636f75);
            cursor: not-allowed;
            box-shadow: none;
        }
        .hint {
            margin-top: 5px;
            color: var(--text-light, #636f75);
            font-size: var(--text-sm, 12px);
            line-height: 1.45;
        }
        .hint.success {
            color: var(--success-color, #34a853);
        }
        .hint.danger {
            color: var(--danger-color, #ea4335);
        }
        .hint.info {
            color: var(--info-color, #006098);
            background: var(--info-bg, #e8f0fe);
            border: 1px solid var(--info-border, #b8d0ee);
            border-radius: var(--radius-xs, 4px);
            padding: 7px 10px;
        }
    `;

    constructor() {
        super();
        this.label = '';
        this.value = '';
        this.placeholder = '';
        this.type = 'text';
        this.hint = '';
        this.state = '';
        this.disabled = false;
    }

    render() {
        return html`
            ${this.label
                ? html`
                      <label>${this.label}</label>
                  `
                : null}
            <input
                .value=${this.value}
                type=${this.type}
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                @input=${(e) => {
                    this.value = e.target.value;
                    this.dispatchEvent(
                        new CustomEvent('cgo-input', { detail: { value: this.value }, bubbles: true, composed: true })
                    );
                }}
            />
            ${this.hint
                ? html`
                      <div class="hint ${this.state}">${this.hint}</div>
                  `
                : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-input') || customElements.define('cgo-input', CgoInput);
}
