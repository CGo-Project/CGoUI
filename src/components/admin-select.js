import { LitElement, html, css } from 'lit';
import { injectLiquidGlassFilter } from '../theme.js';
import './icon.js';

const _openAdminSelects = new Set();
let _outsideAdminSelectBound = false;
function _bindOutsideAdminSelect() {
    if (_outsideAdminSelectBound) return;
    _outsideAdminSelectBound = true;
    document.addEventListener('click', (event) => {
        _openAdminSelects.forEach((inst) => {
            if (!event.composedPath().includes(inst)) {
                inst.close();
            }
        });
    });
}

export class CgoAdminSelect extends LitElement {
    static properties = {
        state: { type: String, reflect: true },
        label: { type: String },
        open: { type: Boolean, reflect: true },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
        disabled: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
            min-width: 136px;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            vertical-align: middle;
        }

        /* ── 1. 功能入口收起时：参考 <cgo-button> 的液态玻璃与物理微交互 ── */
        .select {
            position: relative;
            display: grid;
            grid-template-columns: 9px minmax(0, 1fr) 18px;
            align-items: center;
            gap: 8px;
            width: 100%;
            height: 34px;
            padding: 0 10px;
            border-radius: var(--radius-sm, 6px);
            border: none !important;
            outline: none !important;
            background: var(--permission-inherit-soft, #f2f5f8);
            color: var(--text-main, #00263b);
            box-sizing: border-box;
            font-size: 13px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
            font-family: inherit;
            user-select: none;
            overflow: hidden;
            isolation: isolate;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            /* 显式过渡与微触感反馈 */
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* <cgo-button> 同款 1px 双轴微光描边 (Layer 2 Masked 1px Hairline Rim Light，唯一描边来源) */
        .select::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background:
                linear-gradient(to right,
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 0,
                    rgba(0, 0, 0, 0) var(--lg-rim-side, 3px),
                    rgba(0, 0, 0, 0) calc(100% - var(--lg-rim-side, 3px)),
                    rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 100%),
                linear-gradient(to bottom,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) 0,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) var(--lg-rim-hold, 1px),
                    rgba(255, 255, 255, 0) 8px,
                    rgba(0, 0, 0, 0.02) calc(100% - 4px),
                    rgba(0, 0, 0, 0.12) 100%);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
            opacity: 0.64;
            transition: opacity var(--dur-fast, 140ms) ease;
        }

        .select:hover:not(:disabled)::before {
            opacity: 0.75;
        }

        .select:hover:not(:disabled) {
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
        }

        /* 收起未打开状态下的按压触感反馈 */
        :host(:not([open])) .select:active:not(:disabled) {
            transform: scale(0.98);
        }

        :host-context([data-theme='dark']) .select {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
            color: var(--text-main, #e5e8ea);
        }

        :host-context([data-theme='dark']) .select:hover:not(:disabled) {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        }

        :host-context([data-theme='dark']) .select::before {
            background:
                linear-gradient(to bottom,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 0,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 1px,
                    rgba(255, 255, 255, 0) 8px,
                    rgba(255, 255, 255, 0) calc(100% - 4px),
                    rgba(255, 255, 255, 0.08) 100%);
        }

        /* 保证文字和指示小点在 Layer 3 (z-index: 3) 绝对清晰 */
        .dot,
        .label,
        .arrow {
            position: relative;
            z-index: 3;
        }

        .label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: var(--permission-inherit, #64748b);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-inherit, #64748b) 16%, transparent);
            flex-shrink: 0;
            transition: background var(--dur-fast, 140ms) ease, box-shadow var(--dur-fast, 140ms) ease;
        }

        .arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--text-main, #00263b);
            transition: transform var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1), color var(--dur-fast, 140ms) ease;
            flex-shrink: 0;
        }

        :host-context([data-theme='dark']) .arrow {
            color: var(--text-main, #e5e8ea);
        }

        /* 各状态背景色（纯色背景，不设置实体 border，由 ::before 提供单一微光描边） */
        :host([state='enabled']) .select {
            background: var(--permission-enabled-soft, #edf8f1);
        }
        :host([state='enabled']) .dot {
            background: var(--permission-enabled, #16803d);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-enabled, #16803d) 16%, transparent);
        }

        :host([state='disabled']) .select {
            background: var(--permission-disabled-soft, #f0f4f8);
        }
        :host([state='disabled']) .dot {
            background: var(--permission-disabled, #52637a);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-disabled, #52637a) 16%, transparent);
        }

        :host([state='hidden']) .select {
            background: var(--permission-hidden-soft, #fff1f1);
        }
        :host([state='hidden']) .dot {
            background: var(--permission-hidden, #c62828);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--permission-hidden, #c62828) 16%, transparent);
        }

        :host([disabled]) .select {
            opacity: 0.55;
            cursor: not-allowed;
            pointer-events: none;
            transform: none !important;
            box-shadow: none;
        }

        /* ── 2. 功能入口打开时：参考 <cgo-input> 激活时的样式效果 ──
           彻底移除 ::before 伪元素微光，使用单组 box-shadow 绘制 1px 轮廓线 + 3.5px 扩散光晕，
           绝无多层边框套圈与内缩重影！ */
        :host([open]) .select::before {
            display: none !important;
        }

        :host([open]) .select {
            outline: none !important;
            border: none !important;
            transform: none !important;
            box-shadow:
                0 0 0 1px var(--permission-inherit, #64748b),
                0 0 0 3.5px color-mix(in srgb, var(--permission-inherit, #64748b) 16%, transparent),
                0 1px 2px rgba(0, 0, 0, 0.06) !important;
        }

        :host([open]) .arrow {
            transform: rotate(180deg);
        }

        :host([open][state='enabled']) .select {
            box-shadow:
                0 0 0 1px var(--permission-enabled, #16803d),
                0 0 0 3.5px color-mix(in srgb, var(--permission-enabled, #16803d) 18%, transparent),
                0 1px 2px rgba(22, 128, 61, 0.08) !important;
        }

        :host([open][state='disabled']) .select {
            box-shadow:
                0 0 0 1px var(--permission-disabled, #52637a),
                0 0 0 3.5px color-mix(in srgb, var(--permission-disabled, #52637a) 16%, transparent),
                0 1px 2px rgba(0, 0, 0, 0.06) !important;
        }

        :host([open][state='hidden']) .select {
            box-shadow:
                0 0 0 1px var(--permission-hidden, #c62828),
                0 0 0 3.5px color-mix(in srgb, var(--permission-hidden, #c62828) 18%, transparent),
                0 1px 2px rgba(198, 40, 40, 0.08) !important;
        }

        /* 暗色模式下打开/激活状态的 Focus Ring */
        :host-context([data-theme='dark']):host([open]) .select {
            box-shadow:
                0 0 0 1px var(--permission-inherit, #a1b0cb),
                0 0 0 3.5px color-mix(in srgb, var(--permission-inherit, #a1b0cb) 25%, transparent),
                0 1px 3px rgba(0, 0, 0, 0.35) !important;
        }

        :host-context([data-theme='dark']):host([open][state='enabled']) .select {
            box-shadow:
                0 0 0 1px var(--permission-enabled, #81c995),
                0 0 0 3.5px color-mix(in srgb, var(--permission-enabled, #81c995) 26%, transparent),
                0 1px 3px rgba(0, 0, 0, 0.35) !important;
        }

        :host-context([data-theme='dark']):host([open][state='disabled']) .select {
            box-shadow:
                0 0 0 1px var(--permission-disabled, #94a3b8),
                0 0 0 3.5px color-mix(in srgb, var(--permission-disabled, #94a3b8) 25%, transparent),
                0 1px 3px rgba(0, 0, 0, 0.35) !important;
        }

        :host-context([data-theme='dark']):host([open][state='hidden']) .select {
            box-shadow:
                0 0 0 1px var(--permission-hidden, #ff8a80),
                0 0 0 3.5px color-mix(in srgb, var(--permission-hidden, #ff8a80) 26%, transparent),
                0 1px 3px rgba(0, 0, 0, 0.35) !important;
        }

        /* ── 3. 打开时的下拉菜单：参考 <cgo-dropdown> 的下拉菜单添加与 card B 一致的液态玻璃效果 ── */
        .menu {
            display: none;
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            min-width: 140px;
            background: transparent;
            border: none;
            border-radius: var(--radius-md, 8px);
            box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04));
            z-index: 600;
            padding: 6px;
            overflow: hidden;
            isolation: isolate;
            box-sizing: border-box;
            animation: dropdownIn var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
        }

        :host([open]) .menu {
            display: block;
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
        .menu::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        :host-context([data-theme='dark']) .menu::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82));
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与 0.82 高不透明底板自然融合) */
        .menu::before {
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
            opacity: 0.8;
        }

        :host-context([data-theme='dark']) .menu::before {
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 1px,
                rgba(255, 255, 255, 0) 8px);
        }

        :host-context([data-theme='dark']) .menu {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Layer 3: 菜单内容项 */
        .menu-content {
            position: relative;
            z-index: 3;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        /* 传统扁平降级 */
        :host([glass-mode='flat']) .menu,
        :host([glass-mode='none']) .menu {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .menu::before,
        :host([glass-mode='flat']) .menu::after,
        :host([glass-mode='none']) .menu::before,
        :host([glass-mode='none']) .menu::after {
            display: none;
        }
        :host-context([data-theme='dark']):host([glass-mode='flat']) .menu {
            background: var(--card-bg, #1f2020);
            border-color: var(--border-color, #383a3c);
        }

        @keyframes dropdownIn {
            from {
                opacity: 0;
                transform: translateY(-4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .option {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            border: 0;
            border-radius: var(--radius-xs, 4px);
            background: transparent;
            color: var(--text-main, #00263b);
            padding: 8px 9px;
            font: inherit;
            font-size: 12px;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            box-sizing: border-box;
            user-select: none;
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) ease;
        }

        .option:hover {
            background: var(--btn-info-hover, rgba(0, 38, 59, 0.06));
            color: var(--text-main, #00263b);
        }

        :host-context([data-theme='dark']) .option {
            color: var(--text-main, #e5e8ea);
        }

        :host-context([data-theme='dark']) .option:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
        }

        .option:active {
            transform: scale(0.99);
        }

        .option[aria-selected='true'] {
            background: var(--btn-info-hover, rgba(0, 38, 59, 0.08));
            font-weight: 700;
        }

        .option.enabled[aria-selected='true'] {
            background: var(--permission-enabled-soft, #edf8f1);
            color: var(--permission-enabled, #16803d);
        }
        .option.disabled[aria-selected='true'] {
            background: var(--permission-disabled-soft, #f0f4f8);
            color: var(--permission-disabled, #52637a);
        }
        .option.hidden[aria-selected='true'] {
            background: var(--permission-hidden-soft, #fff1f1);
            color: var(--permission-hidden, #c62828);
        }
        .option.inherit[aria-selected='true'] {
            background: var(--permission-inherit-soft, #f2f5f8);
            color: var(--permission-inherit, #64748b);
        }

        .option .dot {
            width: 8px;
            height: 8px;
            box-shadow: none;
        }
        .option.inherit .dot {
            background: var(--permission-inherit, #64748b);
        }
        .option.enabled .dot {
            background: var(--permission-enabled, #16803d);
        }
        .option.disabled .dot {
            background: var(--permission-disabled, #52637a);
        }
        .option.hidden .dot {
            background: var(--permission-hidden, #c62828);
        }
    `;

    constructor() {
        super();
        this.state = 'inherit';
        this.label = '';
        this.open = false;
        this.glassMode = '';
        this.disabled = false;
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
        _bindOutsideAdminSelect();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        _openAdminSelects.delete(this);
    }

    openSelect() {
        if (this.disabled) return;
        _openAdminSelects.forEach((inst) => {
            if (inst !== this) inst.close();
        });
        this.open = true;
        _openAdminSelects.add(this);
    }

    close() {
        if (!this.open) return;
        this.open = false;
        _openAdminSelects.delete(this);
    }

    toggle(event) {
        if (this.disabled) return;
        if (event) event.stopPropagation();
        this.open ? this.close() : this.openSelect();
    }

    _options() {
        return [
            { state: 'inherit', label: '继承权限' },
            { state: 'enabled', label: '允许访问' },
            { state: 'disabled', label: '拒绝访问' },
            { state: 'hidden', label: '隐藏入口' },
        ];
    }

    _current() {
        return this._options().find((item) => item.state === this.state) || this._options()[0];
    }

    _select(option) {
        this.state = option.state;
        this.label = option.label;
        this.close();
        this.dispatchEvent(new CustomEvent('cgo-admin-change', { detail: option, bubbles: true, composed: true }));
    }

    render() {
        const current = this.label ? { state: this.state, label: this.label } : this._current();
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';
        return html`
            <button
                class="select"
                type="button"
                ?disabled=${this.disabled}
                aria-expanded=${this.open}
                @click=${(event) => this.toggle(event)}
            >
                <span class="dot"></span>
                <span class="label">${current.label}</span>
                <cgo-icon class="arrow" name="chevron-down" size="18" aria-hidden="true"></cgo-icon>
            </button>
            <div class="menu">
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="menu-content">
                    ${this._options().map(
                        (option) => html`
                            <button
                                class="option ${option.state}"
                                type="button"
                                aria-selected=${option.state === this.state}
                                @click=${() => this._select(option)}
                            >
                                <span class="dot"></span>
                                ${option.label === '继承权限'
                                    ? '继承 (Inherit)'
                                    : option.label === '允许访问'
                                      ? '允许 (Allow)'
                                      : option.label === '拒绝访问'
                                        ? '拒绝 (Deny)'
                                        : '隐藏 (Hide)'}
                            </button>
                        `
                    )}
                </div>
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-admin-select') || customElements.define('cgo-admin-select', CgoAdminSelect);
}
