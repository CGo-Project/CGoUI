import { ICONS as INTERNAL_ICONS } from '../icons/icons.js';
import {
    configureGlobalShim,
    installGlobalShim as installLegacyGlobalShim,
} from './cgo-global.js';

const REMOVED_ICON_NAMES = ['bjsubway'];

/**
 * Install the compatibility globals after removing operator-specific legacy
 * icons from the shared internal registry. This keeps the old global API while
 * ensuring removed marks are not exposed through window.CGO.icon/iconNames.
 */
export function installGlobalShim(global) {
    for (const name of REMOVED_ICON_NAMES) delete INTERNAL_ICONS[name];
    return installLegacyGlobalShim(global);
}

export { configureGlobalShim };
