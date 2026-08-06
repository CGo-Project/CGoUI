import { LitElement, html, css } from 'lit';
import './icon.js';

/**
 * <cgo-nav-item>
 *
 * 侧边导航中的单项。作为 <cgo-side-nav> 的子元素使用。
 *
 * 属性:
 *   icon    - 图标名称（来自 CGoUI 图标库）或任意文本（emoji 等）
 *   label   - 显示文本
 *   target  - 对应 panel 的 ID
 *   active  - 是否激活
 *   danger  - 危险区样式（红色）
 *   heading - 设为分组标题（不可点击，仅展示）
 *   tag     - 右侧附加的代码标签文本
 *
 * @slot (默认) - 替代 label 属性的自定义内容
 */
export class CgoNavItem extends LitElement {
    static properties = {
        icon: { type: String },
        label: { type: String },
        target: { type: String },
        active: { type: Boolean, reflect: true },
        danger: { type: Boolean, reflect: true },
        heading: { type: Boolean, reflect: true },
        tag: { type: String },
        wrap: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: contents;
        }
    `;

    constructor() {
        super();
        this.icon = '';
        this.label = '';
        this.target = '';
        this.active = false;
        this.danger = false;
        this.heading = false;
        this.tag = '';
        this.wrap = false;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-nav-item') || customElements.define('cgo-nav-item', CgoNavItem);
}

/**
 * <cgo-side-nav>
 *
 * 自适应侧边导航组件。
 * - 电脑端（>768px）：纵向侧边栏导航，带磨砂玻璃背景
 * - 移动端（≤768px）：水平滚动胶囊选项卡
 *
 * 子元素: <cgo-nav-item>
 *
 * 插槽:
 *   user-brief  - 侧边栏顶部的用户信息区域（移动端隐藏）
 *   footer      - 侧边栏底部的操作区（移动端隐藏）
 *   (默认)      - 导航项列表 <cgo-nav-item>
 *
 * 事件:
 *   cgo-nav-change  — 切换导航时触发，detail = { target, index, item }
 *
 * 使用示例:
 *   <cgo-side-nav>
 *     <div slot="user-brief">
 *       <cgo-avatar size="40"></cgo-avatar>
 *       <span>用户名</span>
 *     </div>
 *     <cgo-nav-item icon="user" label="个人资料" target="panel-profile" active></cgo-nav-item>
 *     <cgo-nav-item icon="card" label="一卡通升级" target="panel-card-mgmt"></cgo-nav-item>
 *     <cgo-nav-item icon="lock" label="安全设置" target="panel-security"></cgo-nav-item>
 *     <cgo-nav-item icon="error-outline" label="危险区" target="panel-danger" danger></cgo-nav-item>
 *     <cgo-button slot="footer" variant="danger" full>退出登录</cgo-button>
 *   </cgo-side-nav>
 */
export class CgoSideNav extends LitElement {
    static properties = {
        /** 当前激活项的索引（从 0 开始）。设置后自动高亮对应项。 */
        activeIndex: { type: Number, attribute: 'active-index' },
    };

    static styles = css`
        :host {
            /* ---- CSS 变量（可按需覆写） ---- */
            --sidenav-width: 220px;
            --sidenav-bg: var(--glass-bg, rgba(248, 249, 250, 0.85));
            --sidenav-border: var(--glass-border, rgba(0, 0, 0, 0.08));
            --sidenav-item-gap: 4px;
            --sidenav-item-radius: 6px;
            --sidenav-item-px: 12px;
            --sidenav-item-py: 10px;
            --sidenav-active-bg: var(--primary-color, #006098);
            --sidenav-active-fg: var(--btn-text, #fff);
            --sidenav-active-border-left: transparent;
            --sidenav-danger-bg: var(--danger-color, #dc3545);
            --sidenav-danger-fg: #fff;
            --sidenav-user-brief-border: var(--glass-border, rgba(0, 0, 0, 0.08));
            --sidenav-footer-border: var(--glass-border, rgba(0, 0, 0, 0.08));

            display: block;
            font-family: var(--font-sans, system-ui, -apple-system, 'Noto Sans SC', sans-serif);
        }

        /* ===== 外层容器 ===== */
        .sidenav {
            display: flex;
            flex-direction: column;
            width: var(--sidenav-width);
            height: 100%;
            background: var(--sidenav-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-right: 1px solid var(--sidenav-border);
            box-sizing: border-box;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        /* ===== 用户简介区 ===== */
        .sidenav-user-brief {
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: 1px solid var(--sidenav-user-brief-border);
        }

        /* ===== 导航列表 ===== */
        .sidenav-menu {
            flex: 1;
            overflow-y: auto;
            padding: 24px 10px 10px;
            display: flex;
            flex-direction: column;
            gap: var(--sidenav-item-gap);
            scrollbar-width: thin;
        }

        /* ===== 侧边栏底部插槽 ===== */
        .sidenav-footer {
            padding: 16px;
            border-top: 1px solid var(--sidenav-footer-border);
        }

        /* ===== 分组标题（不可点击） ===== */
        .sidenav-heading {
            padding: 12px var(--sidenav-item-px) 4px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: var(--text-light, #64748b);
            text-transform: uppercase;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .sidenav-heading:first-child {
            padding-top: 0;
        }
        .sidenav-heading-icon {
            font-size: 13px;
            line-height: 1;
        }

        /* ===== PC 端导航项 ===== */
        .sidenav-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: var(--sidenav-item-py) var(--sidenav-item-px);
            border-radius: var(--sidenav-item-radius);
            border: none;
            color: var(--text-light, #64748b);
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
            font-size: 0.9rem;
            background: none;
            width: 100%;
            text-align: left;
            font-family: inherit;
            line-height: 1.4;
            box-sizing: border-box;
            white-space: nowrap;
        }
        .sidenav-item:hover {
            background-color: var(--btn-info-bg, #f1f3f5);
            color: var(--text-main, #102033);
        }
        .sidenav-item.active {
            background-color: var(--sidenav-active-bg);
            color: var(--sidenav-active-fg);
        }
        .sidenav-item.active .sidenav-item-tag {
            color: var(--sidenav-active-fg);
        }
        .sidenav-item.active cgo-icon {
            color: var(--sidenav-active-fg);
        }
        .sidenav-item.danger {
            color: var(--danger-color, #dc3545);
        }
        .sidenav-item.danger:hover {
            background-color: rgba(217, 48, 37, 0.1);
            color: var(--danger-color, #dc3545);
        }
        .sidenav-item.danger.active {
            background-color: var(--sidenav-danger-bg);
            color: var(--sidenav-danger-fg);
        }

        /* 标签文本 */
        .sidenav-item-label {
            flex: 1;
            min-width: 0;
        }

        /* 右侧代码标签 */
        .sidenav-item-tag {
            font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
            font-size: 11px;
            color: var(--text-light, #64748b);
            margin-left: auto;
            flex-shrink: 0;
            font-weight: 400;
        }

        /* tag 换行变体 */
        .sidenav-item.wrap {
            flex-wrap: wrap;
            white-space: normal;
            align-items: flex-start;
        }
        .sidenav-item.wrap .sidenav-item-label {
            flex: 0 0 100%;
        }
        .sidenav-item.wrap .sidenav-item-tag {
            margin-left: 0;
            width: 100%;
        }

        /* ===== 移动端胶囊样式 ===== */
        .sidenav-capsules {
            display: none;
        }

        /* ============================================
           响应式：≤820px 切换为顶部胶囊选项卡
           ============================================ */
        @media (max-width: 820px) {
            .sidenav {
                width: 100%;
                height: auto;
                flex-direction: row;
                align-items: center;
                border-right: none;
                border-bottom: 1px solid var(--border-color, #dee2e6);
                background: var(--card-bg, #fff);
                backdrop-filter: none;
                -webkit-backdrop-filter: none;
                padding: 0;
                flex-shrink: 0;
            }
            .sidenav-user-brief,
            .sidenav-footer,
            .sidenav-heading {
                display: none;
            }
            .sidenav-menu {
                flex-direction: row;
                padding: 10px 12px;
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;
                -webkit-overflow-scrolling: touch;
                gap: 8px;
                scrollbar-width: none;
            }
            .sidenav-menu::-webkit-scrollbar {
                display: none;
            }

            /* 移动端选项卡 */
            .sidenav-item {
                flex-shrink: 0;
                flex-direction: row;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                margin: 0;
                border-radius: var(--sidenav-item-radius, 6px);
                font-size: 0.85rem;
                width: auto;
                background-color: transparent;
                color: var(--text-light, #64748b);
            }
            .sidenav-item:hover {
                background-color: transparent;
            }
            .sidenav-item.active {
                background-color: var(--sidenav-active-bg);
                color: var(--sidenav-active-fg);
            }
            .sidenav-item.danger {
                color: var(--danger-color, #dc3545);
                background-color: var(--btn-info-bg, #f1f3f5);
            }
            .sidenav-item.danger.active {
                background-color: var(--sidenav-danger-bg);
                color: var(--sidenav-danger-fg);
            }
            .sidenav-item-tag {
                display: none;
            }
            .sidenav-item cgo-icon {
                width: 16px;
                height: 16px;
            }
        }
    `;

    constructor() {
        super();
        this.activeIndex = 0;
        this._lastItemsLen = 0;
    }

    /* ---- 获取所有 <cgo-nav-item> 子元素（不含 heading） ---- */
    get _items() {
        return [...this.querySelectorAll('cgo-nav-item')];
    }

    /** 所有可点击的导航项（排除 heading） */
    get _clickableItems() {
        return this._items.filter((item) => !item.heading);
    }

    /**
     * 切换到指定索引的导航项（索引仅计算可点击项）。
     * @param {number} index - 目标索引（可点击项中的位置）
     */
    select(index) {
        const items = this._clickableItems;
        if (index < 0 || index >= items.length) return;
        this.activeIndex = index;
        items.forEach((item, i) => {
            item.active = i === index;
        });
        const target = items[index];
        this.dispatchEvent(
            new CustomEvent('cgo-nav-change', {
                detail: {
                    index,
                    target: target.target,
                    item: target,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * 通过 target 属性值选中对应导航项。
     * @param {string} targetId - 要匹配的 target 值
     */
    selectByTarget(targetId) {
        const items = this._clickableItems;
        const idx = items.findIndex((item) => item.target === targetId);
        if (idx >= 0) this.select(idx);
    }

    updated(changedProperties) {
        // 当子元素数量变化时重新初始化激活状态
        const currentLen = this._items.length;
        if (currentLen !== this._lastItemsLen) {
            this._lastItemsLen = currentLen;
            this._initActive();
        }
    }

    _initActive() {
        const items = this._clickableItems;
        if (items.length === 0) return;

        // 查找是否有预先标记为 active 的项
        const preActive = items.findIndex((item) => item.active);
        if (preActive >= 0) {
            this.activeIndex = preActive;
        } else {
            // 默认激活第一项
            items[0].active = true;
            this.activeIndex = 0;
        }
    }

    /* ---- 渲染 ---- */
    render() {
        const items = this._items;
        let clickableIdx = 0;

        const navItems = items.map((item, i) => {
            const icon = item.icon;
            const label = item.label;
            const isDanger = item.danger;
            const isHeading = item.heading;
            const isActive = item.active;
            const tag = item.tag;

            // ---- 分组标题（不可点击） ----
            if (isHeading) {
                return html`
                    <div class="sidenav-heading">
                        ${icon
                            ? html`
                                  <span class="sidenav-heading-icon">${icon}</span>
                              `
                            : null}
                        <span>${label}</span>
                    </div>
                `;
            }

            const currentClickableIdx = clickableIdx++;
            const wrapClass = item.wrap ? ' wrap' : '';
            return html`
                <button
                    class="sidenav-item ${isActive ? 'active' : ''} ${isDanger ? 'danger' : ''}${wrapClass}"
                    @click=${() => this.select(currentClickableIdx)}
                    type="button"
                >
                    ${icon
                        ? html`
                              <cgo-icon name=${icon} size="18"></cgo-icon>
                          `
                        : null}
                    <span class="sidenav-item-label">
                        ${label ||
                        html`
                            <slot name="item-${i}"></slot>
                        `}
                    </span>
                    ${tag
                        ? html`
                              <code class="sidenav-item-tag">${tag}</code>
                          `
                        : null}
                </button>
            `;
        });

        return html`
            <div class="sidenav">
                ${this._hasSlot('user-brief')
                    ? html`
                          <div class="sidenav-user-brief">
                              <slot name="user-brief" @slotchange=${() => this.requestUpdate()}></slot>
                          </div>
                      `
                    : null}

                <nav class="sidenav-menu">${navItems}</nav>

                ${this._hasSlot('footer')
                    ? html`
                          <div class="sidenav-footer">
                              <slot name="footer" @slotchange=${() => this.requestUpdate()}></slot>
                          </div>
                      `
                    : null}
            </div>
        `;
    }

    /** 检查是否有指定 slot 的 light DOM 内容 */
    _hasSlot(name) {
        return this.querySelector(`[slot="${name}"]`) !== null;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-side-nav') || customElements.define('cgo-side-nav', CgoSideNav);
}
