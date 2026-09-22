---
name: cgoui-distribution-framework
description: >-
  Builds, validates, and distributes the latest CGoUI design system and component bundles
  across diverse frontend architectural targets: CGo-OpenMap (pure static ESM + PWA offline cache),
  CGo-Web-Tools (Vite multi-page tool suite + flat compatibility files), CGo-Web-Tools/map
  (Next.js 16 Webpack + React 19 wrappers), and F_Space_Class (Next.js 15 Tailwind + public static assets).
  Use this skill whenever updating, building, or synchronizing CGoUI across multiple dependent repositories.
---

# CGoUI 跨项目构建与架构适配分发框架 (CGoUI Distribution Framework)

本 Skill 规范并沉淀了将 [CGoUI](file:///Users/liuzihan/Documents/GitHub/CGoUI) 构建产物按各接入项目的技术架构特性，进行全量验证、定制分发与缓存失效处理的标准化流程。

---

## 一、各项目架构与 CGoUI 消费特征矩阵

| 目标项目 | 前端架构体系 | CGoUI 消费模式 | 核心分发路径 | 缓存与生效机制 |
| :--- | :--- | :--- | :--- | :--- |
| **CGoUI** (上游源头) | Lit 3 + Vite 6 + 原生 Web Components | 核心编译源头 | `dist/`, `styles/`, `site/` | `npm run build && npm test && npm run check` |
| **CGo-OpenMap** | 纯静态 ESM + PWA Service Worker | 原生 ESM 模块 (`cgo-ui.js`) + 4 份标准 CSS | `core/cgo-ui.js`<br>`css/cgo_*.css` | 刷新全站 HTML `?v=YYMMDD.HHMM` 查询串；递增 `sw.js` 的 `CACHE_NAME` |
| **CGo-Web-Tools** | Vite 多页面套件 + 历史扁平兼容双轨 | `cgoui/` 展示目录 + 扁平兼容文件 + `node_modules` 本地包 | `cgoui/*`<br>`node_modules/@centralgo/cgo-ui` | 执行 `npm run sync:cgo-ui` 与 `npm run build:ui`；自动刷新 HTML 查询参数 |
| **CGo-Web-Tools/map** | Next.js 16 (App Router) + React 19 + TypeScript | `@centralgo/cgo-ui/react` 封装层 + CSS Variables | `map/node_modules/@centralgo/cgo-ui` | 运行 `map/scripts/ensure-cgo-ui-cache.mjs`，比对包内容 SHA-256 签名并清理 Next 开发缓存 |
| **F_Space_Class** | Next.js 15 (App Router) + Tailwind CSS + React 19 | `public/cgoui/` 静态提供 + Web Components | `web/public/cgoui/cgo-ui.js`<br>`web/public/cgoui/styles/*` | 执行 `npm run sync:cgo-ui`；执行 `npm run build` 进行生产静态渲染校验 |

---

## 二、标准化执行工作流 (Standard Runbook)

### 阶段 1：CGoUI 源码库构建与质量门禁

在对任何下游项目进行分发前，**必须首先**在 CGoUI 中完成编译与三道质量检查：

```bash
cd /Users/liuzihan/Documents/GitHub/CGoUI
npm run build && npm test && npm run check && npm run build:site
```

- **验证标准**：
  - `dist/cgo-ui.js`、`dist/cgo-ui-react.js`、`dist/theme.js` 重新生成且无报错；
  - `smoke-test.mjs` 全部通过（React、Theme、图标及 Vanilla bundle 导出完整）；
  - `check-package.mjs` 确认发包清单（16 个必需文件）完备；
  - `site/` 静态展示站点编译成功。

---

### 阶段 2：CGo-OpenMap 纯静态与 PWA 离线缓存适配

CGo-OpenMap 无生产构建打包器，由浏览器直接解析 ESM，且由 Service Worker 提供离线体验。

1. **拷贝核心产物与样式**：
   ```bash
   cp /Users/liuzihan/Documents/GitHub/CGoUI/dist/cgo-ui.js /Users/liuzihan/Documents/GitHub/CGo-OpenMap/core/cgo-ui.js
   cp /Users/liuzihan/Documents/GitHub/CGoUI/styles/cgo_clr.css /Users/liuzihan/Documents/GitHub/CGo-OpenMap/css/cgo_clr.css
   cp /Users/liuzihan/Documents/GitHub/CGoUI/styles/cgo_element.css /Users/liuzihan/Documents/GitHub/CGo-OpenMap/css/cgo_element.css
   cp /Users/liuzihan/Documents/GitHub/CGoUI/styles/cgo_ui.css /Users/liuzihan/Documents/GitHub/CGo-OpenMap/css/cgo_ui.css
   cp /Users/liuzihan/Documents/GitHub/CGoUI/styles/cgo_components.css /Users/liuzihan/Documents/GitHub/CGo-OpenMap/css/cgo_components.css
   ```

2. **版本号与 Service Worker 缓存刷新**：
   生成当前时间戳（例如 `260922.2336`）：
   - 更新 `CGo-OpenMap/sw.js` 中的 `const CACHE_NAME = 'cgo-openmap-v<TIMESTAMP>';`
   - 将下列 HTML 文件中的 `?v=<OLD>` 批量更新为 `?v=<TIMESTAMP>`：
     - `index.html`
     - `main.html`
     - `readme.html`
     - `privacy.html`
     - `city-editor/index.html`
     - `drunk/index.html`

3. **语法校验**：
   ```bash
   node -c /Users/liuzihan/Documents/GitHub/CGo-OpenMap/core/cgo-ui.js
   ```

---

### 阶段 3：CGo-Web-Tools 与 map 自动化同步

CGo-Web-Tools 项目内置了规范的同步管道，可一键完成主站与 map 子项目的产物投递。

1. **执行主站同步**：
   ```bash
   cd /Users/liuzihan/Documents/GitHub/CGo-Web-Tools
   npm run sync:cgo-ui
   npm run build:ui
   ```
   *该命令将自动更新 `cgoui/` 下的扁平兼容文件、展示目录、`node_modules` 以及全站 HTML 版本号。*

2. **运行 CGo-WM 窗体组件回归测试**：
   ```bash
   npm run test:cgo-wm
   ```

3. **Map 缓存签名失效**：
   在 `CGo-Web-Tools/map` 下运行：
   ```bash
   cd /Users/liuzihan/Documents/GitHub/CGo-Web-Tools/map
   node scripts/ensure-cgo-ui-cache.mjs
   ```
   *该脚本校验 SHA-256 签名，如变化将自动清除 Next.js 历史 Webpack 开发缓存。*

---

### 阶段 4：F_Space_Class 静态资源升级与工程验证

F_Space_Class 使用 Next.js 15 App Router，通过 `/public/cgoui/` 托管静态资源并在 `layout.tsx` 中直接引用 Web Components。

1. **执行同步脚本**：
   ```bash
   cd /Users/liuzihan/Documents/GitHub/F_Space_Class/web
   npm run sync:cgo-ui
   ```
   *如果脚本不存在，运行 [sync-cgo-ui.mjs](file:///Users/liuzihan/Documents/GitHub/F_Space_Class/web/scripts/sync-cgo-ui.mjs)。*

2. **Next.js 生产环境构建校验**：
   ```bash
   npm run build
   ```
   *确保 22+ 个静态与动态页面编译无类型错误、无 Hydration 异常。*

---

## 三、一键全项目分发助手脚本

框架提供了一个一键式批处理脚本：
👉 [sync-all.sh](./scripts/sync-all.sh)

可直接在终端中运行：
```bash
bash .agents/skills/cgoui-distribution-framework/scripts/sync-all.sh
```

---

## 四、排查与防坑指南 (Troubleshooting)

1. **Service Worker 强缓存导致页面未生效**：
   - 现象：修改了 CGoUI 样式或代码，在 CGo-OpenMap 手机端或浏览器上刷新无变化。
   - 根因：`sw.js` 内的 `CACHE_NAME` 未递增，Service Worker 返回了 Cache Storage 中的旧文件。
   - 解决：确认 `sw.js` 的 `CACHE_NAME` 已更新为最新时间戳版本。
2. **Next.js 报旧路径模块找不到 (Webpack Chunk Error)**：
   - 现象：在 `map` 或 `F_Space_Class` 开发/构建时报旧缓存错误。
   - 解决：运行 `node scripts/ensure-cgo-ui-cache.mjs`，或手动删除 `.next/dev` 与 `.next/cache`。
3. **`.img-icon-wrapper` 图片未渐进显示或透明占位不消失**：
   - 现象：纯静态页面或行内注入的图片图标为空白。
   - 解决：确认已同步包含 `7316800` 的最新 `cgo-ui.js`（含 `initImgIconWrappers` 监听器）和 `cgo_element.css`。
