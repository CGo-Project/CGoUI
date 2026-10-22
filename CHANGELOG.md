# Changelog

## 2.2.1 - 2026-10-22

- 修复玻璃嵌套场景下（如菜单栏内下拉菜单按钮）下拉菜单出现玻璃效果丢失与阴影显示错误的问题。
- 下拉菜单及选择器改用 `position: fixed` + 精确位置计算，脱离父容器 `backdrop-filter` 裁剪平面。
- 移除 `--glass-shadow` 的 `inset` 阴影，改由 `::before` 微光圈层统一承载，防止图层漂移。
- 修复 Shadow DOM 中 SVG 滤镜引用失败问题，通过 CSS 变量 `--glass-refraction-filter` 穿透继承。
- `<cgo-button>` 扩展支持 `secondary` 语义别名，自动匹配次级按钮样式。
- `<cgo-badge>` 扩展支持 `brand-*` 品牌子系统渐变样式自动解析。
- `cgo_clr.css` 补齐 `--text-secondary` 颜色 Token。

## 2.2.0 - 2026-10-19

- 全面升级液态玻璃（Liquid Glass）视觉系统与滤镜规范，支持动态高斯模糊与微光反射层。
- 标题栏支持分体浮动双岛（2.0 `header-mode="floating"`）与合并吸顶（1.0 `header-mode="classic"`）双模式，并支持 HTML 声明式配置。
- 页面模板体系优化（info_template、tool_template、ribbon_template），支持抗闪烁与防布局跳动。
- 明暗主题切换按钮微光质感与按压反馈重构，严格保持设计系统基础圆角规范（4px）。
- 动效Token全面对齐 Emil Kowalski 交互物理弹簧与平滑退出规范。

## 2.1.0 - 2026-08-06

- 将 CGoUI 源码、主题样式、文档和发布产物迁移为独立仓库结构。
- 构建产物统一写入 `dist/`，不再依赖宿主项目的 `cgoui/` 目录。
- 修复主题引擎对仓库外部 CSS 路径的隐式依赖，安装后可以直接使用。
- 增加 NPM、CDN、打包检查、烟囱测试和发布脚本。
- 将备案、版权等宿主应用信息改为可配置的兼容垫片，不再写死在通用组件库中。

## 2.0.9

- 现有公开 NPM 版本，保留原有组件 API 和 React 入口。
