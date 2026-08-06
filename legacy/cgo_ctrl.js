/*!
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         CGo UI Library — cgo_ctrl.js                        ║
 * ║         交互控制器 (Interactive Controller)                  ║
 * ║                                                              ║
 * ║  版本：1.0.0 · 2026-06                                       ║
 * ║  作者：Central Go / NaL                                      ║
 * ║                                                              ║
 * ║  用法：在 body 末尾，tool-theme.js / cgo_icons.js 之后引入   ║
 * ║        <script src="../cgoui/cgo_ctrl.js"></script>          ║
 * ║                                                              ║
 * ║  提供功能：                                                   ║
 * ║    1. CGO.initDropdowns(root?)                               ║
 * ║       — 自动管理页面内所有 .dropdown 的互斥展开 / 收起        ║
 * ║         · 点击触发按钮 (.dropbtn)：toggle 当前、关闭其余      ║
 * ║         · 点击菜单内任意链接或按钮：关闭当前                  ║
 * ║         · 点击页面任意空白处：关闭所有                        ║
 * ║         · 展开状态 class：dropdown-content.show              ║
 * ║                                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

(function (global) {
    'use strict';

    /* =====================================================
       §1  内部工具函数
       ===================================================== */

    /**
     * 关闭 root 范围内所有展开的下拉菜单，可选排除某一个。
     * @param {Element} root
     * @param {Element} [exclude]  排除的 .dropdown-content 元素
     */
    function _closeAll(root, exclude) {
        var opened = root.querySelectorAll('.dropdown-content.show');
        for (var i = 0; i < opened.length; i++) {
            if (opened[i] !== exclude) {
                opened[i].classList.remove('show');
            }
        }
    }

    /* =====================================================
       §2  下拉菜单控制器
       ===================================================== */

    /**
     * CGO.initDropdowns(root?)
     *
     * 初始化 root 范围内所有 .dropdown 的完整交互逻辑：
     *   - .dropbtn      : 点击触发器（可以是 button / a 等）
     *   - .dropdown-content : 展开内容容器
     *   - .dropdown-content a / button : 点击后自动关闭菜单
     *
     * @param {Element|Document} [root=document]
     */
    function initDropdowns(root) {
        root = root || document;

        var dropdowns = root.querySelectorAll('.dropdown');

        for (var i = 0; i < dropdowns.length; i++) {
            (function (dropdown) {
                var trigger = dropdown.querySelector('.dropbtn');
                var content = dropdown.querySelector('.dropdown-content');
                if (!trigger || !content) return;

                // 点击触发器：toggle 自身，同时关闭其余
                trigger.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var willOpen = !content.classList.contains('show');
                    _closeAll(root instanceof Document ? document.body : root);
                    if (willOpen) {
                        content.classList.add('show');
                    }
                });

                // 点击菜单内的选项后自动收起
                var items = content.querySelectorAll('a, button');
                for (var j = 0; j < items.length; j++) {
                    items[j].addEventListener('click', function () {
                        content.classList.remove('show');
                    });
                }
            })(dropdowns[i]);
        }

        // 点击页面任意空白处关闭所有下拉菜单（仅绑定一次）
        if (!root._cgoDropdownOutsideInit) {
            root._cgoDropdownOutsideInit = true;
            var outsideTarget = root instanceof Document ? document : root;
            outsideTarget.addEventListener('click', function () {
                _closeAll(root instanceof Document ? document.body : root);
            });
        }
    }

    /* =====================================================
       §3  界面外观控制器 (Theme Switcher Control)
       ===================================================== */

    /**
     * CGO.getThemeSettingHTML()
     *
     * 返回标准化的“界面外观”设置行的 HTML 模板（包含说明与 select 下拉框）。
     * @returns {string}
     */
    function getThemeSettingHTML(isEnglish) {
        var title = isEnglish ? 'Appearance' : '界面外观';
        var desc = isEnglish ? 'Dark or light UI style' : '软件界面的深色或浅色风格';
        var optSys = isEnglish ? 'System' : '跟随系统';
        var optLight = isEnglish ? 'Light' : '亮色';
        var optDark = isEnglish ? 'Dark' : '暗色';

        return (
            '<div class="help-setting-row">' +
            '    <div>' +
            '        <h4>' +
            title +
            '</h4>' +
            '        <p>' +
            desc +
            '</p>' +
            '    </div>' +
            '    <div>' +
            '        <select id="js-theme-select" class="help-setting-select">' +
            '            <option value="system">' +
            optSys +
            '</option>' +
            '            <option value="light">' +
            optLight +
            '</option>' +
            '            <option value="dark">' +
            optDark +
            '</option>' +
            '        </select>' +
            '    </div>' +
            '</div>'
        );
    }

    /**
     * CGO.bindThemeSelect(selectElement)
     *
     * 绑定主题选择下拉菜单的初始化与改变事件：
     *   - 自动回显并同步 localStorage 中的设置值。
     *   - 自动计算隔离前缀（支持 vitool / wall / stasign 等工具前缀独立存储）。
     *   - 触发切换时自动更新全局主题并广播给子 Iframe。
     *
     * @param {Element} selectElement
     */
    function bindThemeSelect(selectElement) {
        if (!selectElement) return;

        // 自动识别工具前缀隔离 Local Storage 主题键值
        var prefix = '';
        try {
            var path = window.location.pathname;
            var filename = path.split('/').pop().replace('.html', '');
            // 与 cgo_theme.js 保持同步
            var validApps = [
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
        var storageKey = prefix + 'app-theme';

        // 1. 初始化回显值
        var savedTheme = localStorage.getItem(storageKey);
        if (savedTheme === 'light') {
            selectElement.value = 'light';
        } else if (savedTheme === 'dark') {
            selectElement.value = 'dark';
        } else {
            selectElement.value = 'system';
        }

        // 2. 绑定选择变更监听
        selectElement.addEventListener('change', function (e) {
            var value = e.target.value;
            if (value === 'system') {
                localStorage.removeItem(storageKey);
                var sysTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                if (global.ToolTheme && global.ToolTheme.applyTheme) {
                    global.ToolTheme.applyTheme(sysTheme);
                }
            } else {
                localStorage.setItem(storageKey, value);
                if (global.ToolTheme && global.ToolTheme.applyTheme) {
                    global.ToolTheme.applyTheme(value);
                }
            }
        });
    }

    /* =====================================================
       §4  全局 短消息提示 (CGO.showToast)
       ===================================================== */

    /**
     * CGO.showToast(message, type?)
     *
     * 在页面底部弹出统一的 短消息提示。
     * 依赖 cgo_element.css §11 中定义的 .toast-container / .toast 样式。
     * 调用前确保页面中存在 id="toast-container" 的容器元素，否则将自动创建。
     *
     * @param {string} message   提示文字
     * @param {'info'|'success'|'error'|'warning'} [type='info']  类型
     * @param {number} [duration=3000]  显示时长（ms）
     */
    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;

        // 获取或创建容器
        var container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        var toast = document.createElement('div');
        var cls = 'toast';
        if (type === 'success') cls += ' toast-success';
        else if (type === 'error') cls += ' toast-danger';
        else if (type === 'warning') cls += ' toast-warning';
        toast.className = cls;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(function () {
            if (container.contains(toast)) container.removeChild(toast);
        }, duration);
    }

    /* =====================================================
       §5  统一全站帮助弹窗 (CGO.showHelpModal)
       ===================================================== */

    /**
     * CGO.showHelpModal(options)
     *
     * 统一的全站帮助与选项弹窗生成器。
     *
     * @param {Object} options 弹窗配置项
     * @param {string} [options.title] 标题文字（允许含 HTML）
     * @param {string} [options.subtitle] 副标题/更新日期（允许含 HTML）
     * @param {string} [options.iconPath] 顶部图标图片路径
     * @param {string} [options.content] 弹窗内部中间的内容（HTML 字符串）
     * @param {string} [options.beianPath] 备案图标路径（默认 '../beian.png'）
     * @param {string} [options.maxWidth='420px'] 弹窗最大宽度
     */
    function showHelpModal(options) {
        options = options || {};
        var title = options.title || '帮助与选项';
        var subtitle = options.subtitle || '';
        var iconHtml = options.iconPath ? '<img src="' + options.iconPath + '" class="help-icon-img" alt="Logo">' : '';
        var beianPath = options.beianPath || '../beian.png';
        var contentHtml = options.content || '';
        var maxWidth = options.maxWidth || '420px';
        var isEnglish = !!options.isEnglish;

        var themeHtml = typeof getThemeSettingHTML === 'function' ? getThemeSettingHTML(isEnglish) : '';

        var overlay = document.createElement('div');
        overlay.className = 'help-overlay';

        var dialog = document.createElement('div');
        dialog.className = 'text-dialog help-dialog';
        dialog.style.maxWidth = maxWidth;

        var closeBtn = document.createElement('button');
        closeBtn.className = 'dialog-close-btn';
        closeBtn.innerHTML = '&times;';

        var container = document.createElement('div');
        container.className = 'help-container';

        var headerHtml =
            '<div class="help-header">' +
            iconHtml +
            '<div class="help-title-group">' +
            '<h3>' +
            title +
            '</h3>' +
            (subtitle ? '<p>' + subtitle + '</p>' : '') +
            '</div>' +
            '</div>';

        var footerHtml =
            '<div class="help-footer">' +
            '<div class="help-footer-content">' +
            '<span>Copyright &copy; 2026 Central Go</span>' +
            '<a href="https://beian.miit.gov.cn/" target="_blank">京ICP备2023014659号</a>' +
            '<div class="help-beian-group">' +
            '<img src="' +
            beianPath +
            '" alt="备案" class="help-beian-icon">' +
            '<a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010802042299" target="_blank">京公网安备11010802042299号</a>' +
            '</div>' +
            '</div>' +
            '</div>';

        container.innerHTML = headerHtml + themeHtml + contentHtml + footerHtml;

        dialog.appendChild(closeBtn);
        dialog.appendChild(container);
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        var themeSelect = dialog.querySelector('#js-theme-select');
        if (themeSelect && typeof bindThemeSelect === 'function') {
            bindThemeSelect(themeSelect);
        }

        var close = function () {
            overlay.classList.add('closing');
            dialog.classList.add('closing');
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
            }, 200);
        };
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });
    }

    /* =====================================================
       §6  验证码生成器 (SVG Captcha Generator)
       ===================================================== */

    /**
     * CGO.generateCaptcha()
     *
     * 纯前端生成 SVG 计算题验证码。
     *
     * @returns {{ svg: string, answer: string }}
     */
    function generateCaptcha() {
        var num1 = Math.floor(Math.random() * 10) + 1;
        var num2 = Math.floor(Math.random() * 10) + 1;
        var operators = ['+', '-'];
        var op = operators[Math.floor(Math.random() * operators.length)];
        var text = '';
        var answer = 0;
        if (op === '+') {
            text = num1 + ' + ' + num2 + ' = ?';
            answer = num1 + num2;
        } else {
            var max = Math.max(num1, num2);
            var min = Math.min(num1, num2);
            text = max + ' - ' + min + ' = ?';
            answer = max - min;
        }

        var width = 120;
        var height = 36;

        // 干扰线
        var lines = '';
        for (var i = 0; i < 3; i++) {
            var x1 = Math.floor(Math.random() * width);
            var y1 = Math.floor(Math.random() * height);
            var x2 = Math.floor(Math.random() * width);
            var y2 = Math.floor(Math.random() * height);
            var strokeColor =
                'rgb(' +
                (Math.floor(Math.random() * 120) + 50) +
                ',' +
                (Math.floor(Math.random() * 120) + 50) +
                ',' +
                (Math.floor(Math.random() * 120) + 50) +
                ')';
            lines +=
                '<line x1="' +
                x1 +
                '" y1="' +
                y1 +
                '" x2="' +
                x2 +
                '" y2="' +
                y2 +
                '" stroke="' +
                strokeColor +
                '" stroke-width="1.5" />';
        }

        // 随机噪点
        var dots = '';
        for (var i = 0; i < 30; i++) {
            var cx = Math.floor(Math.random() * width);
            var cy = Math.floor(Math.random() * height);
            var r = Math.random() * 1.2 + 0.4;
            var fillColor =
                'rgb(' +
                (Math.floor(Math.random() * 150) + 50) +
                ',' +
                (Math.floor(Math.random() * 150) + 50) +
                ',' +
                (Math.floor(Math.random() * 150) + 50) +
                ')';
            dots += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fillColor + '" />';
        }

        // 扭曲旋转文本字符
        var chars = text.split(' ');
        var textElements = '';
        var startX = 12;
        for (var i = 0; i < chars.length; i++) {
            var char = chars[i];
            var rot = Math.floor(Math.random() * 24) - 12; // -12 to 12 deg
            var dy = Math.floor(Math.random() * 8) - 4; // -4 to 4 px
            var textColor =
                'rgb(' +
                Math.floor(Math.random() * 120) +
                ',' +
                Math.floor(Math.random() * 120) +
                ',' +
                Math.floor(Math.random() * 120) +
                ')';
            textElements +=
                '<text x="' +
                startX +
                '" y="' +
                (25 + dy) +
                '" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="' +
                textColor +
                '" transform="rotate(' +
                rot +
                ', ' +
                (startX + 5) +
                ', ' +
                (22 + dy) +
                ')">' +
                char +
                '</text>';
            startX += char.length * 10 + 6;
        }

        var svg =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
            width +
            ' ' +
            height +
            '" style="background-color: #f3f4f6; border-radius: 4px; user-select: none; width: 100%; height: 100%; display: block;">' +
            lines +
            textElements +
            dots +
            '</svg>';

        return {
            svg: svg,
            answer: String(answer),
        };
    }

    /**
     * CGO.bindCaptchaZoom(zoomBtn, container, options)
     *
     * 绑定验证码放大镜交互逻辑，并自动管理放大/缩小的延迟定时器。
     *
     * @param {HTMLElement|string} zoomBtn - 放大镜按钮元素或其选择器/ID
     * @param {HTMLElement|string} container - 验证码图片容器元素或其选择器/ID
     * @param {Object} [options] - 选项配置
     * @param {number} [options.duration=8000] - 放大自动缩小的延迟时间(毫秒)
     * @param {string} [options.zoomClass='auth-captcha-zoomed'] - 放大时添加的CSS类名
     * @returns {{ destroy: Function, reset: Function }} 控制句柄
     */
    function bindCaptchaZoom(zoomBtn, container, options) {
        options = options || {};
        var duration = typeof options.duration === 'number' ? options.duration : 8000;
        var zoomClass = options.zoomClass || 'auth-captcha-zoomed';

        var btnEl = typeof zoomBtn === 'string' ? document.querySelector(zoomBtn) : zoomBtn;
        var containerEl = typeof container === 'string' ? document.querySelector(container) : container;

        if (!btnEl || !containerEl) return null;

        var timer = null;

        function reset() {
            if (containerEl.classList.contains(zoomClass)) {
                containerEl.classList.remove(zoomClass);
            }
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }

        function clickHandler(e) {
            e.stopPropagation();
            if (containerEl.classList.contains(zoomClass)) {
                reset();
            } else {
                containerEl.classList.add(zoomClass);
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    reset();
                }, duration);
            }
        }

        btnEl.addEventListener('click', clickHandler);

        return {
            destroy: function () {
                btnEl.removeEventListener('click', clickHandler);
                reset();
            },
            reset: reset,
        };
    }

    /* =====================================================
       §7  注册到全局 CGO 命名空间
       ===================================================== */
    global.CGO = global.CGO || {};
    global.CGO.initDropdowns = initDropdowns;
    global.CGO.getThemeSettingHTML = getThemeSettingHTML;
    global.CGO.bindThemeSelect = bindThemeSelect;
    global.CGO.showToast = showToast;
    global.CGO.showHelpModal = showHelpModal;
    global.CGO.generateCaptcha = generateCaptcha;
    global.CGO.bindCaptchaZoom = bindCaptchaZoom;

    /* ── DOMContentLoaded 后自动初始化页面内所有下拉菜单 ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initDropdowns(document);
        });
    } else {
        initDropdowns(document);
    }
})(typeof window !== 'undefined' ? window : this);
