import { LitElement, html, css } from 'lit';
import { showNoticePopup } from './notice-popup.js';

/**
 * <cgo-toast> — 紧凑气泡 Toast 代理组件。
 * 通常不直接写标签，由 showToast() 或 window.CGO.showToast() 在右上角 Popup 区域弹出。
 */
export class CgoToast extends LitElement {
    static styles = css`
        :host {
            display: none;
        }
    `;

    show(message, type = 'info', duration = 3000) {
        return showToast(message, type, duration);
    }

    render() {
        return html``;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-toast') || customElements.define('cgo-toast', CgoToast);
}

/**
 * showToast(message, type?, duration?) — 与 CGO.showToast 行为一致。
 * type: 'info'|'success'|'error'|'warning'
 */
export function showToast(message, type = 'info', duration = 3000) {
    return showNoticePopup({ isToast: true, message, type }, duration);
}
