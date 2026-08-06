import React from 'react';
import { createComponent } from '@lit/react';

import { CgoIcon as CgoIconClass } from './components/icon.js';
import { CgoButton as CgoButtonClass } from './components/button.js';
import { CgoBadge as CgoBadgeClass } from './components/badge.js';
import { CgoInput as CgoInputClass } from './components/input.js';
import { CgoCard as CgoCardClass } from './components/card.js';
import { CgoTable as CgoTableClass } from './components/table.js';
import { CgoMediaViewer as CgoMediaViewerClass } from './components/media-viewer.js';
import { CgoFloatingWindow as CgoFloatingWindowClass } from './components/floating-window.js';
import { CgoAdminSelect as CgoAdminSelectClass } from './components/admin-select.js';
import { CgoPreferenceItem as CgoPreferenceItemClass } from './components/preference-item.js';
import { CgoLineBadge as CgoLineBadgeClass } from './components/line-badge.js';
import { CgoLevelCard as CgoLevelCardClass } from './components/level-card.js';
import { CgoSpinner as CgoSpinnerClass } from './components/spinner.js';
import { CgoToast as CgoToastClass } from './components/toast.js';
import { CgoTooltip as CgoTooltipClass } from './components/tooltip.js';
import { CgoDropdown as CgoDropdownClass } from './components/dropdown.js';
import { CgoModal as CgoModalClass } from './components/modal.js';
import { CgoTabs as CgoTabsClass, CgoTab as CgoTabClass } from './components/tabs.js';
import { CgoAvatar as CgoAvatarClass } from './components/avatar.js';
import { CgoChatBubble as CgoChatBubbleClass } from './components/chat-bubble.js';
import { CgoCaptcha as CgoCaptchaClass } from './components/captcha.js';
import { CgoThemeToggle as CgoThemeToggleClass } from './components/theme-toggle.js';
import { CgoSideNav as CgoSideNavClass, CgoNavItem as CgoNavItemClass } from './components/side-nav.js';
import { CgoToolbarSelect as CgoToolbarSelectClass } from './components/toolbar-select.js';
import { CgoNoticeCard as CgoNoticeCardClass } from './components/notice-card.js';
import { CgoNoticeCenter as CgoNoticeCenterClass } from './components/notice-center.js';
import { CgoNoticePopup as CgoNoticePopupClass, showNoticePopup } from './components/notice-popup.js';

export const CgoIcon = createComponent({ react: React, tagName: 'cgo-icon', elementClass: CgoIconClass });
export const CgoButton = createComponent({ react: React, tagName: 'cgo-button', elementClass: CgoButtonClass });
export const CgoBadge = createComponent({ react: React, tagName: 'cgo-badge', elementClass: CgoBadgeClass });

export const CgoInput = createComponent({
    react: React,
    tagName: 'cgo-input',
    elementClass: CgoInputClass,
    events: {
        oncgoinput: 'cgo-input',
    },
});

export const CgoCard = createComponent({ react: React, tagName: 'cgo-card', elementClass: CgoCardClass });
export const CgoTable = createComponent({ react: React, tagName: 'cgo-table', elementClass: CgoTableClass });
export const CgoMediaViewer = createComponent({
    react: React,
    tagName: 'cgo-media-viewer',
    elementClass: CgoMediaViewerClass,
});

export const CgoFloatingWindow = createComponent({
    react: React,
    tagName: 'cgo-floating-window',
    elementClass: CgoFloatingWindowClass,
    events: {
        oncgodragstart: 'cgo-dragstart',
        oncgodrag: 'cgo-drag',
        oncgodragend: 'cgo-dragend',
        oncgominimize: 'cgo-minimize',
        oncgoclose: 'cgo-close',
    },
});

export const CgoAdminSelect = createComponent({
    react: React,
    tagName: 'cgo-admin-select',
    elementClass: CgoAdminSelectClass,
    events: {
        oncgoadminchange: 'cgo-admin-change',
    },
});

export const CgoPreferenceItem = createComponent({
    react: React,
    tagName: 'cgo-preference-item',
    elementClass: CgoPreferenceItemClass,
    events: {
        oncgopreferenceaction: 'cgo-preference-action',
    },
});

export const CgoLineBadge = createComponent({
    react: React,
    tagName: 'cgo-line-badge',
    elementClass: CgoLineBadgeClass,
});
export const CgoLevelCard = createComponent({
    react: React,
    tagName: 'cgo-level-card',
    elementClass: CgoLevelCardClass,
});
export const CgoSpinner = createComponent({
    react: React,
    tagName: 'cgo-spinner',
    elementClass: CgoSpinnerClass,
    events: {
        oncgoprogresschange: 'cgo-progress-change',
        oncgoprogresscomplete: 'cgo-progress-complete',
    },
});
export const CgoToast = createComponent({ react: React, tagName: 'cgo-toast', elementClass: CgoToastClass });
export const CgoTooltip = createComponent({ react: React, tagName: 'cgo-tooltip', elementClass: CgoTooltipClass });

export const CgoDropdown = createComponent({
    react: React,
    tagName: 'cgo-dropdown',
    elementClass: CgoDropdownClass,
    events: {
        oncgochange: 'cgo-change',
    },
});

export const CgoModal = createComponent({
    react: React,
    tagName: 'cgo-modal',
    elementClass: CgoModalClass,
    events: {
        oncgoclose: 'cgo-close',
    },
});

export const CgoTab = createComponent({ react: React, tagName: 'cgo-tab', elementClass: CgoTabClass });

export const CgoTabs = createComponent({
    react: React,
    tagName: 'cgo-tabs',
    elementClass: CgoTabsClass,
    events: {
        oncgotabchange: 'cgo-tab-change',
    },
});

export const CgoAvatar = createComponent({ react: React, tagName: 'cgo-avatar', elementClass: CgoAvatarClass });
export const CgoChatBubble = createComponent({
    react: React,
    tagName: 'cgo-chat-bubble',
    elementClass: CgoChatBubbleClass,
});

export const CgoCaptcha = createComponent({
    react: React,
    tagName: 'cgo-captcha',
    elementClass: CgoCaptchaClass,
    events: {
        oncgocaptcharefresh: 'cgo-captcha-refresh',
    },
});

export const CgoThemeToggle = createComponent({
    react: React,
    tagName: 'cgo-theme-toggle',
    elementClass: CgoThemeToggleClass,
});

export const CgoSideNav = createComponent({ react: React, tagName: 'cgo-side-nav', elementClass: CgoSideNavClass });
export const CgoNavItem = createComponent({ react: React, tagName: 'cgo-nav-item', elementClass: CgoNavItemClass });

export const CgoToolbarSelect = createComponent({
    react: React,
    tagName: 'cgo-toolbar-select',
    elementClass: CgoToolbarSelectClass,
    events: {
        oncgochange: 'cgo-change',
    },
});

export const CgoNoticeCard = createComponent({
    react: React,
    tagName: 'cgo-notice-card',
    elementClass: CgoNoticeCardClass,
    events: {
        oncgonoticeclose: 'cgo-notice-close',
        oncgonoticeaction: 'cgo-notice-action',
    },
});

export const CgoNoticeCenter = createComponent({
    react: React,
    tagName: 'cgo-notice-center',
    elementClass: CgoNoticeCenterClass,
    events: {
        oncgonoticeclear: 'cgo-notice-clear',
        oncgonoticemutetoggle: 'cgo-notice-mute-toggle',
        oncgonoticeaction: 'cgo-notice-action',
    },
});

export const CgoNoticePopup = createComponent({
    react: React,
    tagName: 'cgo-notice-popup',
    elementClass: CgoNoticePopupClass,
    events: {
        oncgopopupclose: 'cgo-popup-close',
        oncgopopupaction: 'cgo-popup-action',
    },
});

export { showToast } from './components/toast.js';
export { showNoticePopup } from './components/notice-popup.js';
export { generateCaptcha } from './components/captcha.js';
export { ICONS, buildSvg, iconNames } from './icons/icons.js';
export * as theme from './theme.js';
