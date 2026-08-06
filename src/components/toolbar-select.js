import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/* 全局互斥：同一时刻只有一个 toolbar-select 展开 */
const _openInstances = new Set();

/**
 * <cgo-toolbar-select value="beijing" placeholder="请选择模板">
 *   <cgo-toolbar-option value="beijing">北京标准站牌</cgo-toolbar-option>
 *   <cgo-toolbar-option value="shanghai">上海标准站牌</cgo-toolbar-option>
 * </cgo-toolbar-select>
 *
 * 工具栏下拉选择器，用于左侧面板内的模板/配色/Logo 选择。
 * 参考 stasign 的 sf-custom-select，移植为 WebComponent。
 * 选项直接在 Shadow DOM 内渲染（不依赖 slot 投影），确保样式可控。
 * 事件: cgo-change（detail = { value, label }）。
 */

export class CgoToolbarSelect extends LitElement {
    static properties = {
        value: { type: String, reflect: true },
        placeholder: { type: String },
        open: { type: Boolean, reflect: true },
        openUp: { type: Boolean, reflect: true, attribute: 'open-up' },
        disabled: { type: Boolean, reflect: true },
        _label: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: block;
            position: relative;
            width: 100%;
            font-family: var(--font-sans, system-ui, sans-serif);
        }

        .trigger {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            outline: none;
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            background: var(--input-bg, var(--bg-secondary, #f5f6f8));
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 13px;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-weight: 400;
            color: var(--text-main, #00263b);
            text-align: left;
            line-height: 1.6;
            user-select: none;
            min-height: 32px;
            box-sizing: border-box;
            transition: all 0.2s ease;
        }
        .trigger:hover {
            border-color: var(--primary-color, #006098);
        }

        :host([open]) .trigger {
            border-color: var(--primary-color, #006098);
            box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12);
        }

        :host([data-theme='dark']) .trigger {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.08);
        }

        .text {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
        }
        .placeholder {
            opacity: 0.5;
        }

        .arrow {
            width: 12px;
            height: 12px;
            opacity: 0.5;
            flex-shrink: 0;
            transition: transform 0.2s ease;
        }
        :host([open]) .arrow {
            transform: rotate(180deg);
        }

        :host([disabled]) .trigger {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }

        .options {
            position: fixed;
            max-height: 300px;
            background: var(--panel-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 100;
            overflow-y: auto;
            display: none;
            padding: 6px;
            box-sizing: border-box;
        }
        :host([open]) .options {
            display: block;
        }
        /* position: fixed 下，宽度与位置由 JS 注入的内联样式控制 */
        :host([open-up]) .options {
            box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.15);
        }

        .opt {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
            padding: 8px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            color: var(--text-main, #00263b);
            transition: background 0.15s;
            user-select: none;
            border: none;
            background: none;
            font-family: var(--font-sans, system-ui, sans-serif);
            text-align: left;
        }
        .opt:hover {
            background: var(--btn-info-hover, #e9ecef);
        }
        .opt.selected {
            background: var(--primary-color, #006098);
            color: #fff;
        }

        /* 选项内颜色圆点 / 图片 */
        .opt ::slotted(.cgo-toolbar-option-dot),
        .opt .cgo-toolbar-option-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .opt ::slotted(.cgo-toolbar-option-img),
        .opt .cgo-toolbar-option-img {
            height: 18px;
            width: auto;
            max-width: 42px;
            object-fit: contain;
            flex-shrink: 0;
        }

        :host([data-theme='dark']) .options {
            background: #2a2b2c;
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        :host([data-theme='dark'][open-up]) .options {
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.4);
        }

        .options::-webkit-scrollbar {
            width: 6px;
        }
        .options::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        :host([data-theme='dark']) .options::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
        }

        :host([open]:not([open-up])) .options {
            animation: cgoTsFadeIn 0.2s ease;
        }
        :host([open][open-up]) .options {
            animation: cgoTsFadeInUp 0.2s ease;
        }
        @keyframes cgoTsFadeIn {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes cgoTsFadeInUp {
            from {
                opacity: 0;
                transform: translateY(5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .src {
            display: none;
        }
    `;

    constructor() {
        super();
        this.value = '';
        this.placeholder = '';
        this.open = false;
        this.openUp = false;
        this.disabled = false;
        this._label = '';
        this._onOutside = this._onOutside.bind(this);
        this._positionHandler = () => {
            if (this.open) this._positionOptions();
        };
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('click', this._onOutside);
        // 将 <html data-theme> 同步到宿主元素，使 :host([data-theme]) 在 Shadow DOM 中生效
        // :host-context() 在 Safari 中不被支持，所以需要此方案
        this._syncThemeToHost();
        this._themeObserver = new MutationObserver(() => this._syncThemeToHost());
        this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        // innerHTML 插入时子元素可能尚未就绪，延迟一帧后重新同步
        requestAnimationFrame(() => this.requestUpdate());
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('click', this._onOutside);
        window.removeEventListener('resize', this._positionHandler);
        window.removeEventListener('scroll', this._positionHandler, true);
        _openInstances.delete(this);
        if (this._themeObserver) {
            this._themeObserver.disconnect();
            this._themeObserver = null;
        }
    }

    _syncThemeToHost() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme) {
            this.setAttribute('data-theme', theme);
        } else {
            this.removeAttribute('data-theme');
        }
    }

    _onOutside(event) {
        if (!this.contains(event.target)) this.close();
    }

    _getOptions() {
        return [...this.querySelectorAll('cgo-toolbar-option')];
    }

    _syncLabel() {
        const opts = this._getOptions();
        const sel = opts.find((opt) => opt.getAttribute('value') === this.value);
        if (sel) {
            this._label = sel.textContent.trim();
        } else if (!this.value && opts.length > 0) {
            this._label = opts[0].textContent.trim();
        } else {
            this._label = '';
        }
    }

    firstUpdated() {
        this._syncLabel();
    }

    updated(changed) {
        if (changed.has('value')) this._syncLabel();
    }

    _toggle(e) {
        e.stopPropagation();
        if (this.disabled) return;
        this.open ? this.close() : this.show();
    }

    show() {
        // 互斥：关闭其他已展开的 toolbar-select
        _openInstances.forEach((inst) => {
            if (inst !== this) inst.close();
        });
        this.open = true;
        _openInstances.add(this);
        // fixed 定位需在面板渲染后基于 trigger 视口坐标计算，并随窗口变化/滚动跟随
        this._positionOptions();
        window.addEventListener('resize', this._positionHandler);
        window.addEventListener('scroll', this._positionHandler, true);
    }

    _positionOptions() {
        requestAnimationFrame(() => {
            const opts = this.shadowRoot.querySelector('.options');
            const trigger = this.shadowRoot.querySelector('.trigger');
            if (!opts || !trigger) return;

            // 寻找 position: fixed 的包含块祖先元素以处理 transform 带来的定位偏移问题
            let containingBlock = null;
            let parent = this.parentNode;
            while (parent) {
                if (parent instanceof ShadowRoot) {
                    parent = parent.host;
                    continue;
                }
                if (parent === document.body || parent === document.documentElement) {
                    break;
                }
                const style = window.getComputedStyle(parent);
                if (
                    (style.transform && style.transform !== 'none') ||
                    (style.perspective && style.perspective !== 'none') ||
                    (style.filter && style.filter !== 'none') ||
                    (style.backdropFilter && style.backdropFilter !== 'none')
                ) {
                    containingBlock = parent;
                    break;
                }
                parent = parent.parentNode;
            }

            const r = trigger.getBoundingClientRect();
            const w = r.width;

            // 依据包含块计算相对偏移量
            const containerRect = containingBlock
                ? containingBlock.getBoundingClientRect()
                : { left: 0, top: 0, height: window.innerHeight };

            const left = r.left - containerRect.left;
            opts.style.width = w + 'px';
            opts.style.left = left + 'px';
            opts.style.top = '';
            opts.style.bottom = '';

            const downTop = r.bottom - containerRect.top + 5;
            // estBottom 的计算依然基于视口坐标系以防止超出窗口边界
            const estBottom = r.bottom + 5 + Math.min(opts.scrollHeight, 300);
            if (estBottom > window.innerHeight - 10) {
                this.openUp = true;
                opts.style.bottom = containerRect.height - (r.top - containerRect.top) + 5 + 'px';
            } else {
                this.openUp = false;
                opts.style.top = downTop + 'px';
            }
        });
    }

    close() {
        if (!this.open) return;
        this.open = false;
        _openInstances.delete(this);
        window.removeEventListener('resize', this._positionHandler);
        window.removeEventListener('scroll', this._positionHandler, true);
    }

    _select(optValue) {
        if (this.value === optValue) {
            this.close();
            return;
        }
        this.value = optValue;
        const opt = this._getOptions().find((o) => o.getAttribute('value') === optValue);
        const label = opt ? opt.textContent.trim() : '';
        this.close();
        this.dispatchEvent(
            new CustomEvent('cgo-change', {
                detail: { value: optValue, label },
                bubbles: true,
                composed: true,
            })
        );
    }

    render() {
        const opts = this._getOptions();
        const isPlaceholder = !this._label && !!this.placeholder;

        return html`
            <button class="trigger" type="button" @click=${this._toggle}>
                <span class="text ${isPlaceholder ? 'placeholder' : ''}">${this._label || this.placeholder || ''}</span>
                <svg
                    class="arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="options">
                ${opts.map((opt) => {
                    const val = opt.getAttribute('value') || '';
                    const isSel = val === this.value;
                    return html`
                        <div class="opt ${isSel ? 'selected' : ''}" @click=${() => this._select(val)}>
                            ${unsafeHTML(opt.innerHTML)}
                        </div>
                    `;
                })}
            </div>
            <div class="src"><slot></slot></div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-toolbar-select') || customElements.define('cgo-toolbar-select', CgoToolbarSelect);
}
