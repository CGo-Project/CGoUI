/*!
 * CGo UI — 焦点工具（内部使用）
 * 模态框、帮助弹窗与弹层共用：穿透 Shadow DOM / slot 查找可聚焦元素、
 * 读取真实的活动元素、在容器内循环 Tab。
 */

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'summary',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    '[tabindex]',
].join(',');

function isFocusable(el) {
    if (!el.matches || !el.matches(FOCUSABLE_SELECTOR)) return false;
    if (el.disabled || el.hasAttribute('inert')) return false;
    if (el.tagName === 'INPUT' && el.type === 'hidden') return false;
    const tabindex = el.getAttribute('tabindex');
    if (tabindex !== null && Number(tabindex) < 0) return false;
    // display:none / 未渲染的元素没有布局盒
    return el.getClientRects().length > 0;
}

/**
 * 按合成树（composed tree）顺序收集 root 内可 Tab 到达的元素：
 * 进入开放的 shadowRoot，并把 <slot> 展开为实际分配的节点。
 */
export function getFocusableElements(root) {
    const result = [];
    const walk = (node) => {
        if (!node || node.nodeType !== 1) return;
        if (node.hasAttribute('inert')) return;
        if (node.tagName === 'SLOT') {
            const assigned = node.assignedElements({ flatten: true });
            (assigned.length ? assigned : [...node.children]).forEach(walk);
            return;
        }
        if (isFocusable(node)) result.push(node);
        const children = node.shadowRoot ? node.shadowRoot.children : node.children;
        for (const child of children) walk(child);
    };
    const start = root && root.nodeType === 11 ? root.children : root ? [root] : [];
    for (const node of start) walk(node);
    return result;
}

/** 穿透 Shadow DOM 取得真正持有焦点的元素。 */
export function getDeepActiveElement(doc = document) {
    let active = doc.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
        active = active.shadowRoot.activeElement;
    }
    return active;
}

/** node 是否位于 container 内（跨 Shadow DOM 边界）。 */
export function composedContains(container, node) {
    let current = node;
    while (current) {
        if (current === container) return true;
        current = current.assignedSlot || current.parentNode || current.host || null;
    }
    return false;
}

/** 安全聚焦：目标已不在文档中或聚焦失败时返回 false。 */
export function safeFocus(el, options) {
    if (!el || typeof el.focus !== 'function' || !el.isConnected) return false;
    try {
        el.focus(options);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * 处理 Tab 键，使焦点在 container 内循环。
 * 在 keydown 监听里调用；fallback 是容器内没有可聚焦元素时接收焦点的元素。
 */
export function trapTabKey(event, container, fallback) {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(container);
    if (!focusable.length) {
        event.preventDefault();
        safeFocus(fallback || container);
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = getDeepActiveElement();
    const index = focusable.indexOf(active);
    if (event.shiftKey) {
        if (index <= 0) {
            event.preventDefault();
            safeFocus(last);
        }
    } else if (index === -1 || index === focusable.length - 1) {
        event.preventDefault();
        safeFocus(first);
    }
}
