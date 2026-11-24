/*!
 * @cgo/ui — browser <script type="module"> entry.
 * The built dist/cgo-ui.js can be loaded from the NPM package or a versioned CDN.
 */
export * from './index.js';
import { installGlobalShim } from './shim/cgo-global.js';
import { initTheme } from './theme.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initTheme();
    installGlobalShim(window);
}
