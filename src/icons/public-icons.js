import {
    ICONS as INTERNAL_ICONS,
    buildSvg as internalBuildSvg,
    iconNames as internalIconNames,
    _escIcon,
} from './icons.js';

const REMOVED_ICON_NAMES = new Set(['bjsubway']);

/**
 * Public icon registry. Operator-specific legacy marks are intentionally
 * excluded from the supported CGoUI API surface.
 */
export const ICONS = Object.freeze(
    Object.fromEntries(Object.entries(INTERNAL_ICONS).filter(([name]) => !REMOVED_ICON_NAMES.has(name))),
);

export function buildSvg(name, opts = {}) {
    if (REMOVED_ICON_NAMES.has(name)) {
        console.warn('[CGO.icon] Removed operator-specific legacy icon: "' + name + '"');
        return '';
    }
    return internalBuildSvg(name, opts);
}

export function iconNames() {
    return internalIconNames().filter((name) => !REMOVED_ICON_NAMES.has(name));
}

export { _escIcon };
