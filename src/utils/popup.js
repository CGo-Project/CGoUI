/*!
 * CGo UI — 弹层控制器（内部使用）
 * dropdown / toolbar-select / admin-select 共用同一套行为：
 *   - 互斥：展开一个弹层时收起其它弹层（包含它的祖先弹层除外）
 *   - 点击外部关闭：按事件路径判断，触发器不需要 stopPropagation
 *   - Esc 关闭最近展开的弹层，并把焦点还给展开前的元素
 */
import { composedContains, getDeepActiveElement, safeFocus } from './focus.js';

/* 已展开的弹层，按展开顺序排列 */
const openPopups = [];
let bound = false;

function onDocumentClick(event) {
    if (!openPopups.length) return;
    const path = event.composedPath();
    [...openPopups].forEach((popup) => {
        if (!path.includes(popup.host)) popup.requestClose();
    });
}

function onDocumentKeydown(event) {
    if (event.key !== 'Escape' || !openPopups.length) return;
    const popup = openPopups[openPopups.length - 1];
    // 标记为已处理，外层模态框据此不再一并关闭
    event.preventDefault();
    popup.requestClose({ restoreFocus: true });
}

function bind() {
    if (bound || typeof document === 'undefined') return;
    bound = true;
    // 捕获阶段监听：宿主页面里其它处理器 stopPropagation 也不影响关闭
    document.addEventListener('click', onDocumentClick, true);
    document.addEventListener('keydown', onDocumentKeydown, true);
}

export class PopupController {
    /**
     * @param {HTMLElement} host 弹层组件宿主
     * @param {{ close: () => void, getTrigger?: () => HTMLElement | null }} options
     *        close 负责把宿主置为收起状态；getTrigger 是找不到原焦点时的兜底归还目标
     */
    constructor(host, options) {
        this.host = host;
        this._close = options.close;
        this._getTrigger = options.getTrigger || (() => null);
        this._returnFocus = null;
        if (typeof host.addController === 'function') host.addController(this);
    }

    hostDisconnected() {
        this.closed();
    }

    get isOpen() {
        return openPopups.includes(this);
    }

    /** 宿主展开后调用（可重复调用）。 */
    opened() {
        if (this.isOpen) return;
        bind();
        [...openPopups].forEach((popup) => {
            if (!composedContains(popup.host, this.host)) popup.requestClose();
        });
        this._returnFocus = typeof document !== 'undefined' ? getDeepActiveElement() : null;
        openPopups.push(this);
    }

    /** 宿主收起后调用（可重复调用）。 */
    closed() {
        const index = openPopups.indexOf(this);
        if (index >= 0) openPopups.splice(index, 1);
    }

    /** 把焦点还给展开前持有焦点的元素（须在本弹层内，通常就是触发器），否则退回触发器。 */
    restoreFocus() {
        const target = this._returnFocus;
        this._returnFocus = null;
        if (target && composedContains(this.host, target) && safeFocus(target)) return;
        safeFocus(this._getTrigger());
    }

    requestClose({ restoreFocus = false } = {}) {
        this.closed();
        this._close();
        if (restoreFocus) this.restoreFocus();
    }
}
