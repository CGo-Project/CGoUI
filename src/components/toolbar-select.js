import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { injectLiquidGlassFilter } from '../theme.js';

/* 全局互斥：同一时刻只有一个 toolbar-select 展开 */
const _openInstances = new Set();

/**
 * <cgo-toolbar-select value="beijing" placeholder="请选择模板">
 *   <cgo-toolbar-option value="beijing">北京标准站牌</cgo-toolbar-option>
 *   <cgo-toolbar-option value="shanghai">上海标准站牌</cgo-toolbar-option>
 * </cgo-toolbar-select>
 *
 * 工具栏下拉选择器，用于左侧面板内的模板/配色/Logo 选择。
 * 遵循次世代 Liquid Glass 体系：
 * 1. 收起态对齐 <cgo-button> 的液态玻璃微光描边与触感反馈；
 * 2. 展开态对齐 <cgo-input> 的激活发光环（无多重描边与重影冲突）；
 * 3. 下拉浮层全面对齐 <cgo-dropdown> 的 Liquid Glass Tier B 规范。
 */

export class CgoToolbarSelect extends LitElement {
    static properties = {
        value: { type: String, reflect: true },
        placeholder: { type: String },
        open: { type: Boolean, reflect: true },
        openUp: { type: Boolean, reflect: true, attribute: 'open-up' },
        disabled: { type: Boolean, reflect: true },
        glassMode: { type: String, attribute: 'glass-mode', reflect: true },
        _label: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
            vertical-align: middle;
            box-sizing: border-box;
            font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        /* ── 1. 功能入口收起时：参考 <cgo-button> 的液态玻璃与物理微交互 ── */
        .trigger {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            position: relative;
            outline: none !important;
            border: none !important;
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            background: var(--btn-info-bg, #f1f3f5);
            border-radius: var(--radius-sm, 6px);
            padding: 6px 12px;
            cursor: pointer;
            font-size: 13px;
            font-family: inherit;
            font-weight: 500;
            color: var(--text-main, #00263b);
            text-align: left;
            line-height: 1.6;
            user-select: none;
            min-height: 34px;
            height: 34px;
            box-sizing: border-box;
            overflow: hidden;
            isolation: isolate;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            transition:
                color var(--dur-fast, 140ms) ease,
                background-color var(--dur-fast, 140ms) ease,
                box-shadow var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* <cgo-button> 同款 1px 双轴微光描边 (Layer 2 Masked 1px Hairline Rim Light，唯一描边来源) */
        .trigger::before {
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

        .trigger:hover:not(:disabled)::before {
            opacity: 0.75;
        }

        .trigger:hover:not(:disabled) {
            background: var(--btn-info-hover, #e9ecef);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        /* 收起未打开状态下的按压微触感反馈 */
        :host(:not([open])) .trigger:active:not(:disabled) {
            transform: scale(0.98);
        }

        /* 暗色模式收起态适配 */
        :host([data-theme='dark']) .trigger,
        :host-context([data-theme='dark']) .trigger {
            background: var(--btn-info-bg, #262729);
            color: var(--text-main, #e5e8ea);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }

        :host([data-theme='dark']) .trigger:hover:not(:disabled),
        :host-context([data-theme='dark']) .trigger:hover:not(:disabled) {
            background: var(--btn-info-hover, #323438);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
        }

        :host([data-theme='dark']) .trigger::before,
        :host-context([data-theme='dark']) .trigger::before {
            background:
                linear-gradient(to bottom,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 0,
                    rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 1px,
                    rgba(255, 255, 255, 0) 8px,
                    rgba(255, 255, 255, 0) calc(100% - 4px),
                    rgba(255, 255, 255, 0.08) 100%);
        }

        /* 保证文字和箭头在 Layer 3 (z-index: 3) 绝对锐利清晰 */
        .text,
        .arrow {
            position: relative;
            z-index: 3;
        }

        .text {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
        }

        .placeholder {
            opacity: 0.55;
        }

        .arrow {
            width: 14px;
            height: 14px;
            opacity: 0.65;
            flex-shrink: 0;
            transition: transform var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1), opacity var(--dur-fast, 140ms) ease;
        }

        :host([disabled]) .trigger {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
            box-shadow: none;
            transform: none !important;
        }

        /* ── 2. 功能入口打开时：参考 <cgo-input> 激活时的样式效果 ──
           彻底移除 ::before 微光描边，使用单组 box-shadow 呈现 1px 精准轮廓线 + 3.5px 扩散光晕，
           绝无多层边框套圈与内缩重影！ */
        :host([open]) .trigger::before {
            display: none !important;
        }

        :host([open]) .trigger {
            outline: none !important;
            border: none !important;
            transform: none !important;
            box-shadow:
                0 0 0 1px var(--primary-color, #006098),
                0 0 0 3.5px rgba(0, 96, 152, 0.14),
                0 1px 2px rgba(0, 96, 152, 0.08) !important;
        }

        :host([open]) .arrow {
            transform: rotate(180deg);
            opacity: 0.9;
        }

        :host([data-theme='dark']):host([open]) .trigger,
        :host-context([data-theme='dark']):host([open]) .trigger {
            box-shadow:
                0 0 0 1px var(--primary-color, #4dabf7),
                0 0 0 3.5px rgba(77, 171, 247, 0.22),
                0 1px 3px rgba(0, 0, 0, 0.35) !important;
        }

        /* ── 3. 打开时的下拉菜单：参考 <cgo-dropdown> 的下拉菜单添加与 card B 一致的液态玻璃效果 ── */
        .options {
            position: fixed;
            background: transparent;
            border: none !important;
            outline: none !important;
            border-radius: var(--radius-md, 8px);
            box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 38, 59, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04));
            z-index: 100000;
            display: none;
            padding: 6px;
            box-sizing: border-box;
            overflow: hidden;
            isolation: isolate;
        }

        :host([open]) .options {
            display: flex;
            flex-direction: column;
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
        .options::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            background: var(--glass-bg-panel, rgba(255, 255, 255, 0.82));
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        :host([data-theme='dark']) .options::after,
        :host-context([data-theme='dark']) .options::after {
            background: var(--glass-bg-panel, rgba(31, 32, 34, 0.82));
        }

        /* Layer 2: 弱化微光圈 (Tier B 规范: 顶部柔和单向光，与 0.82 高不透明底板自然融合，杜绝双层套圈) */
        .options::before {
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

        :host([data-theme='dark']) .options::before,
        :host-context([data-theme='dark']) .options::before {
            background: linear-gradient(to bottom,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 0,
                rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 1px,
                rgba(255, 255, 255, 0) 8px);
        }

        :host([data-theme='dark']) .options,
        :host-context([data-theme='dark']) .options {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Layer 3: 菜单内容项容器（保证选项滚动时不破坏外层微光圈与背景卡片） */
        .options-content {
            position: relative;
            z-index: 3;
            max-height: 280px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 2px;
            width: 100%;
            box-sizing: border-box;
        }

        .options-content::-webkit-scrollbar {
            width: 5px;
        }
        .options-content::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.12);
            border-radius: 10px;
        }
        :host([data-theme='dark']) .options-content::-webkit-scrollbar-thumb,
        :host-context([data-theme='dark']) .options-content::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
        }

        .opt {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
            padding: 8px 10px;
            border-radius: var(--radius-xs, 4px);
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-main, #00263b);
            transition:
                background-color var(--dur-fast, 140ms) ease,
                color var(--dur-fast, 140ms) ease,
                transform var(--dur-micro, 100ms) ease;
            user-select: none;
            border: none !important;
            outline: none !important;
            background: transparent;
            font-family: inherit;
            text-align: left;
        }

        .opt:hover {
            background: var(--btn-info-hover, rgba(0, 38, 59, 0.06));
            color: var(--text-main, #00263b);
        }

        :host([data-theme='dark']) .opt,
        :host-context([data-theme='dark']) .opt {
            color: var(--text-main, #e5e8ea);
        }

        :host([data-theme='dark']) .opt:hover,
        :host-context([data-theme='dark']) .opt:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
        }

        .opt:active {
            transform: scale(0.99);
        }

        .opt.selected {
            background: var(--primary-color, #006098) !important;
            color: #ffffff !important;
            font-weight: 600;
        }

        :host([data-theme='dark']) .opt.selected,
        :host-context([data-theme='dark']) .opt.selected {
            background: var(--primary-color, #0070b0) !important;
            color: #ffffff !important;
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

        /* 传统扁平降级 */
        :host([glass-mode='flat']) .options,
        :host([glass-mode='none']) .options {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #dee2e6) !important;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }
        :host([glass-mode='flat']) .options::before,
        :host([glass-mode='flat']) .options::after,
        :host([glass-mode='none']) .options::before,
        :host([glass-mode='none']) .options::after {
            display: none;
        }
        :host([data-theme='dark']):host([glass-mode='flat']) .options,
        :host-context([data-theme='dark']):host([glass-mode='flat']) .options {
            background: var(--card-bg, #1f2020);
            border-color: var(--border-color, #383a3c) !important;
        }

        :host([open]:not([open-up])) .options {
            animation: cgoTsFadeIn var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
        }
        :host([open][open-up]) .options {
            animation: cgoTsFadeInUp var(--dur-fast, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cgoTsFadeIn {
            from {
                opacity: 0;
                transform: translateY(-4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes cgoTsFadeInUp {
            from {
                opacity: 0;
                transform: translateY(4px);
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
        this.glassMode = '';
        this._label = '';
        this._onOutside = this._onOutside.bind(this);
        this._positionHandler = () => {
            if (this.open) this._positionOptions();
        };
    }

    connectedCallback() {
        super.connectedCallback();
        injectLiquidGlassFilter();
        document.addEventListener('click', this._onOutside);
        // 将 <html data-theme> 同步到宿主元素，使 :host([data-theme]) 在 Shadow DOM 中生效
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
        if (!event.composedPath().includes(this)) this.close();
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
        const isFlat = this.glassMode === 'flat' || this.glassMode === 'none';

        return html`
            <button class="trigger" type="button" ?disabled=${this.disabled} aria-expanded=${this.open} @click=${this._toggle}>
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
                ${!isFlat ? html`<div class="glass-refraction" aria-hidden="true"></div>` : null}
                <div class="options-content">
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
            </div>
            <div class="src"><slot></slot></div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-toolbar-select') || customElements.define('cgo-toolbar-select', CgoToolbarSelect);
}
