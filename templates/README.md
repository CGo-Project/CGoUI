# CGoUI 页面参考模板规范文档 (Demo Templates Specification)

本文档为 **CGoUI 页面参考模板** 的架构规范说明文件，供人类开发者参考以及 AI 在快速生成/优化页面布局时直接读取复用。

---

## 📁 模板文件清单

所有参考 Demo 模板存放于项目 `templates/` 目录下：

- [templates/tool_template.html](./tool_template.html)：**模板一：工具类页面**
- [templates/info_template.html](./info_template.html)：**模板二：介绍类页面**
- [templates/PROMPT.md](./PROMPT.md)：**AI 改装 Prompt：已有网页改装为 CGO UI 标准网页 Prompt 模板**
- [templates/README.md](./README.md)：**模板规范与 AI Prompt 骨架说明（本文件）**

---

## 🛠️ 模板一：工具类页面规范 (Tool Page Template)

### 1. 适用场景
适用于各种在线 Web 工具、控制面板、标志色卡表、数据转换器、编辑器等需要**顶栏导航 + 底部固定/自适应操作工作区**的页面。

### 2. 页面结构 (DOM Tree)
```text
body (flex-direction: column; overflow: hidden;)
├── header.tool-header (三段式固定菜单栏)
│   ├── .header-left (左侧：返回按钮、仪表盘/主页按钮)
│   ├── .header-center (中间：Logo/Icon + 应用标题 app-title)
│   └── .header-right (右侧：导出下拉菜单、cgo-theme-toggle、更多/选项下拉菜单)
└── main.tool-container (下方主工作区)
    ├── .tool-card (工具栏 / 操作控制面板)
    └── .table-container (数据表格 / 工作面板，支持粘性表头与粘性首列)
```

### 3. HTML 骨架代码片段
```html
<header class="tool-header">
    <div class="header-left">
        <button class="btn btn-info" onclick="history.back()"><cgo-icon name="back"></cgo-icon><span>返回</span></button>
        <a href="../index.html" class="btn btn-primary"><cgo-icon name="home-dots"></cgo-icon><span>仪表盘</span></a>
    </div>
    <div class="header-center">
        <cgo-icon name="design" size="24" class="header-logo"></cgo-icon>
        <span class="app-title">工具页面标题</span>
    </div>
    <div class="header-right">
        <div class="dropdown">
            <button class="btn btn-info dropbtn"><cgo-icon name="download"></cgo-icon><span>导出</span></button>
            <div class="dropdown-content">
                <a href="javascript:void(0)" id="export-btn"><span>导出文件</span></a>
            </div>
        </div>
        <cgo-theme-toggle></cgo-theme-toggle>
    </div>
</header>
<main class="tool-container">
    <div class="table-container">
        <!-- 表格或工作区内容 -->
    </div>
</main>
```

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

## 🎨 CGoUI CSS 类名与组件速查

| 类别 | 推荐 Class / Web Component | 说明 |
| :--- | :--- | :--- |
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

> **⚠️ 上表均为库内置类**（引入 `styles/` 四件套即生效）。而 `.header-tabs`、`.hero-split`、`.hero-media`、`.hero-content`、`.hero-actions`、`.content-section`、`.content-group`、`.content-image`、`.content-text` **不在组件库样式中**，它们只定义于 [info_template.html](./info_template.html) 的 `<style>` 块内。复用这些版式时，**必须把对应 CSS 一并复制到目标页面**，否则只会得到无样式的裸块。

---

## ⚠️ 三条最容易踩的坑

1. **脚本入口必须是 `dist/cgo-ui.js`**。仓库 `src/` 下**没有** `cgo-ui.js`（源码入口是 `src/index.js`，且依赖裸模块 `lit`，浏览器无法直接加载）。
2. **HTML 中没有 `oncgochange` / `oncgotabchange` 这类属性**——它们只存在于 React 包装层 `src/react.js`。原生页面必须用 `addEventListener('cgo-change' | 'cgo-tab-change' | 'cgo-close' | 'cgo-input' | 'cgo-nav-change', ...)`。
3. **主题防闪烁脚本读取的 localStorage 键，必须与主题引擎实际使用的键一致**。引擎的 `autoStorageKey()` 会按页面文件名推导前缀（命中 `vitool`/`wall`/`stasign`/`staline`/`project`/`cgoauth`/`mc`/`enmap`/`guide`/`timetable` 时为 `<文件名>_app-theme`），需要自定义时请调用导出的 `setStorageKey()`，而不是手写 `localStorage.setItem()`。

---

## 🤖 AI 代码生成 & 网页重构 Prompt 指引

当需要 AI 将已有的网页构建产物改装为符合 CGO UI 规范的标准网页，或创建新页面时：

1. **已有网页改造系统提示词**：详见 [templates/PROMPT.md](./PROMPT.md)，包含详细的四阶段改造指引与防幻觉图标白名单。
2. **快速创建页面简短 Prompt**：
   > **AI 提示词示例：**
   > “请读取 CGoUI 项目中 `templates/README.md` 的规范，基于 [tool_template.html / info_template.html] 模板，为我搭建一个 [工具类/介绍类] 页面。要求使用 CGoUI 的 `tool-header` 三段式顶栏，包含 `<cgo-theme-toggle>` 和 `<cgo-button>` 组件，主体使用 `tool-container`。”
