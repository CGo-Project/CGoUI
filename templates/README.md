# CGoUI 页面参考模板规范文档 (Demo Templates Specification)

本文档为 **CGoUI 页面参考模板** 的架构规范说明文件，供人类开发者参考以及 AI 在快速生成/优化页面布局时直接读取复用。

---

## 📁 模板文件清单

所有参考 Demo 模板存放于项目 `templates/` 目录下：

- [templates/tool_template.html](./tool_template.html)：**模板一：工具类页面**
- [templates/info_template.html](./info_template.html)：**模板二：介绍类页面**
- [templates/ribbon_template.html](./ribbon_template.html)：**模板三：Ribbon 效率类页面 (CAD/工坊/拓扑与节点工作台)**
- [templates/PROMPT.md](./PROMPT.md)：**AI 改装 Prompt：已有网页改装为 CGO UI 标准网页 Prompt 模板**
- [templates/README.md](./README.md)：**模板规范与 AI Prompt 骨架说明（本文件）**

---

## 🛠️ 模板一：工具类页面规范 (Tool Page Template)

### 1. 适用场景
适用于各种在线 Web 工具、控制面板、标志色卡表、数据转换器、编辑器等需要**顶栏导航 + 底部固定/自适应操作工作区**的页面。

### 2. 页面结构 (DOM Tree)
```text
body (flex-direction: column; overflow: hidden;)
├── header.tool-header (三段式/双岛屿自适应菜单栏)
│   ├── .header-island.header-island-left (左侧浮岛，桌面端浮动居左，移动端穿透)
│   │   ├── .header-left (左侧按钮：返回、仪表盘/主页)
│   │   ├── .header-island-divider (垂直细分割线)
│   │   └── .header-center (Logo/Icon + 应用标题 app-title)
│   └── .header-island.header-island-right (右侧浮岛，桌面端浮动居右，移动端穿透)
│       └── .header-right (导出下拉菜单、cgo-header-toggle 顶栏切换、cgo-theme-toggle、更多菜单)
└── main.tool-container (下方主工作区)
    ├── .tool-card (工具栏 / 操作控制面板)
    └── .table-container (数据表格 / 工作面板，支持粘性表头与粘性首列)
```

### 3. HTML 骨架代码片段
```html
<header class="tool-header">
    <div class="header-island header-island-left">
        <div class="header-left">
            <button class="btn btn-info" onclick="history.back()"><cgo-icon name="back"></cgo-icon><span>返回</span></button>
            <a href="../index.html" class="btn btn-primary"><cgo-icon name="home-dots"></cgo-icon><span>仪表盘</span></a>
        </div>
        <div class="header-island-divider" aria-hidden="true"></div>
        <div class="header-center">
            <cgo-icon name="design" size="24" class="header-logo"></cgo-icon>
            <span class="app-title">工具页面标题</span>
        </div>
    </div>
    <div class="header-island header-island-right">
        <div class="header-right">
            <div class="dropdown">
                <button class="btn btn-info dropbtn"><cgo-icon name="download"></cgo-icon><span>导出</span></button>
                <div class="dropdown-content">
                    <a href="javascript:void(0)" id="export-btn"><span>导出文件</span></a>
                </div>
            </div>
            <cgo-header-toggle></cgo-header-toggle>
            <cgo-theme-toggle></cgo-theme-toggle>
        </div>
    </div>
</header>
<main class="tool-container">
    <div class="table-container">
        <!-- 表格或工作区内容 -->
    </div>
</main>
```
> **页面模式与顶栏模式切换提示**：
> - 页面默认采用经典吸顶顶栏（`classic`）与纯色底色背景（`solid`，零破坏兼容）；
> - **悬浮双岛菜单栏**：可在 `<html>` 标签上声明 `header-mode="floating"`（如 `<html lang="zh-CN" header-mode="floating">`）；用户也可通过 `<cgo-header-toggle>` 按钮在运行时自主切换，状态自动记忆到本地；
> - **悬浮顶栏遮罩渐变**：悬浮模式下顶部自动注入贯通背景色遮罩渐变（视窗顶部至顶栏底部，跟随深色/浅色模式背景色渐变至透明，z层级位于正文与悬浮顶栏之间），正文滚动至顶栏背后时平滑融入背景，普通版标题栏不添加渐变；
> - **导航栏（左侧面板）联动**：悬浮模式下外观与浮动菜单栏及 `tool.html` 卡片一致（移动端宽度自动与浮动菜单栏对齐，非全宽贯通）；普通版标题栏模式下圆角自动归零（`border-radius: 0`）；
> - **微光渐变背景**：可在 `<html>` 标签上声明 `bg-mode="gradient"`（如 `<html lang="zh-CN" bg-mode="gradient">`），CGoUI 自动应用视口固定（`fixed`）的标准双角微光径向渐变，严禁在页面内随意硬编码渐变。


---

## 📖 模板二：介绍类页面规范 (Info Page Template)

### 1. 适用场景
适用于应用官网、功能介绍、规范/标准演进梳理、视觉系统展示、产品文档等需要**顶栏带 Tabs 切换 + 正文大图文/交错展示/文章与表格**的页面。

### 2. 页面结构 (DOM Tree)
```text
body (min-height: 100vh; overflow-y: auto;)
├── header.tool-header (顶部固定菜单栏)
│   ├── .header-left (左侧：导航按钮 + Logo/Icon + 标题)
│   ├── .header-center (中间：选项卡 nav.header-tabs / cgo-tabs 导航视图)
│   └── .header-right (右侧：cgo-theme-toggle 主题切换 + 选项/帮助按钮)
└── main.tool-container (正文主容器)
    ├── section.hero-split (Hero 头图展示区：左大图 + 右文字与行动点)
    ├── section.content-section (交错图文风采区)
    │   ├── .content-group (左图 + 右文字)
    │   └── .content-group.reverse (右图 + 左文字)
    └── section.tool-card.article-content (长文/规范文章卡片)
        ├── .page-title & .page-subtitle (标题与副标题)
        ├── .disclaimer (提示与注脚框)
        ├── table.modern-table (数据对比表格)
        └── #resources (资料/文件下载行动栏)
```

### 3. HTML 骨架代码片段
```html
<header class="tool-header">
    <div class="header-left">
        <button class="btn btn-info" onclick="history.back()"><cgo-icon name="back"></cgo-icon><span>返回</span></button>
        <cgo-icon name="design" size="24" class="header-logo"></cgo-icon>
        <span class="app-title">介绍页面标题</span>
    </div>
    <div class="header-center">
        <nav class="header-tabs">
            <a href="#overview" class="tab-item active">特性概览</a>
            <a href="#features" class="tab-item">视觉系统</a>
            <a href="#resources" class="tab-item">资料下载</a>
        </nav>
    </div>
    <div class="header-right">
        <cgo-theme-toggle></cgo-theme-toggle>
    </div>
</header>

<main class="tool-container">
    <!-- Hero 头图区块 -->
    <section class="hero-split">
        <div class="hero-media"><img src="..." alt="Hero"></div>
        <div class="hero-content">
            <h1>核心大标题</h1>
            <p>主要描述段落内容...</p>
            <div class="hero-actions">
                <cgo-button variant="primary" icon="sparkle">主要按钮</cgo-button>
            </div>
        </div>
    </section>

    <!-- 交错图文模块 -->
    <section class="content-section">
        <div class="content-group">
            <div class="content-image"><img src="..."></div>
            <div class="content-text">
                <h3>特性标题</h3>
                <p>详细说明文字...</p>
            </div>
        </div>
    </section>

    <!-- 文章卡片与表格 -->
    <section class="tool-card article-content">
        <h2>规范解析</h2>
        <div class="disclaimer"><strong>注：</strong> 重要提示框文本。</div>
        <table class="modern-table">
            <thead><tr><th>项目</th><th>标准</th></tr></thead>
            <tbody><tr><td>示例</td><td>内容</td></tr></tbody>
        </table>
    </section>
</main>
```

---

## ⚡ 模板三：Ribbon 效率类页面规范 (Ribbon Efficiency Template)

### 1. 适用场景
源自 **CGo Voice 播音工厂** 等生产力工具实战沉淀。适用于各种复杂桌面级工程工具、流程设计器、拓扑搭线/连线画布、声音与媒体处理工坊、CAD/图形图像工作台、节点编辑器或任何需要**高度整合多标签工具栏、多分组命令与大面积操作视口**的现代化 Web 应用。

### 2. 页面结构 (DOM Tree)
```text
body.office-app-shell (100dvh 全屏固定受控视口，overflow: hidden)
├── header.office-title-bar (顶部标题栏)
│   ├── .title-bar-left (左侧图标 + 应用品牌 app-brand + 文档标题 doc-name)
│   ├── .title-bar-center (中间全局模式/全局参数胶囊 quick-pill)
│   └── .title-bar-right (设置按钮 + 下拉帮助菜单 + cgo-theme-toggle 主题切换)
├── nav.office-ribbon-container (微软 Office 风格 Ribbon 功能区)
│   ├── .ribbon-tabs-row (选项卡标签行)
│   │   ├── .ribbon-tabs-left (.ribbon-tab-btn 选项卡按钮组，带图标与标签，双击折叠)
│   │   └── .ribbon-tabs-right (.ribbon-collapse-toggle-btn 功能区折叠/展开按钮)
│   └── .ribbon-toolbar-body (工具栏主体，折叠时高度平滑归零)
│       └── .ribbon-tab-content-group.active (当前选项卡命令分组)
│           ├── .ribbon-group (命令卡片组：大图标按钮 .ribbon-action-btn-lg、垂直双层紧凑按钮组 .ribbon-v-stack、参数滑块 .ribbon-param-box)
│           │   ├── .ribbon-group-controls (按钮与控件操作区)
│           │   └── .ribbon-group-label (底部微型分组标签)
│           └── .ribbon-divider (垂直细分割线)
├── main.office-main-workspace (主体核心工作区)
│   └── section.main-canvas-wrapper (视口与画布包装容器)
│       ├── .workspace-focus-bar / .branch-focus-bar (顶部上下文焦点条 / 引导条)
│       ├── .cgo-canvas-viewport (全景视口，含 .cgo-blueprint-grid 工程点阵背景)
│       │   ├── .canvas-nodes-layer (节点 / 画布核心交互元素层)
│       │   └── .freeform-zoom-toolbar (视口浮动快速缩放工具栏)
│       ├── aside.aux-list-sidebar (工作区右侧常驻展开/折叠辅助列表侧边栏)
│       │   ├── .sidebar-header (图标 + 标题 + <cgo-badge> 计数徽章 + 收起按钮)
│       │   ├── .sidebar-toolbar (批量操作按钮 + 搜索过滤框 + 模式切换)
│       │   └── .sidebar-cards-scroll-wrap (卡片列表滚动容器)
│       └── button.sidebar-floating-toggle-btn (侧边栏收起时右上边缘贴边浮动展开胶囊)
└── footer.office-status-bar (底部全局状态底栏)
    ├── .status-left (GPU/Metal 硬件加速标签 + 引擎服务状态 + 指标徽章计数)
    └── .status-right (.zoom-controls 包含缩小、滑杆、放大、百分比与 100% 重置)
```

### 3. HTML 骨架代码片段
```html
<body class="office-app-shell">
  <!-- 1. 顶部标题栏 -->
  <header class="office-title-bar">
    <div class="title-bar-left">
      <div class="office-app-icon"><cgo-icon name="design" size="22"></cgo-icon></div>
      <div class="office-doc-title">
        <span class="app-brand">CGo WorkBench</span>
        <span class="doc-sep">/</span>
        <span class="doc-name">工程文件_v1.0</span>
      </div>
    </div>
    <div class="title-bar-center">
      <div class="global-quick-pill">
        <span class="pill-label">工作模式:</span>
        <select class="title-dropdown"><option>标准模式</option></select>
        <button class="title-quick-btn" title="快速运行"><cgo-icon name="play" size="14"></cgo-icon></button>
      </div>
    </div>
    <div class="title-bar-right">
      <button class="title-bar-btn"><cgo-icon name="settings" size="16"></cgo-icon></button>
      <cgo-theme-toggle></cgo-theme-toggle>
    </div>
  </header>

  <!-- 2. Ribbon 功能区 -->
  <nav class="office-ribbon-container" id="officeRibbonContainer">
    <div class="ribbon-tabs-row">
      <div class="ribbon-tabs-left">
        <button class="ribbon-tab-btn active" onclick="switchRibbonTab('home')">
          <cgo-icon name="home" size="14"></cgo-icon><span>开始</span>
        </button>
      </div>
      <div class="ribbon-tabs-right">
        <button class="ribbon-collapse-toggle-btn" onclick="toggleRibbonCollapse()">
          <cgo-icon name="expand-less" size="13"></cgo-icon><span>折叠功能区</span>
        </button>
      </div>
    </div>
    <div class="ribbon-toolbar-body">
      <div class="ribbon-tab-content-group active" id="ribbonGroupSet_home">
        <div class="ribbon-group">
          <div class="ribbon-group-controls">
            <button class="ribbon-action-btn-lg primary-action">
              <div class="ribbon-icon"><cgo-icon name="add" size="20"></cgo-icon></div>
              <span class="btn-text">添加节点</span>
            </button>
          </div>
          <div class="ribbon-group-label">节点创作</div>
        </div>
      </div>
    </div>
  </nav>

  <!-- 3. 主工作区与右侧辅助侧边栏 -->
  <main class="office-main-workspace">
    <section class="main-canvas-wrapper">
      <div class="workspace-focus-bar">
        <div class="focus-bar-left"><strong>主视口</strong></div>
      </div>
      <div class="cgo-canvas-viewport">
        <div class="cgo-blueprint-grid"></div>
        <div class="canvas-nodes-layer">...</div>
      </div>
      <!-- 右侧辅助列表区 -->
      <aside class="aux-list-sidebar" id="auxListSidebar">
        <div class="sidebar-header">
          <div class="sidebar-header-left">
            <cgo-icon name="view-list" size="16"></cgo-icon>
            <strong>任务列表</strong>
            <cgo-badge variant="info">3 项</cgo-badge>
          </div>
          <button class="sidebar-collapse-btn" onclick="toggleSidebar(false)"><cgo-icon name="chevron-right" size="14"></cgo-icon></button>
        </div>
        <div class="sidebar-cards-scroll-wrap">...</div>
      </aside>
    </section>
  </main>

  <!-- 4. 底部状态栏 -->
  <footer class="office-status-bar">
    <div class="status-left">
      <div class="status-badge-item"><cgo-icon name="view-grid" size="13"></cgo-icon><span>GPU 就绪</span></div>
      <span class="status-item">节点: <cgo-badge>3</cgo-badge></span>
    </div>
    <div class="status-right">
      <div class="zoom-controls">
        <button class="zoom-btn" onclick="zoomCanvas(0.85)"><cgo-icon name="zoom-out" size="13"></cgo-icon></button>
        <input type="range" class="zoom-slider" min="0.5" max="2.0" step="0.05" value="1.0" oninput="handleZoomInput(this.value)">
        <button class="zoom-btn" onclick="zoomCanvas(1.15)"><cgo-icon name="zoom-in" size="13"></cgo-icon></button>
        <span class="zoom-val-text">100%</span>
      </div>
    </div>
  </footer>
</body>
```

---

## 🎨 CGoUI CSS 类名与组件速查

| 类别 | 推荐 Class / Web Component | 说明 |
| :--- | :--- | :--- |
| **页面模式属性** | `<html bg-mode="gradient\|solid">` | 背景渲染模式（默认 solid 纯色，gradient 为固定微光双角径向渐变） |
| **顶栏模式属性** | `<html header-mode="floating\|classic">` | 顶栏形态（默认 classic 吸顶，floating 为双岛屿悬浮栏） |
| **毛玻璃模式属性** | `<html glass-mode="liquid\|blur\|flat">` | 毛玻璃质感（默认 flat，blur 为磨砂，liquid 为次世代液态光学玻璃） |
| **顶部栏** | `<header class="tool-header">` | 统一顶栏样式 |
| **三段式布局** | `.header-left`, `.header-center`, `.header-right` | Header 三段浮动/Flex 对齐 |
| **应用标题** | `.app-title` | Header 内部应用标题文本样式 |
| **主容器** | `<main class="tool-container">` | 页面主体受控容器 |
| **通用卡片** | `.tool-card` | 带阴影与边框的标准白色/暗色卡片 |
| **文章卡片** | `.tool-card.article-content` | 长文与排版专用卡片 |
| **数据表格** | `.modern-table` | 标准清爽数据表格 |
| **Excel 表格** | `#colorTable` / `#toolDataTable` + `.table-container` | 包含 `sticky` 标题与固定首列的表格 |
| **提示框** | `.disclaimer` | 带左边框色带的醒目提示框 |
| **选项卡** | `.header-tabs` + `.tab-item` | 顶部 Header 内部的导航 Tabs |
| **Web 组件: 按钮** | `<cgo-button variant="primary\|info\|danger\|ghost" size="sm\|md" icon="...">` | 统一按钮组件 |
| **Web 组件: 图标** | `<cgo-icon name="..." size="...">` | 矢量图标组件 |
| **Web 组件: 主题** | `<cgo-theme-toggle></cgo-theme-toggle>` | 亮暗主题一键切换器 |

> **⚠️ 上表均为库内置类**（引入 `styles/` 四件套即生效）。
> - `.header-tabs`、`.hero-split`、`.hero-media`、`.hero-content`、`.hero-actions`、`.content-section`、`.content-group`、`.content-image`、`.content-text` 只定义于 [info_template.html](./info_template.html) 的 `<style>` 块内；
> - `.office-title-bar`、`.office-ribbon-container`、`.ribbon-tabs-row`、`.ribbon-toolbar-body`、`.ribbon-group`、`.aux-list-sidebar`、`.office-status-bar`、`.cgo-canvas-viewport` 只定义于 [ribbon_template.html](./ribbon_template.html) 的 `<style>` 块内。
> 复用这些版式时，**必须把对应 CSS 一并复制到目标页面**，否则只会得到无样式的裸块。

---

## ⚠️ 三条最容易踩的坑

1. **脚本入口必须是 `dist/cgo-ui.js`**。仓库 `src/` 下**没有** `cgo-ui.js`（源码入口是 `src/index.js`，且依赖裸模块 `lit`，浏览器无法直接加载）。
2. **HTML 中没有 `oncgochange` / `oncgotabchange` 这类属性**——它们只存在于 React 包装层 `src/react.js`。原生页面必须用 `addEventListener('cgo-change' | 'cgo-tab-change' | 'cgo-close' | 'cgo-input' | 'cgo-nav-change', ...)`。
3. **主题防闪烁脚本读取的 localStorage 键，必须与主题引擎实际使用的键一致**。引擎的 `autoStorageKey()` 会按页面文件名推导前缀（命中 `vitool`/`wall`/`stasign`/`staline`/`project`/`cgoauth`/`mc`/`enmap`/`guide`/`timetable` 时为 `<文件名>_app-theme`），需要自定义时请调用导出的 `setStorageKey()`，而不是手写 `localStorage.setItem()`。

---

## 🤖 AI 代码生成 & 网页重构 Prompt 指引

当需要 AI 将已有的网页构建产物改装为符合 CGO UI 规范的标准网页，或创建新页面时：

1. **已有网页改造系统提示词**：详见 [templates/PROMPT.md](./PROMPT.md)，包含详细的四阶段改造指引与防幻觉图标白名单。
2. **快速创建页面简短 Prompt 示例**：
   - **工具类页面 Prompt**：
     > “请读取 CGoUI 项目中 `templates/README.md` 的规范，基于 `tool_template.html` 模板，为我搭建一个工具类页面。要求使用 CGoUI 的 `tool-header` 三段式顶栏，包含 `<cgo-theme-toggle>` 和 `<cgo-button>` 组件，主体使用 `tool-container`。”
   - **介绍类页面 Prompt**：
     > “请读取 CGoUI 项目中 `templates/README.md` 的规范，基于 `info_template.html` 模板，为我搭建一个产品介绍页面。要求顶栏包含 Tabs 导航与 `<cgo-theme-toggle>`，页面包含 Hero 区、交错图文风采区及规范卡片表格。”
   - **Ribbon 效率类页面 Prompt**：
     > “请读取 CGoUI 项目中 `templates/README.md` 的规范，参考 `CGo-Voice` 布局并基于 `ribbon_template.html` 模板，为我搭建一个高效率工作台界面。要求包含：顶部标题栏（左侧图标+品牌标题，中间模式胶囊，右侧设置与主题切换器）、微软 Office 风格 Ribbon 功能区（支持多选项卡切换与双击折叠）、主工作区视口与网格、工作区右侧常驻展开/折叠辅助列表侧边栏（含搜索与卡片）、以及底部状态栏（含算力指示、节点统计与缩放控制器）。”
