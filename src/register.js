/*!
 * @cgo/ui — 浏览器 <script type="module"> 入口
 * 产物为 dist/cgo-ui.js，可被原生 HTML 通过 NPM 包或版本化 CDN 引入。
 *
 * 作用：
 *   1. 注册全部 <cgo-*> 自定义元素（来自 index.js 的副作用导入）
 *   2. 安装 window.CGO / window.ToolTheme 兼容垫片
 *   3. 立即初始化主题引擎（防闪烁）
 */
import './index.js';
// 这些模块在顶层注册 custom element。显式保留副作用，避免打包器依据
// package.json 的 sideEffects 声明把只通过 re-export 引入的组件树摇掉。
import './components/icon.js';
import './components/button.js';
import './components/badge.js';
import './components/input.js';
import './components/card.js';
import './components/table.js';
import './components/media-viewer.js';
import './components/floating-window.js';
import './components/admin-select.js';
import './components/preference-item.js';
import './components/line-badge.js';
import './components/level-card.js';
import './components/spinner.js';
import './components/tooltip.js';
import './components/dropdown.js';
import './components/modal.js';
import './components/tabs.js';
import './components/avatar.js';
import './components/chat-bubble.js';
import './components/theme-toggle.js';
import './components/side-nav.js';
import './components/toolbar-select.js';
import './components/notice-card.js';
import './components/notice-center.js';
import { installGlobalShim } from './shim/cgo-global.js';
import { initTheme } from './theme.js';

// 主题引擎尽早执行，避免明暗闪烁
initTheme();
// 安装全局 API 垫片，保证旧工具零改动可用
installGlobalShim(window);
