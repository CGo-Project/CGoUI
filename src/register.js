/*!
 * @cgo/ui — browser <script type="module"> entry.
 * The built dist/cgo-ui.js can be loaded from the NPM package or a versioned CDN.
 */
import './index.js';
// Keep component registration side effects explicit so bundlers cannot shake
// them away solely because they are also re-exported by index.js.
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
import './components/header-toggle.js';
import './components/side-nav.js';
import './components/toolbar-select.js';
import './components/notice-card.js';
import './components/notice-center.js';
import { installGlobalShim } from './shim/public-global.js';
import { initTheme } from './theme.js';

initTheme();
installGlobalShim(window);
