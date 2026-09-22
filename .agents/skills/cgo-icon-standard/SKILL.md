---
name: cgo-icon-standard
description: CGoUI 图标色彩规范、双色渐变映射规则与 SVG 图标制作标准指南。适用于创建、优化、审查或导入 CGoUI 图标库资源。
---

# CGoUI 图标色彩规范与制作标准指南

本指南记录 CGoUI 图标系统（Icon Color System v2.0）的底层着色原理、设计色彩映射标准、SVG 代码规范以及组件调用方法。

---

## 1. 颜色分层与色彩映射标准

在 CGoUI 中，双色可变色图标通过区分“界面自适应部分”与“主题渐变色部分”实现层级渲染：

| 原始图层色彩 | 语义分类 | 运行时渲染表现 | 规则说明 |
| :--- | :--- | :--- | :--- |
| **深蓝色 `#171c61`** | **Non-Brand Paths**<br>（界面自适应 / 固定色） | 使用 `var(--icon-clr, currentColor)` | • 浅色模式下跟随文字主色（深蓝黑 `#00263b`）；<br>• 深色模式下跟随文字主色（白灰 `#e5e8ea`）；<br>• 深色高亮按钮内自动呈现纯白；<br>• **不进入** `_BRAND_IDX` 索引数组。 |
| **黄色 `#dadf00`** | **Brand Paths**<br>（主题品牌渐变色） | 填充 `url(#cgo-brand-grad)` | • 根据页面属性（`html[data-app="..."]`）或 CSS 变量呈现垂直线性渐变；<br>• 起始色（底部）：`--brand-gradient-start-appname`；<br>• 结束色（顶部）：`--brand-gradient-end-appname`；<br>• **必须进入** `_BRAND_IDX` 登记对应子元素下标。 |

> **注意**：
> 如果图标全为 `#171c61`（单色图标），则为纯自适应图标，无需在 `_BRAND_IDX` 中登记；全图标随 `currentColor` 变化。

---

## 2. SVG 格式与代码规范

为保证构建器 `buildSvg` 正确切分路径与注入颜色，SVG 代码必须满足以下硬性标准：

1. **统一视窗 (viewBox)**：
   - 标准统一采用 `viewBox="0 0 24 24"`。
2. **图层独立拆分 (No Merged Paths)**：
   - 变色部件（黄色）与自适应部件（深蓝）**必须是独立的 SVG 标签**（`<path>`、`<rect>`、`<circle>` 等），严禁在矢量软件导出时通过 Boolean 合并为一个复合单一路径。
3. **严格自闭合标签与无内联样式**：
   - 所有图形标签必须采用 `/>` 自闭合格式（如 `<path d="..."/>`、`<circle cx="12" cy="12" r="4"/>`）。
   - **禁止**出现双标签闭合（如 `<path>...</path>`），因为构建器依赖 `_splitD` 与 `_injectFill` 正则匹配 `/>`。
   - **清除所有内联颜色样式**：剥离 `style="fill:#..."` 或 `fill="#..."`，但若路径包含 `fill-rule="evenodd"` 等几何排版属性，应予以保留。

---

## 3. 图标注册与 `_BRAND_IDX` 配置

在 `src/icons/icons.js` 中维护图标：

### 3.1 登记图标数据
```javascript
export const ICONS = {
    // 单色图标
    home: {
        d: '<path d="..."/>',
    },
    // 双色图标（元素 0 为笔帽黄色，元素 1 为笔身深蓝）
    edit: {
        d: '<path d="M20.71,5.63..."/><path d="M3,17.33..."/><path d="M4.5,4.5..."/>',
    },
};
```

### 3.2 登记品牌色索引 `_BRAND_IDX`
记录黄色部件在子标签列表中的 **0-indexed** 下标：
```javascript
const _BRAND_IDX = {
    edit: [0],          // 元素 0 填充 url(#cgo-brand-grad)
    ticket: [1],        // 元素 1（撕角小票根）填充 url(#cgo-brand-grad)
    time: [2],          // 元素 2（斜向分针）填充 url(#cgo-brand-grad)
    calendar: [1, 3, 5],// 多元素支持：指定索引同时变为渐变色
};
```

---

## 4. 页面端主题渐变控制

### 4.1 方式一：通过 `data-app` 自动适配
在页面根标签 `<html data-app="...">` 声明：
- `data-app="vitool"`（默认）：紫色渐变（`#8a56dd` $\rightarrow$ `#af80d2`）
- `data-app="wall"`：玫瑰紫红渐变（`#843d79` $\rightarrow$ `#c46ea9`）
- `data-app="stasign"`：蓝紫渐变（`#7146c2` $\rightarrow$ `#92a6fc`）
- `data-app="staline"`：铁灰蓝渐变（`#3a6894` $\rightarrow$ `#84c2db`）
- `data-app="project"`：绿松青渐变（`#43b1a2` $\rightarrow$ `#8fdeb2`）
- `data-app="admin"`：深石板灰渐变（`#334155` $\rightarrow$ `#64748b`）

### 4.2 方式二：CSS 变量自定义
任意页面或局部作用域均可覆盖渐变两端颜色：
```css
:root {
    --brand-gradient-start-appname: #3b82f6;
    --brand-gradient-end-appname: #06b6d4;
}
```

---

## 5. 组件与 API 调用模式

CGoUI 图标支持三种工作模式：

```html
<!-- 1. 默认自适应模式：整图标随文字深浅色变化 -->
<cgo-icon name="edit" size="24"></cgo-icon>

<!-- 2. 固定颜色模式：整图标强制使用指定颜色 -->
<cgo-icon name="edit" color="#dc3545" size="24"></cgo-icon>

<!-- 3. 品牌渐变模式：开启双色！黄色路径变为渐变，其余随界面自适应 -->
<cgo-icon name="edit" color-mode="brand" size="24"></cgo-icon>
```

JavaScript 动态生成：
```javascript
// 生成带品牌双色渐变的 SVG 字符串
const svg = CGO.icon('edit', { colorMode: 'brand', size: 24 });
```

---

## 6. 图标别名规则

当存在同义别名（如 `open-link` 别名 `external`、`plus` 别名 `add`、`bell` 别名 `notification`）时：
- 在 `ICONS` 字典之后声明：`ICONS['open-link'] = ICONS.external;`
- **文档与索引展示要求**：在总览网格、介绍页面中，过滤别名引用，只展示标准本名，避免重复展示。
