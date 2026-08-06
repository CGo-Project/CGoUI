/* cgo_theme.js — CGo UI Library
 * 功能：明暗主题切换 + iframe 嵌入检测
 *   - 点击切换主题，长按 800ms 恢复跟随系统
 *   - 支持 iframe 跨窗口主题同步（postMessage）
 *   - 支持 ?embed=vitool-hide 参数隐藏 Header
 *
 * 用法：<script src="../cgoui/cgo_theme.js"></script>
 *       页面中必须存在 id="theme-toggle-btn" 的按钮
 */
(function () {
    'use strict';

    const BTN_ID = 'theme-toggle-btn';

    /* ── 自动识别工具前缀以隔离 localStorage ── */
    let prefix = '';
    try {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        // 维护需要独立存储主题的工具列表
        const validApps = [
            'vitool',
            'wall',
            'stasign',
            'staline',
            'project',
            'cgoauth',
            'mc',
            'enmap',
            'guide',
            'timetable',
        ];
        if (validApps.includes(filename)) {
            prefix = filename + '_';
        }
    } catch (e) {}

    const STORAGE_KEY = prefix + 'app-theme';
    const TOOLTIP_ID = 'theme-reset-tooltip';

    /* ── 主题图标路径 ── */
    // 亮色时显示"太阳"图标，暗色时显示"月亮"图标
    const ICON_SUN =
        '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
    const ICON_MOON =
        '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';

    /* =====================================================
       §1  主题应用
       ===================================================== */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateIcon(theme);

        // 若是顶层窗口，向所有 iframe 广播主题变更
        if (window.self === window.top) {
            document.querySelectorAll('iframe').forEach((iframe) => {
                try {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage({ type: 'theme-change', theme }, '*');
                    }
                } catch (e) {}
            });
        }
    }

    /* =====================================================
       §2  图标更新
       ===================================================== */
    function updateIcon(theme) {
        const btn = document.getElementById(BTN_ID);
        if (!btn) return;
        const svg = btn.querySelector('.btn-icon');
        if (svg) {
            svg.innerHTML = theme === 'dark' ? ICON_MOON : ICON_SUN;
        }
    }

    /* =====================================================
       §3  提示框
       ===================================================== */
    function showTooltip(text) {
        let tooltip = document.getElementById(TOOLTIP_ID);
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = TOOLTIP_ID;
            document.body.appendChild(tooltip);
        }
        tooltip.innerText = text;
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 2000);
    }

    /* =====================================================
       §4  按钮交互绑定（点击切换 + 长按恢复系统）
       ===================================================== */
    function bindThemeButton() {
        const btn = document.getElementById(BTN_ID);
        if (!btn) return;

        let pressTimer = null;
        let isLongPress = false;

        const startPress = (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return; // 仅左键
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                localStorage.removeItem(STORAGE_KEY);
                const sysTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                applyTheme(sysTheme);
                showTooltip('已恢复系统明暗模式');
                if (navigator.vibrate) navigator.vibrate(50);
            }, 800);
        };

        const cancelPress = () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        };

        const handleClick = (e) => {
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
                isLongPress = false;
                return;
            }
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
        };

        // 禁用右键菜单（防止移动端长按弹出浏览器默认菜单）
        btn.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        btn.addEventListener('pointerdown', startPress);
        btn.addEventListener('pointerup', cancelPress);
        btn.addEventListener('pointerleave', cancelPress);
        btn.addEventListener('pointercancel', cancelPress);
        btn.addEventListener('click', handleClick);
    }

    /* =====================================================
       §5  iframe 嵌入检测（?embed=vitool-hide 隐藏 Header）
       ===================================================== */
    function checkEmbedMode() {
        let shouldHide = false;

        // 方式1：URL 参数
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('embed') === 'vitool-hide') shouldHide = true;
        } catch (e) {}

        // 方式2：父窗口标志位
        try {
            if (window.parent.isViToolHideHeader) shouldHide = true;
        } catch (e) {}

        if (shouldHide) {
            const style = document.createElement('style');
            style.innerText = '.tool-header, .bottom-bar, .status-bar { display: none !important; }';
            document.head.appendChild(style);
            document.documentElement.classList.add('is-iframe-vitool-hidden');
        }
    }

    /* =====================================================
       §6  跨窗口主题消息监听（iframe 子窗口侧）
       ===================================================== */
    function initMessageListener() {
        // 接收父窗口推送的主题变更消息
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'theme-change') {
                applyTheme(e.data.theme);
            }
        });

        // 主动尝试从父窗口同步当前主题
        if (window.self !== window.top) {
            try {
                const parentTheme = window.parent.document.documentElement.getAttribute('data-theme');
                if (parentTheme) {
                    setTimeout(() => applyTheme(parentTheme), 50);
                }
            } catch (e) {
                // 跨域时主动请求
                try {
                    window.parent.postMessage({ type: 'theme-request' }, '*');
                } catch (_) {}
            }
        }
    }

    /* =====================================================
       §7  初始化入口
       ===================================================== */
    function initTheme() {
        const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const getPreferredTheme = () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return saved;
            return systemDarkQuery.matches ? 'dark' : 'light';
        };

        // 立即应用主题（防止闪烁）
        applyTheme(getPreferredTheme());

        // 监听系统主题变化（仅在未手动设置时生效）
        systemDarkQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        // DOM ready 后绑定按钮
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindThemeButton);
        } else {
            bindThemeButton();
        }
    }

    /* ── 执行 ── */
    checkEmbedMode();
    initMessageListener();
    initTheme();

    /* ── 暴露给外部调用 ── */
    window.ToolTheme = { applyTheme };
})();
