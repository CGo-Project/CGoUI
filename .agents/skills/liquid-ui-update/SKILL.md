---
name: liquid-ui-update
description: >-
  CGoUI 2.1 次世代液态玻璃 (Liquid Glass) 与浮动双岛标题栏改造升级规范。
  适用于将 Central Go / CGo 网页工具升级为包含物理光学折射管线、4层立体堆叠架构、
  浮动双岛标题栏、移动端信号栏防穿透保护以及 640px 唯一响应式断点的全流程指南与速查手册。
---

# CGoUI 2.1 液态玻璃 (Liquid Glass) 升级技能手册

本技能详细记录了 Central Go 平台（如 `tool.html`、`CGo-OpenMap`）在推进 **CGoUI 2.1 次世代物理质感 UI** 时的核心设计体系、代码结构规范与迁移流程。

---

## 一、核心物理折射管线 (SVG Displacement Pipeline)

CGoUI 2.1 抛弃了传统简单的单层 `backdrop-filter: blur(...)`，引入了硬件加速的 SVG 光学微折射管线。

### 1. SVG 滤镜管线规范

在页面中，该滤镜由 `cgo-ui.js` 统一自动注入（ID 为 `glass-distortion`，挂载于 `#cgo-glass-svg`）。若在非模块环境下也可手动内嵌：

```html
<svg id="cgo-glass-svg" style="position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none;" aria-hidden="true">
    <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lighting-color="white" result="specLight">
            <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="12" xChannelSelector="R" yChannelSelector="G" />
    </filter>
</svg>
```

### 2. 滤镜参数说明
- **`feTurbulence`**：`0.01` 低频噪波，模拟真实玻璃表面平滑曲率波动；
- **`feGaussianBlur`**：高斯模糊贴图，去除毛刺；
- **`feSpecularLighting`**：在左上（`-200, -200, 300`）架设虚拟高维点光源，产生物理级镜面反光；
- **`feDisplacementMap`**：空间位置置换位移（`scale="12"`），生成微折射波纹。

---

## 二、四层立体堆叠架构 (Layered Compositing Hierarchy)

为解决“套滤镜导致文字发虚、图标模糊”的传统毛玻璃痛点，所有液态玻璃组件必须采用严格的 4 层立体分层（`isolation: isolate`）：

```
[z: 3 / relative] 内容渲染层 (.tool-content, 图标, 按钮)  ─── 绝对清晰锐利，不受滤镜干扰
[z: 2]            双轴微光圈层 (.element::before)          ─── 物理边缘导光与极细轮廓 (Rim Light)
[z: 1]            半透明底色衬底层 (.element::after)       ─── 浅色白琉璃 / 暗色曜石温润衬底
[z: 0]            光学折射磨砂层 (.liquid-glass-effect)    ─── 局部微折射滤镜扭曲与高饱和模糊
[容器]             .tool-card / .tool-item (border-radius, overflow: hidden)
```

### 核心参数标准（完全对齐 `tool.html`）

| 图层 | 角色 | 关键 CSS 声明 | 视觉表现 |
| :--- | :--- | :--- | :--- |
| **Layer 0** | 折射磨砂层 | `.liquid-glass-effect`<br>`backdrop-filter: blur(5px) saturate(130%) url(#glass-distortion)`<br>（较大面板使用 `blur(14px) saturate(135%) url(#glass-distortion)`） | 仅对容器下方元素产生微折射扭曲，不影响容器上方文字 |
| **Layer 1** | 半透明衬底层 | `.element::after`<br>浅色：`rgba(255, 255, 255, 0.60)`（hover: `0.68`）<br>深色：`rgba(31, 32, 34, 0.60)`（hover: `0.68`） | 提供温和微透底色，背景内容波动时文字对比度依然充足 |
| **Layer 2** | 双轴微光圈 | `.element::before`<br>`padding: 1px; mask-composite: exclude;`<br>双轴线性渐变（顶光 `--lg-rim-lit: 0.95`，暗色 `0.22`） | 消除脏灰边，模拟光线射入玻璃边缘产生的双轴折射光晕 |
| **Layer 3** | 内容渲染层 | `position: relative; z-index: 2;` | 原生锐利渲染，杜绝亚像素文字边缘发虚 |

---

## 三、液态玻璃卡片三档规范 (Glass Card Tier System)

> [!IMPORTANT]
> **禁止混用分档**：现有代码库中存在一层叠一层混用、透明度与折射强度要求不严格的问题。所有液态玻璃卡片必须按照本节规范严格归档，每一张卡片只能属于以下三档之一，禁止跨档混合使用。

### 档位概览

| 档位 | 类名 | 语义 | 透明度 | 交互反馈 | 典型示例 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier A** | `.tool-item` | **可交互卡片**（功能入口按钮） | 中低（`0.60` → hover `0.68`） | ✅ 高亮 + 轻微上移 | `tool.html` 工具网格卡片 |
| **Tier B** | `.glass-panel` | **不可交互底板**（分栏背景板） | 高（`0.82` → 无 hover 变化） | ❌ 完全禁止 | `CGo-OpenMap` 正文各分栏区块 |
| **Tier C** | `.glass-surface` | **不可交互强调板**（重要承载区） | 中（`0.72` → 无 hover 变化） | ❌ 完全禁止 | `tool.html` 浮动标题栏岛屿（`header-island`） |

---

### Tier A — 可交互卡片 (`.tool-item` / `.glass-card`)

**定位**：用途类似于「含详细信息的按钮/链接」，点击后跳转或触发操作。用户期望悬停时得到清晰的视觉反馈。

**视觉参数**：
| 状态 | Layer 1 衬底（亮色） | Layer 1 衬底（暗色） | Layer 0 折射 | Layer 2 微光圈 | 位移 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **静止** | `rgba(255,255,255, 0.60)` | `rgba(31,32,34, 0.60)` | `blur(5px) saturate(130%) url(#glass-distortion)` | `--lg-rim-lit: 0.95` | — |
| **悬停** | `rgba(255,255,255, 0.68)` | `rgba(38,40,44, 0.68)` | 同上不变 | 同上不变 | `translateY(-4px)` |

**CSS 实现规则**：
- 必须包含 `<div class="liquid-glass-effect"></div>` 作为 Layer 0；
- `::after` 承担 Layer 1 衬底，`hover::after` 提升不透明度；
- `transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)` 驱动悬停位移；
- 父容器必须是 `<a>` 或具备 `cursor: pointer` 的可点击元素。

**禁止事项**：
- ❌ 不能用于仅展示内容的静态区块（应使用 Tier B）；
- ❌ 不能在非链接/非按钮的 `div` 上添加 hover 位移。

---

### Tier B — 不可交互底板 (`.glass-panel`)

**定位**：充当页面分栏的背景基底，承载文字、数据图表、次级按钮等内容。本身不是交互目标。参考：`CGo-OpenMap/index.html` 正文各板块分栏。

**视觉参数**：
| 状态 | Layer 1 衬底（亮色） | Layer 1 衬底（暗色） | Layer 0 折射 | Layer 2 微光圈 | hover 变化 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **静止** | `rgba(255,255,255, 0.82)` | `rgba(31,32,34, 0.82)` | `blur(14px) saturate(135%) url(#glass-distortion)` | `--lg-rim-lit: 0.95`（弱化） | **无任何变化** |

**CSS 实现规则**：
```css
.glass-panel {
    /* 容器骨架 */
    position: relative;
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    isolation: isolate;
    box-shadow: var(--glass-shadow);

    /* Layer 0: 更强模糊，用 surface 规格 */
    backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
    -webkit-backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
}

/* Layer 1: 高不透明衬底，亮色 */
.glass-panel::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.82);
    pointer-events: none;
    /* ❌ 无 transition，无 hover 状态变化 */
}

[data-theme='dark'] .glass-panel::after,
:root:not([data-theme='light']) .glass-panel::after {
    background: rgba(31, 32, 34, 0.82);
}

/* Layer 3: 内容上浮 */
.glass-panel > * {
    position: relative;
    z-index: 2;
}
```

**禁止事项**：
- ❌ 禁止任何 `hover`、`focus`、`active` 引起的背景色、投影、位移、亮度变化；
- ❌ 禁止 `cursor: pointer`（除非内部有子元素需要交互）；
- ❌ 不要在 `.glass-panel` 内部再嵌套另一个 `.glass-panel`（禁止多层底板叠套）。

---

### Tier C — 不可交互强调板 (`.glass-surface`)

**定位**：用于重要的承载区（如标题栏岛屿、顶部浮动控制区、精选信息卡片等），比底板更具存在感，但仍是静态非交互载体。参考：`tool.html` 浮动标题栏 `.header-island`。

**视觉参数**：
| 状态 | Layer 1 衬底（亮色） | Layer 1 衬底（暗色） | Layer 0 折射 | Layer 2 微光圈 | hover 变化 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **静止** | `rgba(255,255,255, 0.72)` | `rgba(31,32,34, 0.72)` | `blur(14px) saturate(135%) url(#glass-distortion)` | `--lg-rim-lit: 0.95`（保留完整） | **无任何变化** |

**CSS 实现规则**：
```css
.glass-surface {
    position: relative;
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    isolation: isolate;
    box-shadow: var(--glass-shadow);
    backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
    -webkit-backdrop-filter: var(--glass-backdrop-blur-surface, blur(14px) saturate(135%));
}

.glass-surface::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.72);
    pointer-events: none;
    /* ❌ 无 transition，无 hover 状态变化 */
}

[data-theme='dark'] .glass-surface::after,
:root:not([data-theme='light']) .glass-surface::after {
    background: rgba(31, 32, 34, 0.72);
}

/* Layer 2: 完整双轴微光圈（与 Tier A 相同，但无 hover 变化） */
.glass-surface::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background:
        linear-gradient(to right,
            rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 0,
            rgba(0, 0, 0, 0) var(--lg-rim-side, 4px),
            rgba(0, 0, 0, 0) calc(100% - var(--lg-rim-side, 4px)),
            rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 100%),
        linear-gradient(to bottom,
            rgba(255, 255, 255, var(--lg-rim-lit, 0.95)) 0,
            rgba(255, 255, 255, var(--lg-rim-lit, 0.95)) var(--lg-rim-hold, 1px),
            rgba(255, 255, 255, 0) var(--lg-rim-fade, 12px),
            rgba(255, 255, 255, 0) calc(100% - var(--lg-rim-fade, 12px)),
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.4)) calc(100% - var(--lg-rim-hold, 1px)),
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.4)) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2;
    /* ❌ 无 transition */
}

.glass-surface > * {
    position: relative;
    z-index: 3;
}
```

**禁止事项**：
- ❌ 禁止任何 `hover` 引起的背景色、投影、位移变化；
- ❌ `.glass-surface` 与 `.glass-panel` 禁止嵌套（同档叠套破坏层级）；
- ✅ `.glass-surface` 内部可以放置 Tier A 的 `.tool-item` 或 `.glass-card`（强调面板内可以有可交互子卡片）。

---

### 三档对比速查表

| 特性 | Tier A `.tool-item` | Tier B `.glass-panel` | Tier C `.glass-surface` |
| :--- | :---: | :---: | :---: |
| **Layer 1 衬底不透明度（亮色）** | `0.60` → `0.68` | `0.82`（固定） | `0.72`（固定） |
| **Layer 0 折射强度** | `blur(5px)` + refraction | `blur(14px)` + refraction | `blur(14px)` + refraction |
| **悬停高亮** | ✅ 有 | ❌ 无 | ❌ 无 |
| **悬停位移** | ✅ `translateY(-4px)` | ❌ 无 | ❌ 无 |
| **双轴微光圈** | ✅ 完整 | ⚠️ 弱化（可选） | ✅ 完整 |
| **cursor** | `pointer` | `default` | `default` |
| **典型场景** | 功能卡片/工具入口 | 信息分栏/内容背板 | 标题栏/精选区/控件承载板 |
| **允许内部嵌套** | 不建议嵌套同类 | 可嵌套 Tier A | 可嵌套 Tier A |

---

## 四、桌面/移动同款浮动标题栏规范 (Floating Double-Island Header)

标题栏在桌面端和移动端均升级为同款的浮动架构。

> [!IMPORTANT]
> **无标题栏页面的保真原则（严禁硬加）**：
> - **如果原网页本身没有标题栏**（例如全屏沉浸式应用、特定展示屏、嵌入式组件页或无顶栏工具）：
>   - **严禁硬加浮动标题栏**：尊重原网页原本的页面格局与功能边界；
>   - **严禁硬加顶部的渐变**：不得在无标题栏的页面中注入顶部遮罩渐变（如 `body::before`、`.floating-header-scrim`），避免屏幕上方产生不自然的雾化带与遮挡；
>   - 此时仅需升级卡片的液态玻璃折射、优化视口安全区及响应式断点即可。

### 1. 标准 HTML 结构（仅适用于原页面具备标题栏的场景）

```html
<header class="tool-header">
    <!-- 左岛：导航与标题 -->
    <div class="header-island header-island-left">
        <div class="header-left">
            <button class="btn btn-info" onclick="history.back()" title="返回上一页">
                <cgo-icon name="back"></cgo-icon>
                <span>返回</span>
            </button>
            <a href="../tool.html" class="btn btn-primary" title="前往仪表盘">
                <cgo-icon name="home-dots"></cgo-icon>
                <span>仪表盘</span>
            </a>
        </div>
        <div class="header-island-divider" aria-hidden="true"></div>
        <div class="header-center">
            <div class="img-icon-wrapper header-logo-wrapper">
                <cgo-icon name="sparkle" class="icon-placeholder"></cgo-icon>
                <img src="./icon.png" alt="Logo" class="header-logo" loading="lazy" decoding="async">
            </div>
            <span class="app-title">页面标题</span>
        </div>
    </div>

    <!-- 右岛：操作与功能 -->
    <div class="header-island header-island-right">
        <div class="header-right">
            <!-- 业务快捷按钮 / 菜单 / 主题切换 -->
            <cgo-theme-toggle></cgo-theme-toggle>
        </div>
    </div>
</header>
```

### 2. 交互与响应式折叠逻辑
- **桌面端**：
  - `:root[header-mode="floating"]` 下，左岛与右岛在页面顶部呈双胶囊悬浮；
  - 拥有 `blur(14px) saturate(135%) url(#glass-distortion)` 液态玻璃透底；
  - 正文容器 `.tool-container` 自动增加 `padding-top: calc(env(safe-area-inset-top, 0px) + 84px)` 避让。
- **移动端（≤640px）**：
  - `.header-island` 自动声明 `display: contents !important`；
  - `.header-island-divider` 隐藏；
  - `.tool-header` 整体合并为一个单胶囊浮动药丸栏，居中贴合顶部安全区（`top: calc(env(safe-area-inset-top, 0px) + 16px)`）。

---

## 四、移动端异形屏与信号栏防穿透保护规范

参考 `CGo-OpenMap/index.html`，在移动端（iPhone 灵动岛、刘海屏及安卓挖孔屏）页面向上滚动时，防止正文穿透信号栏图标导致视觉杂乱。

### 1. 保护层元素
紧随 `<body>` 开始标签插入：
```html
<div class="mobile-status-bar-fill" aria-hidden="true"></div>
```

### 2. 保护层 CSS 机制（已内置于 `styles/cgo_ui.css`）
```css
.mobile-status-bar-fill {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: calc(constant(safe-area-inset-top, 0px) + 16px);
    height: calc(env(safe-area-inset-top, 0px) + 16px);
    background: linear-gradient(
        to bottom,
        var(--theme-bg, var(--bg-color, #f8f9fa)) constant(safe-area-inset-top, 0px),
        transparent calc(constant(safe-area-inset-top, 0px) + 16px)
    );
    background: linear-gradient(
        to bottom,
        var(--theme-bg, var(--bg-color, #f8f9fa)) env(safe-area-inset-top, 0px),
        transparent calc(env(safe-area-inset-top, 0px) + 16px)
    );
    z-index: 50001;
    pointer-events: none;
}
```
> **原理**：在 `0 ~ env(safe-area-inset-top)` 区域使用与页面背景同色的实体遮挡，下方附加 16px 渐变淡出，让滚动上去的内容自然消融在信号栏下方。已全局内置于 `CGoUI` 与 `CGo-Web-Tools` 的 `cgo_ui.css` 中。

---

## 五、响应式断点统一法则 (640px Single Breakpoint Rule)

1. **唯一断点**：所有 CSS 媒体查询仅保留 `@media (max-width: 640px)` 作为移动端切换点；
2. **禁止非标断点**：彻底移除 `480px`、`600px`、`720px`、`900px`、`1024px` 等历史遗留阶梯；
3. **视口元标签**：必须包含 `viewport-fit=cover`，以正确激活安全区环境变量：
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
   ```

---

## 六、页面升级快速检查清单 (Migration Checklist)

为任意页面执行 CGoUI 2.1 升级时，按以下清单逐项勾选：

- [ ] **1. `<html>` 标签配置**：
  `<html lang="zh-CN" header-mode="floating" glass-mode="liquid">`
- [ ] **2. 视口标签**：
  `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
- [ ] **3. 防闪烁脚本**（置于 `<head>` 顶部）：
  ```javascript
  (function () {
      var t = localStorage.getItem('app-theme');
      if (t) document.documentElement.setAttribute('data-theme', t);
      var hm = localStorage.getItem('root_cgo_header_mode') || localStorage.getItem('cgo_header_mode');
      if (hm) document.documentElement.setAttribute('header-mode', hm);
      var gm = localStorage.getItem('cgo_glass_mode');
      if (gm) document.documentElement.setAttribute('glass-mode', gm);
  })();
  ```
- [ ] **4. 信号栏保护层**：
  `<body>` 顶部插入 `<div class="mobile-status-bar-fill" aria-hidden="true"></div>`
- [ ] **5. 浮动双岛标题栏（依原页面情况而定）**：
  - **若原网页有标题栏**：将 `<header class="tool-header">` 组织为 `.header-island-left` 与 `.header-island-right` 双岛结构；
  - **若原网页没有标题栏**：**切勿硬加浮动标题栏，也切勿硬加顶部渐变**，完整保持原有的无标题沉浸界面。
- [ ] **6. 液态玻璃层注入**：
  在卡片（`.tool-card`、`.tool-item`、`.glass-card`）内部首行插入 `<div class="liquid-glass-effect"></div>`
- [ ] **7. 清理覆盖样式与双重边框**：
  移除旧样式的 `border: 1px solid ...`（必须显式设为 `border: none;`）与多余纯色/玻璃背景，交由 CGoUI 官方 4 层立体玻璃接管，杜绝双层边框重影与双重背景暗沉
- [ ] **8. 严禁面板套娃与多层重合**：
  确保工作区内只有一层最外层底板（Tier B），内部子区域采用无边框透明布局或纯色极微弱衬底，严禁大卡片套小卡片、面板套面板
- [ ] **9. 统一响应式断点**：
  检查所有媒体查询，统一使用 `@media (max-width: 640px)`。

---

## 七、严禁多层边框与面板重叠套娃红线 (Anti-Double-Border & Anti-Nesting Rules)

> [!CAUTION]
> **绝对设计红线**：严禁出现多层边框冲突（如实体 CSS 边框与微光圈叠出双线重影）、一层套一层（套娃式面板嵌套）以及多层半透明底板重合发黑的现象！

### 1. 严禁实体 CSS 边框与微光圈重合冲突 (No Double Borders)
- **成因机制**：CGoUI 的液态玻璃体系（Tier A `.tool-item` / `.glass-card`、Tier B `.glass-panel`、Tier C `.glass-surface`）自带 **Layer 2 微光圈**（通过 `::before` 伪元素、`padding: 1px` 与 `-webkit-mask` 双轴渐变实现的物理光学轮廓）。
- **冲突表现**：如果卡片容器或页面原有 CSS 规则（如 `.card`、`.panel`）又另外声明了 `border: 1px solid var(--border-color)`，由于实体边框占据外沿，`::before` 绝对定位到 padding-box，导致在圆角处形成 **1~2px 的双轨重叠（外层一条实线，内层又有一条弧线），视觉上极为廉价粗糙**。
- **强制规则**：
  - 接入 `.glass-panel` / `.glass-surface` / `.glass-card` / `.tool-item` 时，**容器的实体 `border` 必须显式为 `none`**（框架已配置 `border: none !important;`）。
  - **严禁**在页面业务 `<style>` 或内联样式中给玻璃卡片再补充 `border: 1px solid ...`！

```css
/* ❌ 错误示范：实体边框与微光圈碰撞，造成圆角双重线与套圈 */
.card.glass-panel {
    border: 1px solid rgba(255, 255, 255, 0.1); /* 产生双层重影边框！ */
    background: var(--glass-bg-panel);            /* 与 ::after 产生二次叠加发黑！ */
}

/* ✅ 正确写法：完全交给 CGoUI 玻璃分层渲染，无多余边框 */
.card.glass-panel {
    border: none !important;
    background: transparent !important;
}
```

### 2. 严禁一层套一层套娃与面板重合 (No Nested Glass Panels)
- **禁止面板套面板**：严禁在一个 `.glass-panel` 或 `.glass-surface` 内部再包裹同向圆角、同等边框的另一个 `.glass-panel` 或 `.tool-card`！
  - 这种「俄罗斯套娃」会导致多层背景透明度连乘叠加（例如 $0.82 \times 0.82 \approx 0.97$），不仅彻底丧失液态通透质感导致背景发灰发黑，更会在内外两圈留下诡异的嵌套边框沟槽。
- **内部区块拆分原则**：
  - 一个页面或一个主要工作区**只允许有一层最外层的底板（Tier B `.glass-panel`）**。
  - 底板内部如需划分各个子区域（如表单区、输入组、列表行），必须使用**无边框透明布局**、或**极弱衬底（`background: rgba(120, 120, 120, 0.05); border-radius: 8px; border: none;`）**，绝不能在内部再次创建具有阴影、模糊滤镜和微光圈的独立玻璃卡片！
  - **唯一的合法嵌套**：Tier B / Tier C 强调面板内部，可以陈列 **Tier A 可交互按钮入口（`.tool-item`）**，但子卡片与父面板边缘必须留足至少 `16px ~ 24px` 的负空间呼吸间距，绝不可边框贴边或尺寸重合。

### 3. 圆角曲率统一防脱节 (Coherent Border Radius)
- 当容器定义了圆角（例如 `border-radius: 16px`）时，确保外层容器具备 `overflow: hidden; isolation: isolate;`，内部所有伪元素与绝对定位图层严格使用 `border-radius: inherit;`。
- 绝不允许外层圆角为 20px，而内部由于样式未覆盖仍保留 12px 导致在四个角落露出错位底色缝隙。
