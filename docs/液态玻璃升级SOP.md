# CGoUI 液态玻璃升级 SOP（页面改造与自检标准规范）

> **适用范围**：所有接入或改造为 CGoUI 2.2 液态玻璃（Liquid Glass）视觉体系的业务页面、工具页、后台与文档站。  
> **核心原则**：保持物理光学沉浸感、拒绝过度拟物发光、严守层级与交互边界、多端断点严格一致。

---

## 目录
1. [卡片分级体系（Tier A / B / C）与防错排查](#1-卡片分级体系tier-a--b--c与防错排查)
2. [标题栏与主题切换器标准化排查](#2-标题栏与主题切换器标准化排查)
3. [悬浮双岛标题栏定位、超宽屏防溢出与顶部滚动消融渐变](#3-悬浮双岛标题栏定位超宽屏防溢出与顶部滚动消融渐变)
   - 3.1 核心架构与 DOM 骨架
   - 3.2 右岛超宽屏防溢出 CSS 铁律
   - 3.3 顶部正文滚动消融渐变与移动端信号栏防穿透规范（核心体验）
4. [按钮物理质感与微交互规范](#4-按钮物理质感与微交互规范)
5. [页面升级落地 Check List（逐项自检表）](#5-页面升级落地-check-list逐项自检表)

---

## 1. 卡片分级体系（Tier A / B / C）与防错排查

CGoUI 对所有液态玻璃卡片建立了严格的 3 档分级体系，彻底解决层叠混用、透明度失准及鼠标悬停异常抖动的问题。页面升级时**必须严格按以下三档归类，严禁跨档混用**：

| 档位 | 语义定位 | 典型标签 / 类名 | Layer 1 衬底透明度 | 鼠标悬停 (Hover) | 适用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier A** | **可交互卡片**<br>（操作入口） | `.tool-item`<br>`.glass-card` | 中低（`0.60` → hover `0.68`） | ✅ **允许**<br>微光增强 + 上移 `translateY(-4px)` + 阴影扩散 | 工具网格列表项、功能链接卡片、类似于含详细信息的立体按钮 |
| **Tier B** | **不可交互底板**<br>（布局分栏 / 弹窗底板） | `.glass-panel`<br>`section.tool-card`<br>`<cgo-dropdown>` 基础面板<br>`<cgo-modal>` / `.help-dialog` 主面板<br>`<cgo-table>` 数据表格底板<br>`<cgo-notice-center>` 通知中心底板<br>`<cgo-avatar>` 圆形头像<br>`<cgo-chat-bubble>` 对话气泡 | 高（`0.90` 固定） | ❌ **绝对禁止**<br>零位移、零颜色变化、零高亮反应 | 正文各版块分栏、长文阅读容器、主工作台、承载文字/图表/按钮的背景底板、下拉菜单浮层面板、模态弹窗主面板、数据表格底板、通知中心面板、圆形头像底板、对话气泡底板 |
| **Tier C** | **不可交互强调板**<br>（浮动表面 / 弹窗内嵌卡片） | `.glass-surface`<br>`.header-island`<br>`<cgo-card>` (默认)<br>`.help-card` / `.help-data-info` | 中（`0.72` 固定） | ❌ **绝对禁止**<br>零位移、零颜色变化、零高亮反应 | 浮动双岛标题栏、底部悬浮操作胶囊、仪表盘顶层状态区、通用卡片默认形态、帮助弹窗内详细信息卡片 |

### 🚨 常见踩坑与反模式（Anti-Patterns）

1. **底板误用 Tier A 造成“全屏乱抖”**：
   - ❌ **错误**：把承载表单、正文、表格的大容器写成 `<div class="glass-card">` 或带 hover 动效。用户在里面打字或点击按钮时，整块底板跟着上下浮动。
   - ✅ **修复**：大面积内容底板一律使用 **Tier B**（`.glass-panel`）或 **Tier C**（`<cgo-card>`），禁止任何位移动效。
2. **防双重边框与重影冲突（铁律）**：
   - ❌ **错误**：在声明了玻璃态的卡片上额外加 `border: 1px solid var(--border-color);`。
   - ⚠️ **后果**：液态玻璃自带 Layer 2（`::before`）双轴微光圈，外加实体边框会导致微光圈向内收缩 1px，在圆角处形成极不协调的「双层套圈重影边框」。
   - ✅ **修复**：接入液态玻璃时，实体 `border` 必须显式声明为 `none`，背景为 `transparent`，由 Layer 2 承担唯一轮廓线。
3. **防面板“俄罗斯套娃”嵌套发黑**：
   - ❌ **错误**：在 `.glass-panel` 内部又嵌套一个带边框和背景的 `.glass-panel` 或 `.glass-surface`。
   - ⚠️ **后果**：双层背景模糊与暗色遮罩相乘导致背景发黑，折射变形扭曲叠加。
   - ✅ **修复**：主工作区仅保留最外层一张 Tier B 底板，内部子区域仅使用无边框透明布局或极弱衬底（`background: rgba(120, 120, 120, 0.05); border: none;`）。

---

## 2. 标题栏与主题切换器标准化排查

### 2.1 彻底清除私有主题切换按钮
很多旧页面留存了历史私有的主题切换实现，例如页面独立的 `<button id="theme-btn">`、手写 SVG 月亮太阳图标、内联 `toggleTheme()` 函数等。

- ❌ **错误做法**：
  ```html
  <!-- 严禁使用私有或非标准按钮 -->
  <button id="theme-toggle" class="btn btn-icon" onclick="myCustomThemeToggle()">
    <i class="fa fa-moon"></i>
  </button>
  ```
- ✅ **标准规范**：
  直接使用 CGoUI 官方组件 `<cgo-theme-toggle>`：
  ```html
  <cgo-theme-toggle></cgo-theme-toggle>
  ```
  - **优势**：自适应日/夜主题切换、广播 `themechange` 事件、内置 Apple 弹性物理微动效，内部标准封装 `<cgo-button variant="info" pill>`，无需任何多余样式与脚本维护。

### 2.2 严禁添加顶栏切换按钮
- ❌ **铁律**：严禁在页面中插入 `<cgo-header-toggle>` 按钮。CGoUI 2.0 默认且唯一标准为**悬浮双岛菜单栏**，不向用户提供回退 1.0 经典顶栏的切换按钮。

---

## 3. 悬浮双岛标题栏定位与超宽屏防溢出规范

### 3.1 核心架构与 DOM 骨架
悬浮菜单栏采用左右双岛屿设计，脱离常规文档流，浮动于内容之上：
```html
<header class="tool-header">
  <!-- 左岛：导航与标题 -->
  <div class="header-island header-island-left glass-surface">
    <div class="header-left">
      <button class="btn btn-info" onclick="history.back()" title="返回上一页">
        <cgo-icon name="back"></cgo-icon><span>返回</span>
      </button>
      <a href="../index.html" class="btn btn-primary" title="返回主页">
        <cgo-icon name="home"></cgo-icon><span>主页</span>
      </a>
    </div>
    <div class="header-island-divider" aria-hidden="true"></div>
    <div class="header-center">
      <img src="./design.png" alt="Logo" class="header-logo">
      <span class="app-title">页面标题</span>
    </div>
  </div>

  <!-- 右岛：操作与工具（语言选择、主题切换等） -->
  <div class="header-island header-island-right glass-surface">
    <div class="header-right">
      <cgo-toolbar-select id="cgo-i18n-language-select" value="zh"></cgo-toolbar-select>
      <cgo-theme-toggle></cgo-theme-toggle>
    </div>
  </div>
</header>
```

### 3.2 右岛超宽屏防溢出 CSS 铁律（重要踩坑记录）
在超宽屏或窗口放大时，右岛经常出现**“窗口越长，右上角藏起来越多；窗口缩小反而露出来”**的严重布局 Bug。

- **根本原因**：`.tool-header` 带有 `display: flex; justify-content: space-between;`。如果子元素 `.header-island-right` 没有显式重置 `left: auto !important`，浏览器会从 flex-flow 静态计算出随屏幕宽度暴增的 `left` 偏移，导致右边距失效、被挤出屏幕外！
- **标准 CSS 规范**（已沉淀至 `cgo_ui.css`，自定义页面不可覆盖）：
  ```css
  .header-island-right {
      position: fixed !important;
      top: calc(env(safe-area-inset-top, 0px) + 20px) !important;
      right: calc(20px + env(safe-area-inset-right, 0px)) !important;
      left: auto !important;             /* 核心：阻断 flex 静态偏移污染 */
      width: auto !important;
      width: fit-content !important;     /* 宽度自适应内容 */
      max-width: calc(100vw - 40px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)) !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      transform: none !important;
      overflow: visible !important;
  }

  .header-island-right .header-right {
      min-width: 0 !important;
      width: auto !important;
      flex-shrink: 0 !important;         /* 禁止内部项被挤压 */
  }
  ```

### 3.3 顶部正文滚动消融渐变与移动端信号栏防穿透规范（核心体验）

当页面采用浮动菜单栏（无论是桌面端双岛还是移动端单胶囊）时，悬浮栏与屏幕边缘存在留白。若无防护，正文内容向上滚动时会硬生生穿过顶栏留白区，**直接重叠暴露出在移动端顶部的系统信号栏、时间、电量与灵动岛/刘海区域**，造成文字与系统图标撞车打架。

为此，浮动菜单栏**必须直接配套正文滚动的隐藏消融渐变与防穿透双重防护体系**：

```
+-----------------------------------------------------------+
| [12:36]            (信号栏防穿透层 z:50001)        [ 100% ]| <- 实色遮挡系统信号区
|~~~~~~~~~~~~~~~~~~~ (顶部遮罩渐变 Scrim z:900) ~~~~~~~~~~~~| <- 100% 自然衰减至 0%
|   +-------------------+           +-------------------+   |
|   | [<-] [主页] 仪表盘 |           | [语言] [主题切换]  |   | <- 悬浮双岛 (z:1000)
|   +-------------------+           +-------------------+   |
|                                                           |
|     正文内容向上滚动时，在渐变区自然消融淡化 (z < 900)       |
+-----------------------------------------------------------+
```

#### 双重防护标准实现：

1. **第一重防护：顶部全宽滚动消融渐变 (Scrim Gradient)**
   - **作用**：正文卡片与文字滚动至浮动标题栏后方时，呈平滑柔和的自然淡出融化，彻底避免正文在悬浮栏上方露底打架。
   - **几何与范围**：顶部贴齐视窗 `top: 0`，左右贯通全宽 `width: 100%`，向下延伸至悬浮标题栏底部（桌面端 `calc(env(safe-area-inset-top, 0px) + 72px)`，移动端 `calc(env(safe-area-inset-top, 0px) + 64px)`）。
   - **色彩衰减数学模型**：
     - 顶部：深色/浅色模式对应基色 `var(--cgo-floating-scrim-start, var(--bg-color, #f8f9fa))`（100% 不透明度）；
     - 底部：衰减为 0% 全透明（`var(--cgo-floating-scrim-end, rgba(..., 0))`）。
   - **层级规范**：`z-index: 900`（正文内容 `z < 900` < 顶部渐变遮罩 `900` < 悬浮标题栏 `1000`），`pointer-events: none` 确保手势滑动穿透零阻隔。
   - **注意**：仅在浮动模式下激活；普通吸顶标题栏（`header-mode="classic"`）严禁添加该渐变。

2. **第二重防护：移动端信号栏实色填充防穿透层 (`.mobile-status-bar-fill`)**
   - **作用**：iPhone 灵动岛、刘海屏及安卓打孔屏在页面上滑时，彻底杜绝任何文字穿透进系统时间、WiFi、信号与电池图标区域。
   - **结构注入**：页面 `<body>` 顶层插入占位保护节点：
     ```html
     <div class="mobile-status-bar-fill" aria-hidden="true"></div>
     ```
   - **样式实现（由 `cgo_ui.css` 内置管控）**：
     - 高度为 `calc(env(safe-area-inset-top, 0px) + 16px)`；
     - 顶部 `0` 至 `env(safe-area-inset-top)` 实色填满 `var(--theme-bg, var(--bg-color))`，下方延伸 16px 渐变淡出；
     - 层级声明为最高层 `z-index: 50001`，`pointer-events: none`。
3. **页面级 Meta 配置要求**：
   页面 `<head>` 内的 viewport 必须显式声明 `viewport-fit=cover`：
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
   ```

---

## 4. 按钮物理质感与微交互规范

升级液态玻璃时，**严禁将按钮做成过分油腻、夸张凸起的拟物态**。CGoUI 对按钮统一执行以下光学与物理规范：

### 4.1 拒绝对比度过大、浮夸的高光与粗边框
- **统一使用 1px 极细微光轮廓线（Hairline Rim Light）**：
  采用 `linear-gradient` 与 `mask-composite: exclude` 绘制单像素光学微光层，绝不使用 `2px` 粗白边。
- **不透明度克制（75% 黄金比例）**：
  - **默认常态**：微光轮廓层 `opacity: 0.64`（克制隐约，贴合底色）；
  - **悬停态**：`opacity: 0.75`（适度提亮，不刺眼）；
  - **深色模式**：自动反转为顶部白光（`0.33`）+ 底部暗光（`0.08`），保证在深黑背景中锐利清晰。

### 4.2 动效收敛：彻底取消悬停上浮位移
- ❌ **严禁**：`button:hover { transform: translateY(-2px); }`。这会导致页面密集按钮群在鼠标划过时频繁跳动，破坏阅读专注度。
- ✅ **标准微交互（/all-emil 交互法则）**：
  - **Hover（悬停）**：仅改变微光轮廓透明度、背景饱和度、微阴影（扩散半径轻增 2px），**位移保持 0**。
  - **Active（按压）**：仅在点击瞬间触发物理微缩：
    ```css
    button:active:not([disabled]):not([loading]) {
        transform: scale(0.98);
        transition: transform 100ms cubic-bezier(0.23, 1, 0.32, 1);
    }
    ```

### 4.3 变体规范统一
- 7 种语义变体（`primary`、`info`、`dark`、`success`、`danger`、`warning`、`ghost`）使用统一的 1px 轮廓线结构与按压反馈，杜绝不同变体风格割裂。

### 4.4 胶囊按钮与徽章（Pill & <cgo-badge>）质感同步
- **完美胶囊弧度**：统一使用 `border-radius: var(--radius-full, 9999px)`，彻底剔除过往生硬的固定 20px 大圆角或厚重实体边框。
- **同步 1px 微光轮廓线**：`<cgo-badge>`（特别是 `pill` 胶囊样式）与 `<cgo-button pill>` 完全共享 Layer 2 极细双轴微光轮廓线（`::before` 遮罩单像素高光，opacity: 0.64），摒弃硬边框。
- **内容层级保障**：徽标与按钮内部文字均置于 Layer 3（`z-index: 3`），保证在深色/浅色背景与微光层之上绝对锐利清晰。
- **深色模式自然过渡**：深色模式下 info/muted 等状态采用柔和微透背景（如 `rgba(56, 189, 248, 0.16)` / `--btn-info-bg: #262729`），杜绝亮刺刺的高对比白底。

---

## 5. 页面升级落地 Check List（逐项自检表）

页面完成液态玻璃升级后，对照以下清单逐项验证：

- [ ] **1. 全局玻璃模式声明**：
  - 默认已启用次世代 Liquid Glass（`glass-mode="liquid"`）；推荐在 `<html>` 上显式声明 `glass-mode="liquid"`；
  - 纯白或素色商务页面若需降级为纯平面设计，可在 `<html>` 上显式添加 `glass-mode="flat"`。
- [ ] **2. 卡片 Tier 模式核对**：
  - 作为背景承载区的大容器使用 **Tier B**（`.glass-panel`）或 **Tier C**（`<cgo-card>`），**无 hover 位移**；
  - 仅作为可点击入口的栅格卡片使用 **Tier A**（`.glass-card` / `.tool-item`）；
  - 卡片上已移除原生 `border: 1px solid ...`，无双重重影黑边；
  - 面板无“俄罗斯套娃”多层嵌套。
- [ ] **3. 顶栏规范与防溢出**：
  - 统一使用 `<header class="tool-header">` 左右双岛结构；
  - 已彻底移除私有主题切换按钮，已替换为 `<cgo-theme-toggle>`；
  - 已检查并删除 `<cgo-header-toggle>`；
  - 在大屏（>1440px）和超宽屏下测试，右上岛屿紧贴右边界 20px，**无向右溢出消失**（`left: auto !important`）。
- [ ] **4. 顶部滚动渐变与移动信号栏防穿透**：
  - `<meta name="viewport">` 已包含 `viewport-fit=cover`；
  - `<body>` 顶层已包含 `<div class="mobile-status-bar-fill" aria-hidden="true"></div>`；
  - 正文向上滚动时，在浮动菜单栏后方平滑渐隐融化，**绝对未穿透进入移动端系统时间/信号/WiFi区域**。
- [ ] **5. 按钮质感与交互**：
  - 按钮鼠标悬停时**无上浮位移**；
  - 按钮点击时有柔和的 `scale(0.98)` 微触感；
  - 1px 微光线细腻内敛（opacity ≤ 0.75），无粗笨描边。
- [ ] **6. 移动端 640px 统一断点**：
  - 手机宽度（≤ 640px）下，双岛标题栏平滑折叠为居中悬浮胶囊；
  - 顶部状态栏保护层（`.mobile-status-bar-fill`）正常生效，无内容穿透。
