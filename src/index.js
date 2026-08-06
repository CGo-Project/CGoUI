/*!
 * @cgo/ui — ESM 入口（供打包工具 / React / Vue / Next 消费）
 * 导入即注册全部 <cgo-*> 自定义元素，并导出类与工具函数。
 */
export { CgoIcon } from './components/icon.js';
export { CgoButton } from './components/button.js';
export { CgoBadge } from './components/badge.js';
export { CgoInput } from './components/input.js';
export { CgoCard } from './components/card.js';
export { CgoTable } from './components/table.js';
export { CgoMediaViewer } from './components/media-viewer.js';
export { CgoFloatingWindow } from './components/floating-window.js';
export { CgoAdminSelect } from './components/admin-select.js';
export { CgoPreferenceItem } from './components/preference-item.js';
export { CgoLineBadge } from './components/line-badge.js';
export { CgoLevelCard } from './components/level-card.js';
export { CgoSpinner } from './components/spinner.js';
export { CgoToast, showToast } from './components/toast.js';
export { CgoTooltip } from './components/tooltip.js';
export { CgoDropdown } from './components/dropdown.js';
export { CgoModal } from './components/modal.js';
export { CgoTabs, CgoTab } from './components/tabs.js';
export { CgoAvatar } from './components/avatar.js';
export { CgoChatBubble } from './components/chat-bubble.js';
export { CgoCaptcha, generateCaptcha } from './components/captcha.js';
export { CgoThemeToggle } from './components/theme-toggle.js';

export { CgoSideNav, CgoNavItem } from './components/side-nav.js';
export { CgoToolbarSelect } from './components/toolbar-select.js';
export { CgoNoticeCard } from './components/notice-card.js';
export { CgoNoticeCenter } from './components/notice-center.js';
export { CgoNoticePopup, showNoticePopup } from './components/notice-popup.js';

export { ICONS, buildSvg, iconNames } from './icons/icons.js';
export * as theme from './theme.js';
export { installGlobalShim } from './shim/cgo-global.js';
