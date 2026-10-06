import { LitElement, html, css, nothing } from 'lit';

/**
 * <cgo-input label="邮箱" name="email" type="email" autocomplete="email" required></cgo-input>
 * 属性: label, value, placeholder, type, hint, state(success|danger|info), disabled,
 *       name, required, autocomplete, accessible-label（没有可见 label 时的可访问名称）
 * 事件: cgo-input（detail.value）。
 * 设置 name 后值会随外层 <form> 提交（浏览器不支持 ElementInternals 时不参与提交）。
 */
export class CgoInput extends LitElement {
    static formAssociated = true;

    static properties = {
        label: { type: String },
        value: { type: String },
        placeholder: { type: String },
        type: { type: String },
        hint: { type: String },
        state: { type: String },
        disabled: { type: Boolean, reflect: true },
        // 表单提交按宿主的 name 属性取名，所以需要反射；空值时不写出 name=""
        name: {
            reflect: true,
            converter: { fromAttribute: (v) => v || '', toAttribute: (v) => v || null },
        },
        required: { type: Boolean, reflect: true },
        autocomplete: { type: String },
        accessibleLabel: { type: String, attribute: 'accessible-label' },
        _formDisabled: { state: true },
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
            border: 1px solid var(--input-border, var(--border-color, #dee2e6));
            border-radius: var(--radius-sm, 6px);
            background: var(--card-bg, #fff);
            color: var(--text-main, #00263b);
            font: inherit;
            font-size: 14px;
            box-sizing: border-box;
            transition:
                border-color var(--transition-base, 0.2s ease),
                box-shadow var(--transition-base, 0.2s ease);
        }
        input::placeholder {
            color: transparent;
        }
        input:focus::placeholder {
            color: var(--text-light, #636f75);
            opacity: 1;
        }
        input:focus {
            outline: none;
            border-color: var(--primary-color, #00263b);
            box-shadow: 0 0 0 3px rgba(0, 29, 49, 0.12);
        }
        input:focus-visible {
            outline: 2px solid var(--focus-ring, #00263b);
            outline-offset: 1px;
        }
        input:disabled {
            background: var(--btn-info-bg, #e9ecef);
            color: var(--text-light, #636f75);
            cursor: not-allowed;
        }
        .hint {
            margin-top: 5px;
            color: var(--text-light, #636f75);
            font-size: var(--text-sm, 12px);
            line-height: 1.45;
        }
        .hint.success {
            color: var(--success-text, var(--success-color, #34a853));
        }
        .hint.danger {
            color: var(--danger-text, var(--danger-color, #ea4335));
        }
        .hint.info {
            color: var(--info-text, var(--info-color, #006098));
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
        this.name = '';
        this.required = false;
        this.autocomplete = '';
        this.accessibleLabel = '';
        this._formDisabled = false;
        // 表单关联：旧浏览器没有 attachInternals / setFormValue 时降级为不关联
        this._internals = null;
        try {
            if (typeof this.attachInternals === 'function') {
                const internals = this.attachInternals();
                if (typeof internals.setFormValue === 'function') this._internals = internals;
            }
        } catch (_) {
            this._internals = null;
        }
        // 外部 <label for> 命中宿主时把焦点交给内部输入框
        this.addEventListener('click', (e) => {
            if (e.composedPath()[0] === this) this.focus();
        });
    }

    get _input() {
        return this.renderRoot ? this.renderRoot.querySelector('input') : null;
    }

    get form() {
        return this._internals ? this._internals.form : null;
    }

    focus(options) {
        const input = this._input;
        if (input) input.focus(options);
    }

    blur() {
        const input = this._input;
        if (input) input.blur();
    }

    formDisabledCallback(disabled) {
        this._formDisabled = disabled;
    }

    formResetCallback() {
        this.value = this.getAttribute('value') || '';
    }

    formStateRestoreCallback(state) {
        if (typeof state === 'string') this.value = state;
    }

    updated(changed) {
        if (changed.has('value') || changed.has('required') || changed.has('type')) this._syncForm();
    }

    _syncForm() {
        const internals = this._internals;
        if (!internals) return;
        const value = this.value == null ? '' : String(this.value);
        try {
            internals.setFormValue(value);
            const input = this._input;
            // 只镜像「必填未填」，不改变既有表单里其它类型校验的行为
            if (this.required && input && input.validity.valueMissing && typeof internals.setValidity === 'function') {
                internals.setValidity({ valueMissing: true }, input.validationMessage || '请填写此字段', input);
            } else if (typeof internals.setValidity === 'function') {
                internals.setValidity({});
            }
        } catch (_) {}
    }

    render() {
        const hasHint = !!this.hint;
        const ariaLabel = this.label ? '' : this.accessibleLabel || this.getAttribute('aria-label') || '';
        return html`
            ${this.label
                ? html`
                      <label for="input">${this.label}</label>
                  `
                : null}
            <input
                id="input"
                .value=${this.value}
                type=${this.type}
                placeholder=${this.placeholder}
                name=${this.name || nothing}
                autocomplete=${this.autocomplete || nothing}
                aria-label=${ariaLabel || nothing}
                aria-describedby=${hasHint ? 'hint' : nothing}
                aria-invalid=${this.state === 'danger' ? 'true' : nothing}
                ?required=${this.required}
                ?disabled=${this.disabled || this._formDisabled}
                @input=${(e) => {
                    this.value = e.target.value;
                    this.dispatchEvent(
                        new CustomEvent('cgo-input', { detail: { value: this.value }, bubbles: true, composed: true })
                    );
                }}
            />
            ${hasHint
                ? html`
                      <div class="hint ${this.state}" id="hint">${this.hint}</div>
                  `
                : null}
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-input') || customElements.define('cgo-input', CgoInput);
}
