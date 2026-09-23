/*!
 * CGoUI 组件文档站 — 数据驱动 + 哈希路由
 * 每个组件单独一页：实例演示 + props/slots/events/methods 表 + 可复制代码示例。
 * 组件元数据集中在 COMPONENTS；基础页（配色/Token/图标）在 FOUNDATION。
 */

/* ============ 组件元数据 ============ */
const AVATAR_COLORS = [
    '#ef4444',
    '#f87171',
    '#f97316',
    '#fb923c',
    '#f59e0b',
    '#eab308',
    '#fef08a',
    '#84cc16',
    '#a3e635',
    '#22c55e',
    '#10b981',
    '#059669',
    '#064e3b',
    '#0d9488',
    '#14b8a6',
    '#22d3ee',
    '#38bdf8',
    '#2563eb',
    '#1d4ed8',
    '#1e3a8a',
    '#4f46e5',
    '#6366f1',
    '#8b5cf6',
    '#c084fc',
    '#d946ef',
    '#ec4899',
    '#f472b6',
    '#fda4af',
    '#64748b',
    '#334155',
];

const COMPONENTS = [
    {
        id: 'button',
        tag: 'cgo-button',
        title: '按钮 Button',
        icon: 'touch',
        desc: '语义化按钮，支持 6 种变体、4 档尺寸、图标、加载态、纯图标与块级布局。点击 host 即触发原生 click。',
        examples: [
            {
                title: '变体',
                code: `<cgo-button variant="primary">主要</cgo-button>
<cgo-button variant="info">次级</cgo-button>
<cgo-button variant="dark">深色</cgo-button>
<cgo-button variant="success">成功</cgo-button>
<cgo-button variant="danger">危险</cgo-button>
<cgo-button variant="warning">警示</cgo-button>
<cgo-button variant="ghost">幽灵</cgo-button>
<cgo-button variant="glass">液态玻璃</cgo-button>`,
            },
            {
                title: '尺寸',
                code: `<cgo-button variant="primary" size="sm">小</cgo-button>
<cgo-button variant="primary">默认</cgo-button>
<cgo-button variant="primary" size="lg">大</cgo-button>
<cgo-button variant="primary" size="xl">超大</cgo-button>`,
            },
            {
                title: '带图标',
                code: `<cgo-button variant="primary" icon="back">返回</cgo-button>
<cgo-button variant="primary" icon="home-dots">仪表盘</cgo-button>
<cgo-button variant="info" icon="help">帮助</cgo-button>
<cgo-button variant="danger" icon="delete">删除</cgo-button>
<cgo-button variant="info" icon="download" icon-pos="right">导出</cgo-button>`,
            },
            {
                title: '加载 / 纯图标 / 块级',
                code: `<cgo-button variant="primary" loading>加载中</cgo-button>
<cgo-button variant="info" icon="settings" icon-only></cgo-button>
<cgo-button variant="info" icon="search" icon-only size="sm"></cgo-button>
<cgo-button variant="primary" icon="save" full>块级铺满按钮</cgo-button>`,
            },
            {
                title: '胶囊形（筛选 / 控制栏）',
                code: `<cgo-button pill active>全部</cgo-button>
<cgo-button pill>近期</cgo-button>
<cgo-button pill>已完成</cgo-button>
<cgo-button pill variant="primary" icon="add">新建</cgo-button>`,
            },
            {
                title: '使用 CSS 变量作为按钮颜色',
                code: `<cgo-button color="var(--line-color-1)">1号线按钮</cgo-button>
<cgo-button color="var(--line-color-13)" text-color="var(--line-color-text-dark)">13号线按钮</cgo-button>
<cgo-button color="var(--success-color)">成功按钮</cgo-button>`,
            },
        ],
        props: [
            ['variant', `primary | info | dark | success | warning | danger | ghost | glass`, 'info', '按钮语义变体'],
            ['size', `'' | sm | lg | xl`, `''`, '尺寸档位'],
            ['icon', 'string', `''`, '图标名（见图标库页）'],
            ['icon-pos', 'left | right', 'left', '图标位置'],
            ['disabled', 'boolean', 'false', '禁用'],
            ['loading', 'boolean', 'false', '加载态（显示旋转并禁用）'],
            ['full', 'boolean', 'false', '块级铺满宽度'],
            ['icon-only', 'boolean', 'false', '纯图标方形按钮'],
            ['pill', 'boolean', 'false', '胶囊形（筛选/控制栏样式）'],
            ['active', 'boolean', 'false', '胶囊激活态（高亮为主色）'],
            ['type', 'string', 'button', '原生 button type'],
            ['color', 'string', `''`, '自定义背景色，可传 CSS 变量，如 var(--line-color-1)'],
            ['text-color', 'string', `''`, '自定义文字色，浅色线路可传 var(--line-color-text-dark)'],
        ],
        slots: [['(默认)', '按钮文字内容']],
        events: [['click', '原生点击事件（在 host 上监听即可）']],
    },
    {
        id: 'input',
        tag: 'cgo-input',
        title: '输入框 Input',
        icon: 'vi-text',
        desc: '文本输入框组件。内置 label、hint 说明文字、校验状态（success / danger / info）、禁用及快捷状态机。派发原生风格 cgo-input 事件。',
        examples: [
            {
                title: '基础与标签',
                code: `<cgo-input label="用户名" placeholder="请输入用户名"></cgo-input>
<cgo-input label="密码" type="password" placeholder="请输入密码"></cgo-input>`,
            },
            {
                title: '校验状态与提示',
                code: `<cgo-input label="电子邮箱" value="invalid-email" state="danger" hint="请输入有效的邮箱地址"></cgo-input>
<cgo-input label="邀请码" value="CGO-2026-OK" state="success" hint="邀请码有效"></cgo-input>`,
            },
            {
                title: '禁用状态',
                code: `<cgo-input label="系统标识" value="cgo_sys_core" disabled hint="只读字段，不可更改"></cgo-input>`,
            },
        ],
        props: [
            ['label', 'string', `''`, '输入框标签'],
            ['value', 'string', `''`, '当前值'],
            ['placeholder', 'string', `''`, '聚焦时显示的占位提示'],
            ['type', 'string', 'text', '原生 input type'],
            ['hint', 'string', `''`, '辅助说明'],
            ['state', `'' | success | danger | info`, `''`, '提示文字状态'],
            ['disabled', 'boolean', 'false', '禁用'],
        ],
        slots: [],
        events: [['cgo-input', '输入时派发，detail.value 为当前值']],
    },
    {
        id: 'badge',
        tag: 'cgo-badge',
        title: '徽章 Badge',
        icon: 'sparkle',
        desc: '小气泡 / 状态标签。',
        examples: [
            {
                title: '语义变体',
                code: `<cgo-badge variant="primary">主要</cgo-badge>
<cgo-badge variant="info">信息</cgo-badge>
<cgo-badge variant="success">成功</cgo-badge>
<cgo-badge variant="warning">警告</cgo-badge>
<cgo-badge variant="danger">危险</cgo-badge>`,
            },
            {
                title: '胶囊样式',
                code: `<cgo-badge variant="primary" pill>常旅客</cgo-badge>
<cgo-badge variant="info" pill>先锋旅客</cgo-badge>
<cgo-badge variant="success" pill>启元旅客</cgo-badge>`,
            },
        ],
        props: [
            ['variant', `primary | info | success | warning | danger`, 'info', '语义类型'],
            ['pill', 'boolean', 'false', '是否为胶囊外形'],
            ['subsystem', `vitool | wall | stasign | staline | project | appname`, `''`, '子系统品牌渐变；appname 跟随 html[data-app]'],
        ],
        slots: [['(默认)', '徽章文字']],
        events: [],
    },
    {
        id: 'icon',
        tag: 'cgo-icon',
        title: '图标 Icon',
        icon: 'layer',
        desc: '自包含 SVG 图标组件，数据来自共享图标注册表（共 158 个核心图标）。支持三种颜色模式：自适应界面颜色（默认）、固定颜色、品牌渐变色。',
        examples: [
            {
                title: '基础用法与尺寸',
                code: `<cgo-icon name="home"></cgo-icon>
<cgo-icon name="search" size="28"></cgo-icon>
<cgo-icon name="settings" size="36"></cgo-icon>`,
            },
            {
                title: '【模式1】自适应界面颜色 (默认)',
                code: `<!-- 不加任何颜色声明，图标自动跟随界面 currentColor -->
<!-- 深色按钮上自动显示白色，浅色按钮上自动显示深色 -->
<cgo-button variant="primary" icon="home-dots">仪表盘</cgo-button>
<cgo-button variant="info" icon="search">搜索</cgo-button>
<cgo-button variant="primary" icon="save">保存</cgo-button>`,
            },
            {
                title: '【模式2】固定颜色',
                code: `<!-- 声明 color 属性，所有路径统一使用该颜色 -->
<cgo-icon name="star" color="#e98913" size="32"></cgo-icon>
<cgo-icon name="error" color="#dc3545" size="28"></cgo-icon>
<cgo-icon name="check-circle" color="#28a745" size="28"></cgo-icon>
<cgo-icon name="info" color="#980090" size="28"></cgo-icon>

<!-- 也可用于按钮图标 -->
<cgo-button variant="info" icon="download" icon-color="#006098">导出（图标用 icon-color 固定色）</cgo-button>`,
            },
            {
                title: '【模式3】品牌渐变色',
                code: `<!-- 声明 color-mode="brand"，品牌色路径使用渐变，其余随界面色 -->
<!-- 需要页面定义 CSS 变量 --brand-gradient-start-appname / --brand-gradient-end-appname -->
<cgo-icon name="addone" color-mode="brand" size="24"></cgo-icon>
<cgo-icon name="edit" color-mode="brand" size="24"></cgo-icon>
<cgo-icon name="delete" color-mode="brand" size="24"></cgo-icon>`,
            },
            {
                title: 'JS API 三种模式',
                hidePreview: true,
                code: `// 模式1：自适应界面颜色
CGO.icon("addone");

// 模式2：固定颜色
CGO.icon("star", { color: "#e98913" });

// 模式3：品牌渐变色
CGO.icon("edit", { colorMode: "brand" });`,
            },
        ],
        props: [
            ['name', 'string', `''`, '图标名（见图标库页可点击复制）'],
            ['size', 'number | string', '20', '宽高，纯数字按 px 处理'],
            ['color', 'string', `''`, '固定填充色（设置后自动进入 fixed 模式）'],
            ['color-mode', 'auto | fixed | brand', 'auto', '颜色模式：auto=随界面 | fixed=固定色 | brand=品牌渐变'],
        ],
        slots: [],
        events: [],
    },
    {
        id: 'card',
        tag: 'cgo-card',
        title: '卡片 Card',
        icon: 'view-grid',
        desc: '旧版 tool-card、glass-card、info-card、danger-card 的组件化封装，支持次世代 Liquid Glass 三档玻璃模式（默认扁平，按需开启模糊/折射）。',
        examples: [
            {
                title: '标准卡片类型（默认扁平风格，零破坏保证）',
                code: `<cgo-card title="标准卡片 .tool-card">带圆角 12px、轻阴影，悬停时阴影加深。用于内容分块展示。</cgo-card>
<cgo-card variant="glass" title="经典玻璃态卡片 .glass-card">默认保持原版扁平风格。当页面或卡片开启 glass-mode 属性时激活对应玻璃质感。</cgo-card>
<cgo-card variant="info" title="渐变信息卡 .info-card">用于页面底部说明区域，展示版权、备案或功能介绍。</cgo-card>
<cgo-card variant="danger" title="危险操作区域 .danger-card">该操作是永久性的，且不可撤销。</cgo-card>`,
            },
            {
                title: 'Liquid Glass 液态玻璃三档模式（在绚丽背景上对比演示）',
                code: `<div style="background: linear-gradient(135deg, #0076a8, #00263b 40%, #009655 75%, #5f1985); padding: 24px; border-radius: 16px; display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
  <cgo-card variant="glass" glass-mode="liquid" title="1. 折射+模糊 (liquid)">
    开启硬件加速 SVG 光学折射、5px 模糊、双轴微光圈与多重微阴影，呈现次世代物理流体质感。
  </cgo-card>
  <cgo-card variant="glass" glass-mode="blur" title="2. 仅模糊 (blur)">
    仅应用 5px 模糊与微透衬底，不计算 SVG 空间折射，轻量通透，适合中低端设备。
  </cgo-card>
  <cgo-card variant="glass" glass-mode="flat" title="3. 经典扁平 (flat / 默认)">
    无模糊无折射，恢复经典原版实体背景与常规边框，保证对现有网页 100% 零非预期影响。
  </cgo-card>
</div>`,
            },
            {
                title: '液态玻璃三档卡片分类规范 (Tier A 可交互 / Tier B 不可交互底板 / Tier C 不可交互强调)',
                code: `<div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
  <!-- Tier A: 可交互入口卡片 (0.60 -> hover 0.68 + 上移4px) -->
  <div class="glass-card interactive" style="padding: 16px; border-radius: 12px; cursor: pointer;">
    <strong>Tier A: 可交互卡片 (.glass-card / .tool-item)</strong>
    <p style="margin: 8px 0 0; font-size: 13px;">中低不透明度，悬停时产生弹性位移与高亮反馈，用于按钮与工具卡片。</p>
  </div>

  <!-- Tier B: 不可交互底板 (0.82 固定，零 hover 动效) -->
  <div class="glass-panel" style="padding: 16px; border-radius: 12px;">
    <strong>Tier B: 不可交互底板 (.glass-panel)</strong>
    <p style="margin: 8px 0 0; font-size: 13px;">高不透明度，零 hover 反应，用于正文分栏、工作台、承载复杂图表与表单。</p>
  </div>

  <!-- Tier C: 不可交互强调板 (0.72 固定，零 hover 动效) -->
  <div class="glass-surface" style="padding: 16px; border-radius: 12px;">
    <strong>Tier C: 不可交互强调表面 (.glass-surface / .header-island)</strong>
    <p style="margin: 8px 0 0; font-size: 13px;">中不透明度，全双轴微光圈，零 hover 反应，用于悬浮标题栏双岛与重点承载板。</p>
  </div>
</div>`,
            },
        ],
        props: [
            ['variant', `standard | glass | info | danger`, 'standard', '卡片视觉类型'],
            ['glass-mode', `liquid | blur | flat`, '（继承全局默认 flat）', '玻璃模式档位：liquid(折射+模糊) / blur(仅模糊) / flat(完全扁平)'],
            ['tier', `A (.tool-item) | B (.glass-panel) | C (.glass-surface)`, '—', '液态玻璃卡片分类分档：Tier A 可交互 / Tier B 不可交互底板 / Tier C 不可交互强调表面'],
            ['title', 'string', `''`, '卡片标题'],
        ],
        slots: [['(默认)', '卡片正文']],
        events: [],
    },
    {
        id: 'dropdown',
        tag: 'cgo-dropdown',
        title: '菜单按钮 Dropdown',
        icon: 'file',
        desc: '菜单按钮：触发器 + 菜单两个插槽。互斥展开、点击外部关闭、点击菜单项后自动收起。',
        examples: [
            {
                title: '带图标 / 分隔线 / 危险项',
                code: `<cgo-dropdown align="left">
  <cgo-button slot="trigger" variant="primary" icon="file">文件</cgo-button>
  <a href="#"><cgo-icon name="upload" size="18"></cgo-icon> 导入配置文件</a>
  <a href="#"><cgo-icon name="export-img" size="18"></cgo-icon> 导出 PNG</a>
  <div class="dropdown-divider"></div>
  <a href="#"><cgo-icon name="edit" size="18"></cgo-icon> 导出 SVG</a>
</cgo-dropdown>

<cgo-dropdown align="left">
  <cgo-button slot="trigger" variant="info">更多选项</cgo-button>
  <a href="#">设置</a>
  <a href="#">帮助</a>
  <div class="dropdown-divider"></div>
  <a href="#" style="color:var(--danger-color)">退出登录</a>
</cgo-dropdown>`,
            },
        ],
        props: [
            ['open', 'boolean', 'false', '是否展开（也可程序控制）'],
            ['align', 'left | right | center', 'right', '菜单对齐方向'],
        ],
        slots: [
            ['trigger', '触发按钮'],
            ['(默认)', '菜单项（a / button / .dropdown-item）'],
        ],
        events: [],
        methods: [['show() / close()', '展开 / 收起菜单']],
    },
    {
        id: 'tabs',
        tag: 'cgo-tabs',
        title: '选项卡 Tabs',
        icon: 'tabs',
        desc: '管理一组选项卡面板，标签栏从每个 cgo-tab 的 label 自动生成。',
        examples: [
            {
                title: '基础',
                code: `<cgo-tabs>
  <cgo-tab label="概览">选项卡内容区域 — 使用 .tabs-wrapper + .modern-tabs + .tab-item.active 的视觉规范。</cgo-tab>
  <cgo-tab label="设计规范">用于承载说明、表格、表单或组件演示。</cgo-tab>
  <cgo-tab label="组件">组件化迁移后仍保持旧版 CGUI 的标签栏样式。</cgo-tab>
  <cgo-tab label="接入指南">支持 Web Components，并预留 Vue / React 封装能力。</cgo-tab>
  <cgo-tab label="更新日志">更新记录与变更说明。</cgo-tab>
</cgo-tabs>`,
            },
        ],
        props: [
            ['index', 'number', '0', '（cgo-tabs）当前激活索引'],
            ['label', 'string', `''`, '（cgo-tab）选项卡标题'],
        ],
        slots: [['(默认)', '一组 <cgo-tab>；每个 cgo-tab 内为该页内容']],
        events: [['cgo-tab-change', 'detail.index 为新索引']],
    },
    {
        id: 'side-nav',
        tag: 'cgo-side-nav',
        title: '侧边导航 Side Nav',
        icon: 'view-list',
        desc: '自适应侧边导航组件。电脑端显示为纵向侧边栏导航（磨砂玻璃背景），移动端自动切换为顶部水平滚动胶囊选项卡。使用 <cgo-nav-item> 子元素定义导航项。',
        examples: [
            {
                title: '基础导航（调整窗口大小查看响应式效果）',
                code: `<cgo-side-nav style="height:340px;">
  <cgo-nav-item icon="user" label="个人资料" target="panel-profile" active></cgo-nav-item>
  <cgo-nav-item icon="card" label="一卡通升级" target="panel-card-mgmt"></cgo-nav-item>
  <cgo-nav-item icon="lock" label="密码设置" target="panel-security"></cgo-nav-item>
  <cgo-nav-item icon="settings" label="管理偏好" target="panel-preferences"></cgo-nav-item>
  <cgo-nav-item icon="chat" label="联系我们" target="panel-contact"></cgo-nav-item>
  <cgo-nav-item icon="error-outline" label="危险区" target="panel-danger" danger></cgo-nav-item>
</cgo-side-nav>`,
            },
            {
                title: '带用户简介区（user-brief 插槽）',
                code: `<cgo-side-nav style="height:380px;">
  <div slot="user-brief" style="display:flex;flex-direction:column;align-items:center;gap:8px;">
    <cgo-avatar name="张三" color="#2563eb" size="48"></cgo-avatar>
    <div style="font-weight:600;color:var(--text-main);">张三</div>
    <div style="font-size:0.85rem;color:var(--text-light);">zhangsan@example.com</div>
  </div>
  <cgo-nav-item icon="user" label="个人资料" target="panel-profile" active></cgo-nav-item>
  <cgo-nav-item icon="card" label="一卡通升级" target="panel-card-mgmt"></cgo-nav-item>
  <cgo-nav-item icon="settings" label="管理偏好" target="panel-preferences"></cgo-nav-item>
</cgo-side-nav>`,
            },
            {
                title: '带底部操作区（footer 插槽）',
                code: `<cgo-side-nav style="height:380px;">
  <cgo-nav-item icon="user" label="个人资料" active></cgo-nav-item>
  <cgo-nav-item icon="card" label="一卡通升级"></cgo-nav-item>
  <cgo-nav-item icon="lock" label="密码设置"></cgo-nav-item>
  <cgo-button slot="footer" variant="danger" full>退出登录</cgo-button>
</cgo-side-nav>`,
            },
        ],
        props: [
            ['active-index', 'number', '0', '（cgo-side-nav）当前激活项索引'],
            ['icon', 'string', `''`, '（cgo-nav-item）图标名称'],
            ['label', 'string', `''`, '（cgo-nav-item）显示文本'],
            ['target', 'string', `''`, '（cgo-nav-item）对应面板 ID'],
            ['danger', 'boolean', 'false', '（cgo-nav-item）危险区红色样式'],
        ],
        slots: [
            ['(默认)', '一组 <cgo-nav-item> 元素'],
            ['user-brief', '侧边栏顶部用户信息区（移动端隐藏）'],
            ['footer', '侧边栏底部操作区（移动端隐藏）'],
        ],
        events: [['cgo-nav-change', 'detail = { index, target, item }']],
    },
    {
        id: 'modal',
        tag: 'cgo-modal',
        title: '弹窗 Modal',
        icon: 'info',
        desc: '遮罩 + 居中对话框，移动端自动转底部抽屉。支持点击遮罩 / Esc 关闭。',
        examples: [
            {
                title: '普通功能对话框',
                code: `<cgo-button variant="primary"
  onclick="this.nextElementSibling.show()">打开弹窗</cgo-button>
<cgo-modal title="普通功能对话框" max-width="760px">
  <p style="color:var(--text-light);margin:0 0 26px;">这是一个普通的配置或数据编辑对话框。在移动端（宽度 <= 640px）下，它将自动切换为底置的抽屉式拉出浮层。</p>
  <div class="form-group">
    <label>配置项名称</label>
    <input class="form-control" type="text">
  </div>
  <div class="dialog-buttons">
    <button class="btn btn-info" onclick="this.closest('cgo-modal').open=false">取消</button>
    <button class="btn btn-primary">确认保存</button>
  </div>
</cgo-modal>`,
            },
            {
                title: '帮助 / 关于弹窗',
                code: `<cgo-button variant="primary" onclick="CGO.showHelpModal({
  title: 'CGo UI Library',
  subtitle: 'Central Go 前端视觉库 · 2026年6月26日更新',
  iconPath: '../icon.png',
  content: '<div class=&quot;help-grid&quot;><div class=&quot;help-card&quot;><div class=&quot;help-card-icon&quot;></div><h4>配色系统</h4><ul><li>完整亮/暗主题切换</li><li>28条地铁线路色</li><li>30种头像预制配色</li></ul></div><div class=&quot;help-card&quot;><div class=&quot;help-card-icon&quot;></div><h4>组件库</h4><ul><li>按钮、表单、表格</li><li>弹窗、Toast、下拉菜单</li><li>地图控件、聊天气泡</li></ul></div></div><div class=&quot;help-data-info&quot;>接入方法：引入 4 个 CSS 文件 + 1 个 JS 核心文件，无需任何构建工具。</div>',
  maxWidth: '520px'
})">打开帮助弹窗</cgo-button>`,
            },
        ],
        props: [
            ['open', 'boolean', 'false', '是否打开'],
            ['title', 'string', `''`, '标题'],
            ['max-width', 'string', `''`, '对话框最大宽度，如 420px'],
            ['close-on-overlay', 'boolean', 'true', '点击遮罩是否关闭'],
        ],
        slots: [['(默认)', '弹窗正文']],
        events: [['cgo-close', '关闭时派发（遮罩 / 关闭按钮 / Esc）']],
        methods: [['show()', '打开弹窗（等价于 open=true）']],
    },
    {
        id: 'toast',
        tag: 'cgo-toast',
        title: '短消息提示 Toast',
        icon: 'notification',
        desc: '右上角紧凑气泡提示（与 Popup 通知同排共享队列，不进入通知中心）。通常不直接写标签，用 showToast() 或 window.CGO.showToast() 命令式调用。',
        examples: [
            {
                title: '命令式调用',
                code: `<cgo-button variant="primary"
  onclick="CGO.showToast('操作成功', 'success')">成功</cgo-button>
<cgo-button variant="danger"
  onclick="CGO.showToast('出错了', 'error')">错误</cgo-button>
<cgo-button variant="info"
  onclick="CGO.showToast('普通提示', 'info', 2000)">提示</cgo-button>`,
            },
        ],
        props: [],
        slots: [],
        events: [],
        methods: [
            [`CGO.showToast(message, type?, duration?)`, `type: info|success|error|warning；duration 毫秒，默认 3000`],
            [`<cgo-toast>.show(message, type?, duration?)`, '实例方法，等价于上面（一般无需手动创建容器）'],
        ],
    },
    {
        id: 'notice',
        tag: 'cgo-notice-card',
        title: '通知 Notification',
        icon: 'chat-bubble',
        desc: '来源于 CGoPush 的标准化通知与公告中心组件。包含单卡片 <cgo-notice-card>、完整通知中心面板 <cgo-notice-center> 以及浮动推送弹窗 <cgo-notice-popup>。支持 4 大主题分类 (software, operation, promotion, system)。',
        examples: [
            {
                title: '四种分类通知卡片 (Software / Operation / Promotion / System)',
                code: `<div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px;">
  <cgo-notice-card
    category="software"
    notice-title="CGoUI 2.0 正式发布"
    content="包含全新的 Web Components 架构、深色模式自适应与 CGoPush 通知体系支持。"
    .actions=\${[{ label: '查看详情', primary: true }]}
  ></cgo-notice-card>
  
  <cgo-notice-card
    category="operation"
    notice-title="北京地铁一期工程开通运营"
    content="玉泉路站至北京火车站段于今日起投入试运营，请乘客注意换乘标志。"
    .actions=\${['已读']}
  ></cgo-notice-card>

  <cgo-notice-card
    category="promotion"
    notice-title="加入 Central Go 交流群"
    content="与轨道交通爱好者一起交流探讨轨道交通相关话题。"
  ></cgo-notice-card>

  <cgo-notice-card
    category="system"
    notice-title="系统收到一条新留言回复"
    content="管理员回复了您的关于「亦庄T1线颜色」的反馈。"
    .actions=\${['忽略', { label: '查看回复', primary: true }]}
  ></cgo-notice-card>
</div>`,
            },
            {
                title: '紧凑气泡模式 (popup 模式)',
                code: `<div style="display:flex;gap:16px;flex-wrap:wrap;">
  <cgo-notice-card
    popup
    closable
    category="software"
    notice-title="软件版本更新已准备就绪"
  ></cgo-notice-card>

  <cgo-notice-card
    popup
    closable
    category="operation"
    notice-title="10号线部分列车时刻表调整"
  ></cgo-notice-card>
</div>`,
            },
            {
                title: '完整通知中心面板 <cgo-notice-center>',
                code: `<cgo-notice-center
  title="通知中心"
  max-height="360px"
  items='[
    {"category": "software", "title": "导向设计工作室套件更新", "content": "本次更新新增了不同格式文件的导出。", "actions": [{"label": "更新日志"}]},
    {"category": "operation", "title": "新线路建设进度公告", "content": "预计于今年年底开通的新线路建设状态已更新。", "actions": ["已读"]},
    {"category": "system", "title": "账号信息变更成功", "content": "您的个人邮箱绑定已更新。"}
  ]'
></cgo-notice-center>`,
            },
            {
                title: '浮动弹窗推送测试 (showNoticePopup 命令式调用)',
                code: `<div style="display:flex;gap:10px;flex-wrap:wrap;">
  <cgo-button variant="primary" icon="train" onclick="
    if (window.CGO && window.CGO.showNoticePopup) {
      window.CGO.showNoticePopup({
        category: 'software',
        title: '发现软件新版本',
        content: '点击下方按钮即可体验前往体验。',
        actions: [{ label: '体验新版', primary: true }]
      }, 6000);
    }
  ">弹出软件更新通知 (6s 自动关)</cgo-button>
  
  <cgo-button variant="warning" icon="info" onclick="
    if (window.CGO && window.CGO.showNoticePopup) {
      window.CGO.showNoticePopup({
        category: 'operation',
        title: '临时运营调整通知',
        content: '因特殊天气，部分车次今日暂时停运。'
      }, 0);
    }
  ">弹出运营通知 (手动关闭)</cgo-button>
</div>`,
            }
        ],
        props: [
            ['category', 'software | operation | promotion | system', 'software', '分类主题 Token 及对应标色与默认图标'],
            ['notice-title', 'string', `''`, '通知卡片标题'],
            ['content', 'string', `''`, '通知正文/具体描述'],
            ['image-url', 'string', `''`, '通知附件图片 URL'],
            ['popup', 'boolean', 'false', '紧凑气泡弹窗模式 (在浮动通知中启用)'],
            ['closable', 'boolean', 'false', '显示右上角关闭按钮'],
            ['actions', 'Array', '[]', '底部操作按钮配置数组，如 ["已读", { label: "查看", primary: true }]'],
            ['cat-name', 'string', `''`, '自定义分类显示名称'],
        ],
        slots: [
            ['(默认)', '卡片内部自定义插槽内容']
        ],
        events: [
            ['cgo-notice-close', '点击卡片右上角关闭按钮时触发'],
            ['cgo-notice-action', '点击底部操作按钮时触发 ({ detail: { action, title } })'],
            ['cgo-notice-clear', '通知中心点击“清除所有通知”时触发'],
            ['cgo-notice-mute-toggle', '通知中心点击“免打扰/静默”开关时触发 ({ detail: { muted } })']
        ],
        methods: [
            ['showNoticePopup(config, durationMs)', '全局命令式调用浮动推送 popup 通知 (也可通过 CGO.showNoticePopup 调用)']
        ]
    },
    {
        id: 'tooltip',
        tag: 'cgo-tooltip',
        title: '工具提示 Tooltip',
        icon: 'eye',
        desc: '包裹任意内容，悬停时在上方/下方显示气泡提示。',
        examples: [
            {
                title: '上方 / 下方',
                code: `<cgo-tooltip text="这是顶部提示">
  <cgo-button variant="info">悬停我</cgo-button>
</cgo-tooltip>
<cgo-tooltip text="这是底部提示" placement="bottom">
  <cgo-button variant="info">底部提示</cgo-button>
</cgo-tooltip>`,
            },
        ],
        props: [
            ['text', 'string', `''`, '提示文字'],
            ['placement', 'top | bottom', 'top', '气泡位置'],
        ],
        slots: [['(默认)', '被包裹的触发元素']],
        events: [],
    },
    {
        id: 'spinner',
        tag: 'cgo-spinner',
        title: '进度圆环 Progress Ring',
        icon: 'loading',
        desc: '环形加载指示器与进度圆环组件。支持 Spinner 旋转加载与 Progress 进度填充/清空，提供慢中快 3 档速度、顺逆时针旋转/填充方向选择及设定时间自动动画。',
        examples: [
            {
                title: 'Spinner 尺寸与速度 (慢、中、快速)',
                code: `<div style="display:flex;align-items:center;gap:24px;">
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><cgo-spinner speed="slow"></cgo-spinner><span style="font-size:12px;color:#666;">慢速 (slow / 2s)</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><cgo-spinner speed="medium"></cgo-spinner><span style="font-size:12px;color:#666;">中速 (medium / 1s 默认)</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><cgo-spinner speed="fast"></cgo-spinner><span style="font-size:12px;color:#666;">快速 (fast / 0.5s)</span></div>
</div>`,
            },
            {
                title: 'Spinner 旋转方向 (顺时针 vs 逆时针)',
                code: `<div style="display:flex;align-items:center;gap:24px;">
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><cgo-spinner direction="cw"></cgo-spinner><span style="font-size:12px;color:#666;">顺时针 (cw 默认)</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><cgo-spinner direction="ccw"></cgo-spinner><span style="font-size:12px;color:#666;">逆时针 (ccw)</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><cgo-spinner size="sm" direction="ccw" speed="fast"></cgo-spinner><span style="font-size:12px;color:#666;">小尺寸逆时针快速</span></div>
</div>`,
            },
            {
                title: '进度圆环 - 百分比显示模式 (显示百分比 vs 不显示百分比)',
                code: `<div style="display:flex;align-items:center;gap:32px;">
  <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
    <cgo-spinner mode="progress" value="75" size="lg"></cgo-spinner>
    <span style="font-size:12px;color:#666;">不显示百分比 (默认)</span>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
    <cgo-spinner mode="progress" value="75" show-text size="lg"></cgo-spinner>
    <span style="font-size:12px;color:#666;">显示百分比 (show-text / show-percentage)</span>
  </div>
</div>`,
            },
            {
                title: '进度圆环 - 实时进度 (填色 vs 清空 & 顺时针 vs 逆时针)',
                code: `<div style="display:flex;flex-direction:column;gap:16px;width:100%;max-width:560px;">
  <div style="display:flex;align-items:center;gap:12px;">
    <input type="range" id="spinner-slider" min="0" max="100" value="65" style="flex:1;" oninput="
      ['sp-cw-fill', 'sp-ccw-fill', 'sp-cw-clear', 'sp-ccw-clear'].forEach(id => {
        document.getElementById(id).value = this.value;
      });
    ">
    <span style="font-size:13px;font-weight:bold;width:40px;">65%</span>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-around;gap:16px;background:var(--bg-card, #f8f9fa);padding:16px;border-radius:8px;">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <cgo-spinner id="sp-cw-fill" mode="progress" fill-mode="fill" direction="cw" value="65" show-text size="lg"></cgo-spinner>
      <span style="font-size:12px;">填色 · 顺时针</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <cgo-spinner id="sp-ccw-fill" mode="progress" fill-mode="fill" direction="ccw" value="65" show-text size="lg"></cgo-spinner>
      <span style="font-size:12px;">填色 · 逆时针</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <cgo-spinner id="sp-cw-clear" mode="progress" fill-mode="clear" direction="cw" value="65" show-text size="lg"></cgo-spinner>
      <span style="font-size:12px;">清空 · 顺时针</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <cgo-spinner id="sp-ccw-clear" mode="progress" fill-mode="clear" direction="ccw" value="65" show-text size="lg"></cgo-spinner>
      <span style="font-size:12px;">清空 · 逆时针</span>
    </div>
  </div>
</div>`,
            },
            {
                title: '进度圆环 - 设定时间自动过渡动画 (duration="3s")',
                code: `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
  <cgo-spinner id="auto-spinner-1" mode="progress" fill-mode="fill" direction="cw" show-text size="lg"></cgo-spinner>
  <cgo-spinner id="auto-spinner-2" mode="progress" fill-mode="clear" direction="ccw" show-text size="lg"></cgo-spinner>
  <cgo-button size="sm" variant="primary" onclick="
    document.getElementById('auto-spinner-1').start(3000);
    document.getElementById('auto-spinner-2').start(3000);
  ">播放 3 秒填充/清空动画</cgo-button>
</div>`,
            },
        ],
        props: [
            ['mode', 'spinner | progress', 'spinner', '模式：spinner (加载指示器) 或 progress (进度圆环)'],
            ['size', `'' | sm | lg | number`, `''`, '尺寸档位或自定义像素数字'],
            ['speed', 'slow | medium | fast', 'medium', 'Spinner 旋转速度档位：slow (2s)、medium (1s)、fast (0.5s)'],
            ['direction', 'cw | ccw', 'cw', '旋转/填充方向：cw (顺时针) 或 ccw (逆时针)'],
            ['fill-mode', 'fill | clear', 'fill', '进度圆环模式：fill (填色) 或 clear (清空)'],
            ['value', 'number (0..100)', '0', '进度圆环实时百分比数值'],
            ['show-text / show-percentage', 'boolean', 'false', '是否在圆环中心显示百分比文本 (显示/不显示百分比)'],
        ],
        slots: [],
        events: [
            ['cgo-progress-change', '进度改变时派发，detail 包含 { value }'],
            ['cgo-progress-complete', '自动动画完成时派发，detail 包含 { value }'],
        ],
        methods: [
            ['start(durationMs)', '开始自动过渡动画'],
            ['reset()', '重置进度数值为 0'],
            ['setValue(val)', '手动设置进度数值 (0-100)'],
        ],
    },
    {
        id: 'table',
        tag: 'cgo-table',
        title: '表格 Table',
        icon: 'table',
        desc: '旧版表格容器组件。内部可放标准 table，推荐继续使用 modern-table 类名保持旧样式。',
        examples: [
            {
                title: '基础表格',
                code: `<cgo-table>
  <table class="modern-table">
    <thead><tr><th>线路</th><th>旧站名</th><th>新站名</th><th>状态</th></tr></thead>
    <tbody>
      <tr><td>6号线</td><td>草房</td><td class="same">草房</td><td><span class="badge badge-success">未变更</span></td></tr>
      <tr><td>八通线</td><td>广播学院</td><td class="diff">传媒大学</td><td><span class="badge badge-danger">已变更</span></td></tr>
    </tbody>
  </table>
</cgo-table>`,
            },
        ],
        props: [],
        slots: [['(默认)', 'table 元素']],
        events: [],
    },
    {
        id: 'avatar',
        tag: 'cgo-avatar',
        title: '头像 Avatar',
        icon: 'user',
        desc: '圆形头像，支持图片或首字母占位（中文取末字、英文取首字母）。',
        examples: [
            {
                title: '首字母 / 颜色 / 尺寸',
                code: `<cgo-avatar name="张三"></cgo-avatar>
<cgo-avatar name="李四" color="#e98913"></cgo-avatar>
<cgo-avatar name="Wang Wu" color="#5f1985" size="80"></cgo-avatar>`,
            },
            {
                title: '30 色头像色板（点击复制颜色）',
                hideCode: true,
                code: `<div class="avatar-color-board">
${AVATAR_COLORS.map((color, i) => `<button class="avatar-color-copy" data-copy-color="${color}" style="background:${color}" title="复制 ${color}">${i + 1}</button>`).join('\n')}
</div>`,
            },
        ],
        props: [
            ['name', 'string', `''`, '姓名，用于生成首字母'],
            ['src', 'string', `''`, '头像图片地址（优先）'],
            ['color', 'string', `''`, '占位背景色'],
            ['size', 'number | string', '60', '直径'],
        ],
        slots: [],
        events: [],
    },
    {
        id: 'chat-bubble',
        tag: 'cgo-chat-bubble',
        title: '聊天气泡 Chat Bubble',
        icon: 'chat',
        desc: '对话气泡。role=user 右侧主色，role=bot 左侧浅色；可选 sender / time 显示发信人与时间。',
        examples: [
            {
                title: '带发信人与时间',
                code: `<div style="display:flex;flex-direction:column;width:100%;max-width:520px;">
  <cgo-chat-bubble role="bot" sender="旅客" time="19:15">你好！地铁线路图数据什么时候更新？</cgo-chat-bubble>
  <cgo-chat-bubble role="user" sender="管理员" time="19:16">官方发布新线或更名通知后 24 小时内同步。</cgo-chat-bubble>
</div>`,
            },
        ],
        props: [
            ['role', 'user | bot', 'bot', '气泡角色（决定左右与配色）'],
            ['sender', 'string', `''`, '发信人，显示在 meta 行'],
            ['time', 'string', `''`, '时间，显示在 meta 行'],
        ],
        slots: [['(默认)', '消息内容']],
        events: [],
    },
    {
        id: 'media-viewer',
        tag: 'cgo-media-viewer',
        title: '媒体查看器 Media Viewer',
        icon: 'play',
        desc: '带点阵背景预览区和底部操作栏的媒体查看器组件。',
        examples: [
            {
                title: '基础',
                code: `<cgo-media-viewer>
  图片/媒体预览区域 (自适应背景网格点)
  <cgo-button slot="actions" variant="info" size="sm" icon="star">收藏</cgo-button>
  <cgo-button slot="actions" variant="primary" size="sm" icon="download">下载图片</cgo-button>
</cgo-media-viewer>`,
            },
        ],
        props: [['label', 'string', '图片/媒体预览区域...', '默认占位文字']],
        slots: [
            ['(默认)', '预览区内容'],
            ['actions', '底部操作按钮'],
        ],
        events: [],
    },
    {
        id: 'floating-window',
        tag: 'cgo-floating-window',
        title: '悬浮窗 Floating Window',
        icon: 'window',
        desc: '旧版浮动控制面板的组件化封装。支持拖拽、贴边自动磁吸对齐、折叠/最小化及关闭等丰富的交互逻辑。',
        examples: [
            {
                title: '可拖拽与磁吸演示',
                previewStyle: 'min-height: 520px;',
                code: `<cgo-floating-window title="浮动控制面板 (标准)" style="position: absolute; left: 20px; top: 20px;">按住头部进行拖拽，拖至预览框边界 12px 内将自动产生磁吸贴边效果，并切换为 snapped 高亮状态。</cgo-floating-window>
<cgo-floating-window title="磁吸面板 (已吸附)" snapped style="position: absolute; right: 20px; top: 20px;">你可以尝试在这里自由移动和拖拽这两个悬浮窗。点击右上角 [-] 可折叠，[&times;] 可关闭。</cgo-floating-window>`,
            },
        ],
        props: [
            ['title', 'string', '浮动控制面板', '标题文字'],
            ['snapped', 'boolean', 'false', '磁吸高亮状态。拖拽贴边时会自动激活'],
            ['minimized', 'boolean', 'false', '是否处于最小化/折叠状态'],
            ['closed', 'boolean', 'false', '是否关闭隐藏'],
            ['interactive', 'boolean', 'true', '是否启用拖动、折叠和关闭等交互功能'],
        ],
        slots: [['(默认)', '悬浮窗内部正文内容']],
        events: [
            ['cgodragstart', '开始拖拽时派发'],
            ['cgodrag', '拖拽进行中派发，detail包含 {x, y, isSnapped}'],
            ['cgodragend', '拖拽结束时派发'],
            ['cgominimize', '点击最小化/恢复按钮时派发，detail包含 {minimized}'],
            ['cgoclose', '点击关闭按钮时派发'],
        ],
    },
    {
        id: 'captcha',
        tag: 'cgo-captcha',
        title: '验证码 Captcha',
        icon: 'vi-clss',
        desc: '纯前端 SVG 计算题验证码。点击图片刷新；启用 zoom 后左侧显示放大按钮，放大/收起不会刷新。',
        examples: [
            { title: '基础（点击图片刷新）', code: `<cgo-captcha></cgo-captcha>` },
            { title: '带放大按钮', code: `<cgo-captcha zoom></cgo-captcha>` },
            {
                title: '和输入框联动校验',
                code: `<div class="input-row captcha-row" style="width:100%;max-width:620px;">
  <input id="captcha-input" class="form-control" autocomplete="off" placeholder="请输入计算结果">
  <cgo-captcha id="captcha-demo" zoom></cgo-captcha>
</div>
<button class="btn btn-primary" onclick="
  const captcha = document.getElementById('captcha-demo');
  const input = document.getElementById('captcha-input');
  CGO.showToast(input.value === captcha.answer ? '验证码正确' : '验证码错误', input.value === captcha.answer ? 'success' : 'error');
">校验验证码</button>`,
            },
        ],
        props: [
            ['answer', 'string（只读）', '—', '当前验证码答案'],
            ['zoom', 'boolean', 'false', '是否显示左侧放大按钮'],
            ['zoomed', 'boolean', 'false', '当前是否放大'],
        ],
        slots: [],
        events: [['cgo-captcha-refresh', 'detail.answer 为新答案']],
        methods: [
            ['refresh()', '重新生成验证码'],
            ['CGO.generateCaptcha()', '返回 { svg, answer }，纯函数生成'],
        ],
    },
    {
        id: 'theme-toggle',
        tag: 'cgo-theme-toggle',
        title: '主题切换 Theme Toggle',
        icon: 'sun',
        desc: '点击切换明暗，长按 800ms 恢复跟随系统。自动同步到所有 iframe。',
        examples: [{ title: '基础', code: `<cgo-theme-toggle></cgo-theme-toggle>` }],
        props: [['storage-key', 'string', `''`, '自定义 localStorage 键（隔离不同工具）']],
        slots: [],
        events: [],
        methods: [['window.ToolTheme.applyTheme(theme)', `编程式应用主题，theme 为 'light'|'dark'`]],
    },
    {
        id: 'header-toggle',
        tag: 'cgo-header-toggle',
        title: '顶栏模式切换 Header Toggle',
        icon: 'unpin-angle',
        desc: '点击在经典吸顶顶栏（classic，默认原版）与新版悬浮双岛/单胶囊菜单栏（floating）之间切换，长按 800ms 恢复默认吸顶模式。自动持久化到 localStorage 并联动所有切换器。',
        examples: [
            {
                title: '基础组件展示',
                code: `<div style="display:flex;gap:12px;align-items:center;">
  <cgo-header-toggle></cgo-header-toggle>
  <span style="font-size:13px;color:var(--text-light);">← 点击此按钮可即时切换全站菜单栏的悬浮/吸顶样式</span>
</div>`,
            },
            {
                title: '双岛屿悬浮顶栏 DOM 结构示例 (Floating Island Header)',
                code: `<!-- 移动端顶部状态栏/信号栏实色安全区保护层 -->
<div class="mobile-status-bar-fill" aria-hidden="true"></div>

<header class="tool-header">
  <div class="header-island header-island-left">
    <div class="header-left">
      <button class="btn btn-info"><cgo-icon name="back"></cgo-icon><span>返回</span></button>
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
      <cgo-header-toggle></cgo-header-toggle>
      <cgo-theme-toggle></cgo-theme-toggle>
    </div>
  </div>
</header>`,
            },
        ],
        props: [['storage-key', 'string', `''`, '自定义 localStorage 键（隔离不同工具与页面的顶栏模式）']],
        slots: [],
        events: [['cgo-header-mode-change', '切换模式时在 window 上派发，detail.mode 为 "floating" | "classic"']],
        methods: [
            ['CGO.theme.setHeaderMode(mode)', `编程式应用顶栏模式，mode 为 'floating'|'classic'`],
            ['CGO.theme.getHeaderMode()', `获取当前顶栏模式，返回 'floating'|'classic'`],
            ['CGO.theme.toggleHeaderMode()', `在 'floating' 与 'classic' 之间切换`],
        ],
    },
    {
        id: 'admin-select',
        tag: 'cgo-admin-select',
        title: '管理台选项 Admin Select',
        icon: 'admin',
        desc: '管理端控制专用的下拉选择框，支持 4 种继承与权限状态机。',
        examples: [
            {
                title: '状态展示',
                code: `<cgo-admin-select state="inherit"></cgo-admin-select>
<cgo-admin-select state="enabled"></cgo-admin-select>
<cgo-admin-select state="disabled"></cgo-admin-select>
<cgo-admin-select state="hidden"></cgo-admin-select>`,
            },
            {
                title: '可交互测试',
                code: `<cgo-admin-select id="permission-demo" state="enabled"></cgo-admin-select>
<script>
  document.getElementById('permission-demo')
    .addEventListener('cgo-admin-change', (event) => console.log(event.detail));
</script>`,
            },
        ],
        props: [
            ['state', 'inherit | enabled | disabled | hidden', 'inherit', '权限状态'],
            ['label', 'string', `''`, '自定义显示文字；留空时自动使用状态名称'],
        ],
        slots: [],
        events: [['cgo-admin-change', '选择后派发，detail 为 { state, label }']],
    },
    {
        id: 'preference-item',
        tag: 'cgo-preference-item',
        title: '偏好设置项 Preference Item',
        icon: 'settings',
        desc: '管理台偏好设置列表行，迁移自旧版 pref-item / pref-left-group / pref-actions 样式。',
        examples: [
            {
                title: '偏好设置列表',
                code: `<div style="display:flex;flex-direction:column;gap:12px;width:100%;">
  <cgo-preference-item icon="settings" name="项目1" title="项目1选项" detail="选项详细信息"></cgo-preference-item>
  <cgo-preference-item icon="palette" name="项目2" title="项目2选项" detail="选项详细信息"></cgo-preference-item>
</div>`,
            },
        ],
        props: [
            ['icon', 'string', 'settings', '左侧图标名称'],
            ['name', 'string', '项目', '左侧项目名'],
            ['title', 'string', '项目选项', '中间主标题'],
            ['detail', 'string', '选项详细信息', '中间说明文字'],
            ['action', 'string', '配置', '右侧按钮文字'],
        ],
        slots: [],
        events: [['cgo-preference-action', '点击右侧操作按钮时派发']],
    },
    {
        id: 'line-badge',
        tag: 'cgo-line-badge',
        title: '线路色组件 Line Badge',
        icon: 'train',
        desc: '北京地铁线路色的组件化入口。底层仍使用旧版 --line-color-X 变量，可随优化色/官方色切换。需要显示线路胶囊时用 line 属性；需要把线路色用到按钮、卡片或普通元素时，复制 var(--line-color-X) 作为 CSS 值。',
        examples: [
            {
                title: '组件写法',
                code: `<cgo-line-badge line="1">1号线</cgo-line-badge>
<cgo-line-badge line="2">2号线</cgo-line-badge>
<cgo-line-badge line="13">13号线</cgo-line-badge>
<cgo-line-badge line="xj">西郊线</cgo-line-badge>
<cgo-line-badge line="cae">首都机场</cgo-line-badge>
<cgo-line-badge line="sub-s6">市郊S6</cgo-line-badge>`,
            },
            {
                title: '复制变量后用于按钮或普通元素',
                code: `<!-- 复制 1号线 得到 var(--line-color-1)，直接作为颜色值使用 -->
<cgo-button color="var(--line-color-1)">1号线按钮</cgo-button>
<cgo-button color="var(--line-color-13)" text-color="var(--line-color-text-dark)">13号线按钮</cgo-button>

<button class="btn btn-primary" style="background:var(--line-color-1);border-color:var(--line-color-1);">
  旧按钮写法
</button>
<div style="background:var(--line-color-13);color:var(--line-color-text-dark);padding:12px;">
  普通区域写法
</div>`,
            },
        ],
        props: [['line', 'string', '1', '线路编号或别名，如 1 / 13 / xj / cae / sub-s6']],
        slots: [['(默认)', '线路显示文字']],
        events: [],
    },
    {
        id: 'level-card',
        tag: 'cgo-level-card',
        title: '用户组别 Level Card',
        icon: 'card',
        desc: '用户组别卡片，使用旧版等级渐变变量和磨砂玻璃胶囊标签。四种渐变不是写死在文档里，而是从 --level-default-gradient、--level-test-gradient、--level-prime-gradient、--level-admin-gradient 读取。',
        examples: [
            {
                title: '等级卡片',
                code: `<cgo-level-card></cgo-level-card>
<cgo-level-card level="test"></cgo-level-card>
<cgo-level-card level="prime"></cgo-level-card>
<cgo-level-card level="admin"></cgo-level-card>`,
            },
            {
                title: '自定义文字',
                code: `<cgo-level-card level="prime" label="启元旅客 · 年度会员"></cgo-level-card>`,
            },
            {
                title: '复制渐变变量后用于自定义面板',
                code: `<!-- 常旅客 / 先锋旅客 / 启元旅客 / 管理员分别复制下面 4 个变量 -->
<div style="background:var(--level-default-gradient);color:#fff;padding:28px;border-radius:12px;">常旅客</div>
<div style="background:var(--level-test-gradient);color:#fff;padding:28px;border-radius:12px;">先锋旅客</div>
<div style="background:var(--level-prime-gradient);color:#fff;padding:28px;border-radius:12px;">启元旅客</div>
<div style="background:var(--level-admin-gradient);color:#fff;padding:28px;border-radius:12px;">管理员</div>`,
            },
        ],
        props: [
            ['level', 'default | test | prime | admin', 'default', '等级类型'],
            ['label', 'string', `''`, '自定义胶囊文字'],
        ],
        slots: [],
        events: [],
    }
];

/* ============ 工具栏下拉选择器（纯 CSS 组件）============ */
function renderToolbarSelect() {
    const demoCode = `<div class="cgo-toolbar-group">
    <div class="cgo-toolbar-group-title">模板设置</div>
    <div class="cgo-toolbar-row">
        <span class="cgo-toolbar-label">选择模板</span>
        <cgo-toolbar-select id="demo-template-picker" value="beijing" placeholder="请选择模板">
            <cgo-toolbar-option value="beijing">北京标准站牌</cgo-toolbar-option>
            <cgo-toolbar-option value="beijing-outer">北京外环站牌</cgo-toolbar-option>
            <cgo-toolbar-option value="shanghai">上海标准站牌</cgo-toolbar-option>
            <cgo-toolbar-option value="diy">自定义模板</cgo-toolbar-option>
        </cgo-toolbar-select>
    </div>
    <div class="cgo-toolbar-row">
        <span class="cgo-toolbar-label">线路色</span>
        <cgo-toolbar-select id="demo-color-picker" value="line1" placeholder="请选择线路">
            <cgo-toolbar-option value="line1"><span class="cgo-toolbar-option-dot" style="background:#c23a30;"></span>1号线 · 八通线</cgo-toolbar-option>
            <cgo-toolbar-option value="line2"><span class="cgo-toolbar-option-dot" style="background:#006098;"></span>2号线</cgo-toolbar-option>
            <cgo-toolbar-option value="line4"><span class="cgo-toolbar-option-dot" style="background:#008C95;"></span>4号线 · 大兴线</cgo-toolbar-option>
        </cgo-toolbar-select>
    </div>
</div>
<div class="cgo-toolbar-group">
    <div class="cgo-toolbar-group-title">操作</div>
    <button class="cgo-toolbar-btn cgo-toolbar-btn-primary" onclick="CGO.showToast('模板已应用','success')">
        <cgo-icon name="save" size="16"></cgo-icon> 应用模板
    </button>
</div>

<script>
  document.querySelectorAll('cgo-toolbar-select').forEach(sel => {
    sel.addEventListener('cgo-change', (e) => {
      console.log('选中:', e.detail);
    });
  });
</script>`;

    return `<h1 class="doc-h1"><cgo-icon name="filter" size="28"></cgo-icon> 工具栏下拉选择器 Toolbar Select <span class="doc-tag">&lt;cgo-toolbar-select&gt;</span></h1>
        <p class="doc-lead">用于左侧工具栏面板内的下拉选择控件（模板选择、配色切换、Logo 选择等）。<br>
        <strong>与菜单按钮的区别：</strong>菜单按钮（<code>&lt;cgo-dropdown&gt;</code>）用于 Header 导航栏的"文件"/"更多"下拉；工具栏下拉（<code>&lt;cgo-toolbar-select&gt;</code>）用于侧边栏内的表单式选择器。<br>
        <strong>子组件：</strong><code>&lt;cgo-toolbar-option&gt;</code> 定义选项，<code>value</code> 属性为选项值，内容为显示文字。</p>

        <h2 class="doc-h2">实例演示</h2>
        <div class="example">
            <div class="example-title">模板选择 + 线路色选择（WebComponent，点击可交互）</div>
            <div class="preview" style="flex-direction:column;align-items:flex-start;min-height:420px;padding:24px;">
                <div style="width:100%;max-width:300px;display:flex;flex-direction:column;gap:0;">
                    ${demoCode}
                </div>
            </div>
            <div class="code-wrap"><button class="copy-btn" data-copy>复制</button><pre><code>${esc(demoCode)}</code></pre></div>
        </div>

        <h2 class="doc-h2">API</h2>
        <table class="api-table">
            <thead><tr><th>属性/方法</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
            <tbody>
                <tr><td><code>value</code></td><td>string</td><td>''</td><td>当前选中值（对应 cgo-toolbar-option 的 value）</td></tr>
                <tr><td><code>placeholder</code></td><td>string</td><td>''</td><td>未选中时显示的占位文字</td></tr>
                <tr><td><code>open</code></td><td>boolean</td><td>false</td><td>是否展开（可程序控制）</td></tr>
                <tr><td><code>open-up</code></td><td>boolean</td><td>false</td><td>向上展开（空间不足时自动检测）</td></tr>
                <tr><td><code>show()</code></td><td>方法</td><td>—</td><td>展开选项面板（自动检测方向）</td></tr>
                <tr><td><code>close()</code></td><td>方法</td><td>—</td><td>收起选项面板</td></tr>
                <tr><td>事件 <code>cgo-change</code></td><td>CustomEvent</td><td>—</td><td>选项变更时派发，detail = { value, label }</td></tr>
            </tbody>
        </table>

        <h2 class="doc-h2">子组件 &lt;cgo-toolbar-option&gt;</h2>
        <p class="doc-lead" style="margin-bottom:12px;"><code>&lt;cgo-toolbar-option&gt;</code> 是纯数据容器（非 WebComponent），用于向 <code>&lt;cgo-toolbar-select&gt;</code> 传递选项数据。选项的渲染由父组件在 Shadow DOM 内完成。</p>
        <table class="api-table">
            <thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
            <tbody>
                <tr><td><code>value</code></td><td>string</td><td>''</td><td>选项值</td></tr>
                <tr><td><code>selected</code></td><td>boolean (只读)</td><td>false</td><td>是否被选中（由父组件同步）</td></tr>
            </tbody>
        </table>

        <h2 class="doc-h2">工具栏通用子项（CSS 类）</h2>
        <table class="api-table">
            <thead><tr><th>类名</th><th>作用</th></tr></thead>
            <tbody>
                <tr><td><code>.cgo-toolbar-group</code></td><td>工具栏分组容器（margin-bottom: 18px）</td></tr>
                <tr><td><code>.cgo-toolbar-group-title</code></td><td>分组标题（大写、粗体、小字号）</td></tr>
                <tr><td><code>.cgo-toolbar-row</code></td><td>工具栏行（flex column，含 label + 控件）</td></tr>
                <tr><td><code>.cgo-toolbar-label</code></td><td>控件标签（12px 半粗体）</td></tr>
                <tr><td><code>.cgo-toolbar-btn</code></td><td>全宽操作按钮</td></tr>
                <tr><td><code>.cgo-toolbar-btn-primary</code></td><td>主色操作按钮变体</td></tr>
                <tr><td><code>.cgo-toolbar-option-dot</code></td><td>选项内颜色圆点（12px 圆形）</td></tr>
                <tr><td><code>.cgo-toolbar-option-img</code></td><td>选项内 Logo 预览图片</td></tr>
            </tbody>
        </table>`;
}

/* ============ 基础页 ============ */
const COLOR_TOKENS = [
    { group: '品牌色 & 中性色', name: 'Primary', token: '--primary-color', light: '#00263b', dark: '#006098' },
    { group: '品牌色 & 中性色', name: 'Primary Hover', token: '--primary-hover', light: '#004060', dark: '#0070b0' },
    { group: '品牌色 & 中性色', name: 'Background', token: '--bg-color', light: '#f8f9fa', dark: '#1a1a1a' },
    { group: '品牌色 & 中性色', name: 'Card BG', token: '--card-bg', light: '#ffffff', dark: '#1f2020' },
    { group: '品牌色 & 中性色', name: 'Text Main', token: '--text-main', light: '#00263b', dark: '#e5e8ea' },
    { group: '品牌色 & 中性色', name: 'Text Light', token: '--text-light', light: '#636f75', dark: '#a0b0b9' },
    { group: '品牌色 & 中性色', name: 'Border', token: '--border-color', light: '#dee2e6', dark: '#333333' },
    { group: '品牌色 & 中性色', name: 'Btn Info BG', token: '--btn-info-bg', light: '#e9ecef', dark: '#373838' },
    { group: '语义色', name: 'Success', token: '--success-color', light: '#34a853', dark: '#34a853' },
    { group: '语义色', name: 'Warning', token: '--warning-color', light: '#f59e0b', dark: '#f59e0b' },
    { group: '语义色', name: 'Danger', token: '--danger-color', light: '#ea4335', dark: '#ea4335' },
    { group: '语义色', name: 'Info', token: '--info-color', light: '#006098', dark: '#006098' },
    { group: '语义色', name: 'Diff BG', token: '--diff-bg', light: '#efbdc3', dark: '#5c1b1b' },
    { group: '语义色', name: 'Same BG', token: '--same-bg', light: '#e6ffed', dark: '#1b3e20' },
    { group: '线路色变量', name: 'Line 1', token: '--line-color-1' },
    { group: '线路色变量', name: 'Line 2', token: '--line-color-2' },
    { group: '线路色变量', name: 'Line 3', token: '--line-color-3' },
    { group: '线路色变量', name: 'Line 4', token: '--line-color-4' },
    { group: '线路色变量', name: 'Line 5', token: '--line-color-5' },
    { group: '线路色变量', name: 'Line 6', token: '--line-color-6' },
    { group: '线路色变量', name: 'Line 7', token: '--line-color-7' },
    { group: '线路色变量', name: 'Line 8', token: '--line-color-8' },
    { group: '线路色变量', name: 'Line 9', token: '--line-color-9' },
    { group: '线路色变量', name: 'Line 10', token: '--line-color-10' },
    { group: '线路色变量', name: 'Line 11', token: '--line-color-11' },
    { group: '线路色变量', name: 'Line 12', token: '--line-color-12' },
    { group: '线路色变量', name: 'Line 13', token: '--line-color-13' },
    { group: '线路色变量', name: 'Line 14', token: '--line-color-14' },
    { group: '线路色变量', name: 'Line 15', token: '--line-color-15' },
    { group: '线路色变量', name: 'Line 16', token: '--line-color-16' },
    { group: '线路色变量', name: 'Line 17', token: '--line-color-17' },
    { group: '线路色变量', name: 'Line 18', token: '--line-color-18' },
    { group: '线路色变量', name: 'Line 19', token: '--line-color-19' },
    { group: '线路色变量', name: 'Line 22', token: '--line-color-22' },
    { group: '线路色变量', name: 'Line 28', token: '--line-color-28' },
    { group: '线路色变量', name: '亦庄线', token: '--line-color-24' },
    { group: '线路色变量', name: '亦庄T1线', token: '--line-color-t1' },
    { group: '线路色变量', name: '房山线', token: '--line-color-25' },
    { group: '线路色变量', name: '燕房线', token: '--line-color-25w' },
    { group: '线路色变量', name: 'S1线', token: '--line-color-26' },
    { group: '线路色变量', name: '昌平线', token: '--line-color-27' },
    { group: '线路色变量', name: '西郊线', token: '--line-color-xj' },
    { group: '线路色变量', name: '首都机场线', token: '--line-color-cae' },
    { group: '线路色变量', name: '大兴机场线', token: '--line-color-dae' },
    { group: '线路色变量', name: '市郊S1线', token: '--line-color-sub-s1' },
    { group: '线路色变量', name: '市郊S2线', token: '--line-color-sub-s2' },
    { group: '线路色变量', name: '市郊S5线', token: '--line-color-sub-s5' },
    { group: '线路色变量', name: '市郊S6', token: '--line-color-sub-s6' },
    { group: '工具品牌色', name: 'Vitool', token: '--brand-color-vitool' },
    { group: '工具品牌色', name: 'Vitool 渐变', token: '--brand-gradient-vitool' },
    { group: '工具品牌色', name: 'Wall', token: '--brand-color-wall' },
    { group: '工具品牌色', name: 'Wall 渐变', token: '--brand-gradient-wall' },
    { group: '工具品牌色', name: 'Stasign', token: '--brand-color-stasign' },
    { group: '工具品牌色', name: 'Stasign 渐变', token: '--brand-gradient-stasign' },
    { group: '工具品牌色', name: 'Staline', token: '--brand-color-staline' },
    { group: '工具品牌色', name: 'Staline 渐变', token: '--brand-gradient-staline' },
    { group: '工具品牌色', name: 'Project', token: '--brand-color-project' },
    { group: '工具品牌色', name: 'Project 渐变', token: '--brand-gradient-project' },
];
const RADIUS_TOKENS = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full'];
const SHADOW_TOKENS = ['--shadow-xs', '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl'];

/* ============ 渲染：欢迎页 ============ */
function renderWelcome() {
    return `<h1 class="doc-h1"><img src="./design.png" alt="Logo" style="width: 28px; height: 28px;"> Central Go 前端视觉库 <span class="doc-tag">2.1alpha</span></h1>
        <p class="doc-lead">专为「面向大众提供可靠服务的网站」和「在线数字效率工具套件」打造的轻量级 Web Components 组件库。新版本测试中<br>更新日期：2026-09-21</p>

        <!-- NPM 发布信息 Banner -->
        <div class="glass-card" style="margin-bottom: 24px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div class="liquid-glass-effect" aria-hidden="true"></div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; position: relative; z-index: 3;">
                <cgo-badge variant="primary" pill style="font-size: 13px;">NPM 官方包</cgo-badge>
                <a href="https://www.npmjs.com/package/@centralgo/cgo-ui" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color); font-weight: 700; font-family: var(--font-mono); font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                    @centralgo/cgo-ui
                    <cgo-icon name="open-link" size="14"></cgo-icon>
                </a>
                <code style="font-family: var(--font-mono); font-size: 13px; color: var(--text-main); background: var(--help-code-bg); padding: 4px 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">npm install @centralgo/cgo-ui</code>
            </div>
            <a href="#/usage" class="btn btn-primary btn-sm" style="text-decoration: none; margin: 0; position: relative; z-index: 3;">
                <cgo-icon name="vi-way" size="14"></cgo-icon>
                查看完整部署教程
            </a>
        </div>

        <!-- 独立 Demo 预览 Card Group -->
        <h2 class="doc-h2">独立 Demo 预览与接入测试</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px;">
            <div class="glass-card" style="margin-bottom:0;padding:20px;display:flex;flex-direction:column;justify-content:space-between;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        <cgo-icon name="code" size="20" style="color:var(--primary-color);"></cgo-icon>
                        <strong style="font-size:15px;color:var(--text-main);">CDN 极简接入 Demo</strong>
                    </div>
                    <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0 0 16px 0;">通过 jsDelivr CDN 动态引入单文件 JS 库，验证零配置加载 Web Components 效果。</p>
                </div>
                <a href="./cdn_demo.html" class="btn btn-primary btn-sm" style="text-decoration:none; align-self:flex-start; display:inline-flex; align-items:center; gap:6px;">
                    <cgo-icon name="external" size="14"></cgo-icon>
                    打开 CDN Demo 页面
                </a>
            </div>
            <div class="glass-card" style="margin-bottom:0;padding:20px;display:flex;flex-direction:column;justify-content:space-between;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        <cgo-icon name="code" size="20" style="color:var(--primary-color);"></cgo-icon>
                        <strong style="font-size:15px;color:var(--text-main);">零 CSS 引入 Demo</strong>
                    </div>
                    <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0 0 16px 0;">验证在没有引入任何外部 CSS 样式表的情况下，组件 Shadow DOM 样式依然完美呈现。</p>
                </div>
                <a href="./test_no_css.html" class="btn btn-primary btn-sm" style="text-decoration:none; align-self:flex-start; display:inline-flex; align-items:center; gap:6px;">
                    <cgo-icon name="external" size="14"></cgo-icon>
                    打开零 CSS Demo 页面
                </a>
            </div>
        </div>

        <h2 class="doc-h2">关于 CGoUI</h2>
        <p style="color:var(--text-main);font-size:14px;line-height:1.8;margin-bottom:16px;">
            Central Go 前端视觉库是我们开发的统一前端视觉系统，基于 <strong>Lit</strong> 构建的 Web Components 组件库，
            已正式发布至 NPM（<a href="https://www.npmjs.com/package/@centralgo/cgo-ui" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color);">@centralgo/cgo-ui</a>）。
            无需任何复杂配置即可在任意 HTML 页面直接使用，或在 React、Vue、Next.js 等现代前端框架中快速部署。所有组件原生支持<strong>亮色/暗色主题</strong>自动切换，
            并提供完整的 CSS 变量体系，覆盖品牌色、语义色、北京地铁全线线路色及多个子系统品牌色。
        </p>

        <h2 class="doc-h2">核心特点</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-bottom:24px;">
            <div class="glass-card" style="margin-bottom:0;padding:20px;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <cgo-icon name="layer" size="22"></cgo-icon>
                    <strong style="font-size:15px;">零依赖 Web Components</strong>
                </div>
                <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0;">基于 Lit 构建的标准 Web Components，无需框架即可在任何 HTML 页面使用。完全兼容 React、Vue 等主流框架。</p>
            </div>
            <div class="glass-card" style="margin-bottom:0;padding:20px;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <cgo-icon name="download" size="22"></cgo-icon>
                    <strong style="font-size:15px;">NPM & CDN 多种部署方案</strong>
                </div>
                <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0;">支持通过 NPM 命令 <code>npm i @centralgo/cgo-ui</code> 部署，或通过 jsDelivr CDN 链接直接插入 <code>&lt;script&gt;</code> 快速加载。</p>
            </div>
            <div class="glass-card" style="margin-bottom:0;padding:20px;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <cgo-icon name="sun" size="22"></cgo-icon>
                    <strong style="font-size:15px;">自适应尺寸与明暗主题</strong>
                </div>
                <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0;">所有组件自动适配亮色与暗色主题，支持跟随系统、手动切换。适配桌面端与移动端，不同尺寸屏幕自动调整布局。</p>
            </div>
            <div class="glass-card" style="margin-bottom:0;padding:20px;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <cgo-icon name="palette" size="22"></cgo-icon>
                    <strong style="font-size:15px;">完整的配色体系</strong>
                </div>
                <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0;">CSS 变量驱动的设计变量系统，包含品牌色、语义色、北京地铁 28+ 条线路色及多子系统品牌渐变色。</p>
            </div>
            <div class="glass-card" style="margin-bottom:0;padding:20px;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <cgo-icon name="touch" size="22"></cgo-icon>
                    <strong style="font-size:15px;">丰富的组件库</strong>
                </div>
                <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0;">按钮、表单、表格、弹窗、Toast、侧边导航、聊天气泡、验证码等数十个实用组件，开箱即用。</p>
            </div>
            <div class="glass-card" style="margin-bottom:0;padding:20px;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <cgo-icon name="train" size="22"></cgo-icon>
                    <strong style="font-size:15px;">地铁线路色系统</strong>
                </div>
                <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin:0;">内置地铁线路官方色与优化色，支持一键切换，解决发光屏幕下的色差与对比度问题。</p>
            </div>
        </div>

        <h2 class="doc-h2">部署概览</h2>
        <div class="glass-card" style="padding:20px;margin-bottom:24px;">
            <div class="liquid-glass-effect" aria-hidden="true"></div>
            <div style="position:relative;z-index:3;">
                <p style="color:var(--text-main);font-size:14px;line-height:1.8;margin:0 0 12px;">
                    CGoUI 提供 <strong>NPM 包安装</strong> 与 <strong>CDN 静态引入</strong> 两种部署途径：
                </p>
                <ul style="color:var(--text-light);font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
                    <li><strong>NPM 部署（推荐）：</strong>在工程中执行 <code>npm install @centralgo/cgo-ui</code>，对于 React / Next.js 项目可直接从 <code>@centralgo/cgo-ui/react</code> 导入使用。详细教程见 <a href="#/usage" style="color:var(--primary-color);">快速接入指南</a>。</li>
                    <li><strong>CDN 部署：</strong>在 HTML 中插入固定版本的 <code>&lt;script type="module" src="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/dist/cgo-ui.js"&gt;&lt;/script&gt;</code>，无需任何打包工具即可在浏览器使用组件。</li>
                </ul>
            </div>
        </div>

        <h2 class="doc-h2">开源协议</h2>
        <p style="color:var(--text-light);font-size:14px;line-height:1.8;">Copyright © 2026 <strong>Central Go Team</strong>. 遵循 <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" style="color:var(--primary-color);">Apache-2.0 协议</a> 开源。</p>

        <h2 class="doc-h2">项目作者</h2>
        <p style="color:var(--text-light);font-size:14px;line-height:1.8;">NaL - CentralGo，Ryan Si</p>`;
}

function localizedComponentLabel(component) {
    const source = component.title;
    const translated = window.CGO_I18N?.translate(source) || source;
    const suffix = source.includes(' ') ? source.slice(source.indexOf(' ') + 1) : '';
    if (suffix && translated !== suffix && translated.endsWith(suffix)) {
        return translated.slice(0, -suffix.length).trim();
    }
    return translated;
}

/* 侧栏分组：render=自渲染函数 / comp=组件元数据 */
const GROUPS = [
    {
        title: '概览 Overview',
        items: [{ id: 'welcome', label: '欢迎使用', icon: 'sparkle', render: renderWelcome }],
    },
    {
        title: '基础 Foundation',
        items: [
            { id: 'colors', label: '配色系统', icon: 'palette', render: renderColors },
            { id: 'custom-theme', label: '自定主题色', icon: 'edit', render: renderCustomTheme },
            { id: 'typography', label: '字体排版', icon: 'vi-oth', render: renderTypography },
            { id: 'tokens', label: '设计变量', icon: 'design', render: renderTokens },
        ],
    },
    {
        title: '组件 Components',
        items: [
            ...COMPONENTS.map((c) => ({
                id: c.id,
                label: localizedComponentLabel(c),
                icon: c.icon,
                tag: c.tag.replace('cgo-', ''),
                comp: c,
            })),
            {
                id: 'toolbar-select',
                label: '工具栏下拉',
                icon: 'filter',
                tag: 'toolbar-select',
                render: renderToolbarSelect,
            },
        ],
    },
    {
        title: '专项 Specials',
        items: [{ id: 'metro', label: '北京线路色', icon: 'beijing', render: renderMetro }],
    },
    {
        title: '指南 Guide',
        items: [{ id: 'usage', label: '快速接入', icon: 'vi-way', render: renderUsage }],
    },
];

function findPage(id) {
    for (const g of GROUPS) {
        const it = g.items.find((i) => i.id === id);
        if (it) return it;
    }
    return null;
}

/* ============ 工具函数 ============ */
function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function codeBlock(code) {
    return `<div class="code-wrap">
        <button class="copy-btn" data-copy>复制</button>
        <pre><code>${esc(code)}</code></pre>
    </div>`;
}

function apiTable(title, cols, rows) {
    if (!rows || !rows.length) return '';
    const head = cols.map((c) => `<th>${c}</th>`).join('');
    const body = rows
        .map(
            (r) =>
                '<tr>' +
                r
                    .map((cell, i) => {
                        const cls =
                            cols[i] === '类型' ? 'class="t-type"' : cols[i] === '默认值' ? 'class="t-default"' : '';
                        return `<td ${cls}>${cell}</td>`;
                    })
                    .join('') +
                '</tr>'
        )
        .join('');
    return `<h2 class="doc-h2">${title}</h2>
        <table class="api-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/* ============ 渲染：组件页 ============ */
function renderComponent(meta) {
    const examples = meta.examples
        .map(
            (ex) => `
        <div class="example">
            ${ex.title ? `<div class="example-title">${esc(ex.title)}</div>` : ''}
            ${ex.hidePreview ? '' : `<div class="preview"${ex.previewStyle ? ` style="${ex.previewStyle}"` : ''}>${ex.code}</div>`}
            ${ex.hideCode ? '' : codeBlock(ex.code)}
        </div>`
        )
        .join('');

    const propsTable = apiTable('Props / Attributes', ['属性', '类型', '默认值', '说明'], meta.props);
    const slotsTable = apiTable('Slots', ['插槽', '说明'], meta.slots);
    const eventsTable = apiTable('Events', ['事件', '说明'], meta.events);
    const methodsTable = apiTable('Methods / API', ['方法', '说明'], meta.methods);

    return `
        <h1 class="doc-h1">${meta.icon ? `<cgo-icon name="${meta.icon}" size="28"></cgo-icon>` : meta.emoji || ''} ${meta.title} <span class="doc-tag">&lt;${meta.tag}&gt;</span></h1>
        <p class="doc-lead">${esc(meta.desc)}</p>
        <h2 class="doc-h2">实例演示</h2>
        ${examples}
        ${propsTable}
        ${slotsTable || (meta.props.length ? '' : '')}
        ${eventsTable}
        ${methodsTable}
    ${meta.id === 'icon' ? renderIconGrid() : ''}
    `;
}

/* ============ 图标分类定义与网格 ============ */
const ICON_ALIASES = new Set(['open-link', 'plus', 'bell', 'xianggang', 'taibei', 'gaoxiong', 'haerbin', 'xi-an']);

const ICON_CATEGORIES = [
    {
        name: '通用导航与方向',
        en: 'Navigation & Directions',
        icons: [
            'back', 'forward', 'home', 'home-dots', 'external', 'menu',
            'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
            'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
            'expand-more', 'expand-less', 'unfold', 'more-vert', 'more-horiz',
            'vi-way'
        ],
    },
    {
        name: '基础操作与状态',
        en: 'Common Actions & States',
        icons: [
            'add', 'addone', 'edit', 'delete', 'save', 'copy', 'close', 'refresh', 'undo', 'redo', 'reverse',
            'search', 'filter', 'sort', 'eye',
            'check', 'check-circle', 'warning', 'error', 'error-outline', 'info', 'help',
            'pin', 'pin-angle', 'unpin-angle',
            'drag', 'tag', 'bookmark', 'star', 'star-outline'
        ],
    },
    {
        name: '文件与数据交换',
        en: 'Files & Export',
        icons: [
            'file', 'folder', 'upload', 'download',
            'export-img', 'export-svg', 'export-json', 'export-zip', 'export-pdf'
        ],
    },
    {
        name: '系统、账户与安全',
        en: 'System & Security',
        icons: [
            'settings', 'admin', 'user', 'login', 'logout',
            'lock', 'unlock', 'key', 'notification',
            'fullscn', 'fullscn-exit', 'zoom-in', 'zoom-out', 'zoom-reset'
        ],
    },
    {
        name: '界面容器与设计',
        en: 'Layout & Design',
        icons: [
            'card', 'tabs', 'table', 'view-grid', 'view-list', 'window',
            'layer', 'palette', 'design', 'drunk', 'vi-text', 'vi-clss',
            'sparkle', 'sun', 'moon', 'flip-h', 'flip-v'
        ],
    },
    {
        name: '图表与多媒体',
        en: 'Charts & Media',
        icons: [
            'bar-chart', 'pie-chart', 'compare',
            'camera', 'image', 'play', 'pause', 'speaker', 'light',
            'chat', 'chat-bubble', 'mail', 'send', 'share',
            'plugin', 'preset', 'puzzle', 'code', 'link',
            'touch', 'loading', 'time', 'calendar'
        ],
    },
    {
        name: '公共交通与出行',
        en: 'Transit & Vehicles',
        icons: [
            'train', 'crh', 'subrail', 'railway', 'bus', 'monorail', 'tram', 'plane', 'ticket', 'gate',
            'location', 'map', 'route', 'transfer', 'world',
            'vi-line', 'vi-nbr', 'vi-oth', 'vi-sub'
        ],
    },
    {
        name: '车站导向与爱心关怀',
        en: 'Station Facilities & Passenger Care',
        icons: [
            'aed', 'elevator', 'escalator', 'stairs', 'counter', 'toilet', 'luggage', 'security', 'noentry', 'police',
            'baby', 'stroller', 'elder', 'pregnant',
            'walk', 'tourist', 'payment', 'vi-stn'
        ],
    },
    {
        name: '城市轨道交通标志',
        en: 'City Metro Marks',
        icons: [
            'beijing', 'changchun', 'dalian', 'fuzhou', 'hefei', 'qingdao', 'shanghai', 'shenyang',
            'changsha', 'changzhou', 'chengdu', 'chongqing', 'dongguan', 'foshan', 'guangzhou', 'guiyang',
            'hangzhou', 'harbin', 'hongkong', 'jinan', 'kaohsiung', 'kunming', 'lanzhou', 'nanchang',
            'nanjing', 'nanning', 'nantong', 'ningbo', 'shijiazhuang', 'shenzhen', 'suzhou', 'taipei',
            'taiyuan', 'taoyuan', 'tianjin', 'wenzhou', 'wuhan', 'wuhu', 'wuxi', 'xiamen',
            'xian', 'zhengzhou'
        ],
    },
];

function renderIconGrid() {
    const rawList = window.CGO && window.CGO.iconList ? window.CGO.iconList() : [];
    // 过滤别名，只展示标准本名
    const validNames = new Set(rawList.filter((n) => !ICON_ALIASES.has(n)));
    const totalCount = validNames.size;

    const assigned = new Set();
    const sectionsHtml = ICON_CATEGORIES.map((cat) => {
        const availableIcons = cat.icons.filter((name) => validNames.has(name));
        availableIcons.forEach((name) => assigned.add(name));
        if (availableIcons.length === 0) return '';

        const cells = availableIcons
            .map(
                (n) => `<div class="icon-cell" data-icon-name="${n}" title="点击复制 <cgo-icon name='${n}'>">
            <cgo-icon name="${n}" size="24"></cgo-icon><span>${n}</span>
        </div>`
            )
            .join('');

        return `
            <div class="icon-category-section" style="margin-top:28px;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:6px;margin-bottom:12px;">
                    <h3 style="margin:0;font-size:15px;font-weight:600;color:var(--text-main);">${cat.name} <span style="font-size:12px;font-weight:normal;color:var(--text-light);margin-left:6px;">${cat.en}</span></h3>
                    <span style="font-size:12px;color:var(--text-light);background:var(--btn-info-bg);padding:2px 8px;border-radius:10px;">${availableIcons.length}</span>
                </div>
                <div class="icon-grid">${cells}</div>
            </div>`;
    }).join('');

    // 兜底未收录进分类的新图标
    const remainingIcons = [...validNames].filter((n) => !assigned.has(n));
    let remainingHtml = '';
    if (remainingIcons.length > 0) {
        const cells = remainingIcons
            .map(
                (n) => `<div class="icon-cell" data-icon-name="${n}" title="点击复制 <cgo-icon name='${n}'>">
            <cgo-icon name="${n}" size="24"></cgo-icon><span>${n}</span>
        </div>`
            )
            .join('');
        remainingHtml = `
            <div class="icon-category-section" style="margin-top:28px;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:6px;margin-bottom:12px;">
                    <h3 style="margin:0;font-size:15px;font-weight:600;color:var(--text-main);">其他图标 <span style="font-size:12px;font-weight:normal;color:var(--text-light);margin-left:6px;">Other Icons</span></h3>
                    <span style="font-size:12px;color:var(--text-light);background:var(--btn-info-bg);padding:2px 8px;border-radius:10px;">${remainingIcons.length}</span>
                </div>
                <div class="icon-grid">${cells}</div>
            </div>`;
    }

    return `
        <h2 class="doc-h2" style="display:flex;align-items:center;justify-content:space-between;margin-top:36px;">
            <span>全图标分类一览（共 ${totalCount} 个 · 点击复制）</span>
        </h2>
        <p style="font-size:13px;color:var(--text-light);margin-top:-6px;margin-bottom:16px;">
            点击任意图标卡片可直接复制 <code>&lt;cgo-icon name="..."&gt;&lt;/cgo-icon&gt;</code> 代码。别名（如 <code>plus</code>、<code>bell</code>、<code>open-link</code>）已自动合并。
        </p>
        ${sectionsHtml}
        ${remainingHtml}
    `;
}

/* ============ 渲染：基础页 ============ */
function renderColors() {
    const cs = getComputedStyle(document.documentElement);
    const groups = [...new Set(COLOR_TOKENS.map((item) => item.group))].filter((g) => g !== '线路色变量');
    const sections = groups
        .map((group) => {
            const cells = COLOR_TOKENS.filter((item) => item.group === group)
                .map((item) => {
                    let valHtml = '';
                    if (item.light && item.dark) {
                        valHtml = `<em>${item.light}<br>${item.dark}</em>`;
                    } else {
                        const v = cs.getPropertyValue(item.token).trim();
                        valHtml = `<em>${v || '—'}</em>`;
                    }
                    return `<button class="swatch copy-swatch" data-copy-color="var(${item.token})" title="点击复制 var(${item.token})">
            <div class="swatch-color" style="background:var(${item.token})"></div>
            <div class="swatch-meta"><b>${item.name}</b><span>${item.token}</span>${valHtml}</div>
        </button>`;
                })
                .join('');
            return `<h2 class="doc-h2 color-group-title">${group}</h2><div class="swatch-grid compact">${cells}</div>`;
        })
        .join('');
    return `<h1 class="doc-h1"><cgo-icon name="palette" size="28"></cgo-icon> 配色系统</h1>
        <p class="doc-lead">所有颜色都通过 CSS 变量引用。线路色变量已移至「专项 · 地铁线路色」页面。点击色块复制的是变量用法，例如 <code>var(--primary-color)</code>。</p>
        ${sections}`;
}

/* ============ 渲染：自定义主题色 ============ */
function renderCustomTheme() {
    const defaultColor = '#10b981';
    return `<h1 class="doc-h1"><cgo-icon name="sparkle" size="28"></cgo-icon> 自定义主题色</h1>
        <p class="doc-lead">在网页中声明一个新颜色作为主题色，CGoUI 会根据算法自动推导生成全套 8 种衍生颜色（Primary、Primary Hover、Dark Primary/Hover、同色系 Text Main、暗色极浅 Text Main、Text Light 及暗色 Text Light），并覆盖按钮与各类视觉元素。生成后支持手动微调与一键恢复深蓝默认色。</p>

        <div class="glass-card" style="padding:24px;margin-bottom:28px;">
            <div class="liquid-glass-effect" aria-hidden="true"></div>
            <div style="position:relative;z-index:3;">
                <h2 class="doc-h2" style="margin-top:0;">1. 选择主题色 (Color Wheel)</h2>
                <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:20px;">
                    <div style="display:inline-flex;align-items:center;gap:10px;background:var(--bg-color);padding:8px 14px;border:1px solid var(--border-color);border-radius:var(--radius-md);">
                        <input type="color" id="theme-color-picker" value="${defaultColor}" style="width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;background:transparent;padding:0;">
                        <input type="text" id="theme-color-hex" value="${defaultColor}" style="font-family:var(--font-mono);font-size:14px;width:90px;padding:6px 8px;border:1px solid var(--border-color);border-radius:4px;background:var(--card-bg);color:var(--text-main);">
                    </div>
                    
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span style="font-size:13px;color:var(--text-light);font-weight:500;">预设快选：</span>
                        <button class="theme-preset-btn" data-color="#10b981" style="background:#10b981;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer;" title="翡翠绿 #10b981"></button>
                        <button class="theme-preset-btn" data-color="#8a4de6" style="background:#8a4de6;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer;" title="梦幻紫 #8a4de6"></button>
                        <button class="theme-preset-btn" data-color="#f97316" style="background:#f97316;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer;" title="活力橙 #f97316"></button>
                        <button class="theme-preset-btn" data-color="#25d3ff" style="background:#25d3ff;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer;" title="湖水青 #25d3ff"></button>
                        <button class="theme-preset-btn" data-color="#c74341" style="background:#c74341;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer;" title="珊瑚红 #c74341"></button>
                    </div>

                    <cgo-button id="theme-reset-btn" variant="info" icon="refresh">恢复默认深蓝</cgo-button>
                </div>

                <h2 class="doc-h2">2. 自动生成与衍生色微调 (Derived Colors Tuning)</h2>
                <p style="font-size:13px;color:var(--text-light);margin-bottom:12px;">算法自动推导出的 8 种衍生颜色如下。你可以直接在下方输入框修改 Hex 颜色进行手动微调：</p>
                
                <div id="derived-colors-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:24px;">
                    <!-- 动态由 JS 填充 -->
                </div>

                <h2 class="doc-h2">3. 主要元素实时预览 (Live Element Preview)</h2>
                <div class="glass-card" style="padding:24px;margin-bottom:24px;">
                    <div class="liquid-glass-effect" aria-hidden="true"></div>
                    <div style="position:relative;z-index:3;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border-color);">
                            <span style="font-size:14px;font-weight:700;color:var(--text-main);">元素试用画布</span>
                            <cgo-theme-toggle></cgo-theme-toggle>
                        </div>
                        
                        <div style="display:flex;flex-direction:column;gap:18px;">
                            <div>
                                <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;font-weight:600;">按钮控件 (Primary Colors Coverage)</div>
                                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                                    <cgo-button variant="primary" icon="save">主要按钮</cgo-button>
                                    <cgo-button variant="ghost" icon="edit">幽灵按钮</cgo-button>
                                    <cgo-button pill variant="primary" icon="check">胶囊主要按钮</cgo-button>
                                    <button class="btn btn-primary"><cgo-icon name="send"></cgo-icon> CSS .btn-primary</button>
                                </div>
                            </div>

                            <div>
                                <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;font-weight:600;">文本与排版 (Text Main & Text Light)</div>
                                <div class="glass-card" style="padding:14px;margin-bottom:0;">
                                    <div class="liquid-glass-effect" aria-hidden="true"></div>
                                    <div style="position:relative;z-index:3;">
                                        <h3 style="margin:0 0 6px;font-size:16px;color:var(--text-main);">同色系主标题文字 (--text-main)</h3>
                                        <p style="margin:0;font-size:13px;color:var(--text-light);">这是基于主题色生成的同色系辅助说明文字 (--text-light)，明度适中且柔和，呈现出和谐的视觉统一感。</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;font-weight:600;">卡片与组件 (Card & Badge)</div>
                                <cgo-card header="主题色卡片示例" icon="sparkle" style="max-width:440px;">
                                    这里是卡片内部内容，包含了 <cgo-badge variant="primary">主题 Badge</cgo-badge> 标签与相关控件。
                                </cgo-card>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="doc-h2">4. 代码示例 (Usage Example)</h2>
                ${codeBlock(`// 1. 声明新的主题色（根据算法自动生成 7 种衍生颜色）
CGO.theme.setThemeColor('#10b981');

// 2. 声明主题色并进行手动微调
CGO.theme.setThemeColor('#10b981', {
    primary: '#059669',       // 自定义 Light Primary
    textMain: '#022c22'        // 自定义 Text Main
});

// 3. 恢复默认深蓝色配色
CGO.theme.resetThemeColor();`)}
            </div>
        </div>`;
}

function initCustomThemeInteractions(root) {
    const picker = root.querySelector('#theme-color-picker');
    const hexInput = root.querySelector('#theme-color-hex');
    const resetBtn = root.querySelector('#theme-reset-btn');
    const grid = root.querySelector('#derived-colors-grid');
    if (!picker || !hexInput || !grid) return;

    const DERIVED_FIELDS = [
        { key: 'primary', label: 'Primary (亮色主色)' },
        { key: 'primaryHover', label: 'Primary Hover (亮色 Hover)' },
        { key: 'darkPrimary', label: 'Dark Primary (暗色主色)' },
        { key: 'darkPrimaryHover', label: 'Dark Primary Hover (暗色 Hover)' },
        { key: 'textMain', label: 'Text Main (亮色同色系黑)' },
        { key: 'darkTextMain', label: 'Dark Text Main (暗色极浅同色系)' },
        { key: 'textLight', label: 'Text Light (亮色次要文字)' },
        { key: 'darkTextLight', label: 'Dark Text Light (暗色次要文字)' },
    ];

    let currentOverrides = {};

    const renderDerivedGrid = (palette) => {
        if (!palette) return;
        grid.innerHTML = DERIVED_FIELDS.map(f => {
            const val = palette[f.key] || '#000000';
            return `
            <div class="glass-card" style="padding:10px;display:flex;align-items:center;gap:10px;margin-bottom:0;">
                <div class="liquid-glass-effect" aria-hidden="true"></div>
                <div style="width:36px;height:36px;border-radius:6px;background:${val};border:1px solid rgba(0,0,0,0.1);flex-shrink:0;position:relative;z-index:3;"></div>
                <div style="flex:1;min-width:0;position:relative;z-index:3;">
                    <div style="font-size:11px;color:var(--text-light);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.label}</div>
                    <input type="text" data-derived-key="${f.key}" value="${val}" style="font-family:var(--font-mono);font-size:12px;width:100%;padding:3px 6px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-color);color:var(--text-main);box-sizing:border-box;">
                </div>
            </div>`;
        }).join('');

        grid.querySelectorAll('input[data-derived-key]').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const k = inp.dataset.derivedKey;
                const v = e.target.value.trim();
                if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                    currentOverrides[k] = v;
                    applyColor(picker.value, currentOverrides);
                }
            });
        });
    };

    const applyColor = (hex, overrides = {}) => {
        if (!window.CGO || !window.CGO.theme) return;
        const palette = window.CGO.theme.setThemeColor(hex, overrides);
        if (palette) {
            picker.value = hex;
            hexInput.value = hex;
            renderDerivedGrid(palette);
        }
    };

    // 初始化检查：仅当用户之前明确设置过自定义主题色时才应用
    const existing = window.CGO && window.CGO.theme ? window.CGO.theme.getThemeColor() : null;
    if (existing) {
        picker.value = existing.baseColor;
        hexInput.value = existing.baseColor;
        currentOverrides = existing.overrides || {};
        renderDerivedGrid(existing.palette);
    } else {
        // 未主动设置主题色时：默认保持全局原本配色，不自动变色
        picker.value = '#10b981';
        hexInput.value = '#10b981';
        if (window.CGO && window.CGO.theme && window.CGO.theme.generateThemePalette) {
            const previewPalette = window.CGO.theme.generateThemePalette('#10b981');
            renderDerivedGrid(previewPalette);
        }
    }

    picker.addEventListener('input', (e) => {
        currentOverrides = {};
        applyColor(e.target.value);
    });

    hexInput.addEventListener('change', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            currentOverrides = {};
            applyColor(val);
        }
    });

    root.querySelectorAll('.theme-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const c = btn.dataset.color;
            currentOverrides = {};
            applyColor(c);
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (window.CGO && window.CGO.theme) {
                window.CGO.theme.resetThemeColor();
                picker.value = '#10b981';
                hexInput.value = '#10b981';
                currentOverrides = {};
                if (window.CGO.theme.generateThemePalette) {
                    const defaultPalette = window.CGO.theme.generateThemePalette('#00263b');
                    renderDerivedGrid(defaultPalette);
                }
                CGO.showToast('已恢复默认深蓝配色', 'info');
            }
        });
    }
}

/* ============ 线路色数据 ============ */
const LINE_COLORS = [
    { name: '1号线 · 八通线', token: '--line-color-1' },
    { name: '2号线', token: '--line-color-2' },
    { name: '3号线', token: '--line-color-3' },
    { name: '4号线 · 大兴线', token: '--line-color-4' },
    { name: '5号线', token: '--line-color-5' },
    { name: '6号线', token: '--line-color-6' },
    { name: '7号线', token: '--line-color-7' },
    { name: '8号线', token: '--line-color-8' },
    { name: '9号线', token: '--line-color-9' },
    { name: '10号线', token: '--line-color-10' },
    { name: '11号线', token: '--line-color-11' },
    { name: '12号线', token: '--line-color-12' },
    { name: '13号线', token: '--line-color-13' },
    { name: '14号线', token: '--line-color-14' },
    { name: '15号线', token: '--line-color-15' },
    { name: '16号线', token: '--line-color-16' },
    { name: '17号线', token: '--line-color-17' },
    { name: '18号线', token: '--line-color-18' },
    { name: '19号线', token: '--line-color-19' },
    { name: '22号线', token: '--line-color-22' },
    { name: '28号线', token: '--line-color-28' },
    { name: '亦庄线', token: '--line-color-24' },
    { name: '亦庄T1线', token: '--line-color-t1' },
    { name: '房山线', token: '--line-color-25' },
    { name: '燕房线', token: '--line-color-25w' },
    { name: 'S1线', token: '--line-color-26' },
    { name: '昌平线', token: '--line-color-27' },
    { name: '西郊线', token: '--line-color-xj' },
    { name: '首都机场线', token: '--line-color-cae' },
    { name: '大兴机场线', token: '--line-color-dae' },
    { name: '市郊S1线', token: '--line-color-sub-s1' },
    { name: '市郊S2线', token: '--line-color-sub-s2' },
    { name: '市郊S5线', token: '--line-color-sub-s5' },
    { name: '市郊S6', token: '--line-color-sub-s6' },
];

/* ============ 渲染：地铁线路色 ============ */
function renderMetro() {
    const swatches = LINE_COLORS.map(
        (line) => `
        <button class="line-swatch" data-copy-color="var(${line.token})" title="点击复制 var(${line.token})">
            <div class="line-swatch-color" style="background:var(${line.token})"></div>
            <div class="line-swatch-meta"><b>${line.name}</b><span>${line.token}</span></div>
        </button>`
    ).join('');

    return `<h1 class="doc-h1"><cgo-icon name="beijing" size="28"></cgo-icon> 北京线路色</h1>
        <p class="doc-lead">北京地铁各线路官方标志色与优化色。通过 CSS 变量 <code>--line-color-X</code> 全局映射，支持<strong>标准官方色</strong>与<strong>优化色</strong>一键切换。点击卡片复制变量用法。</p>

        <div id="metro-palette-box" data-color-palette="screen">
            <div class="metro-palette-header">
                <div class="palette-toggles">
                    <button id="palette-btn-screen" class="btn btn-sm btn-primary active" style="margin-left:0;padding:4px 10px;font-size:11px;">优化色</button>
                    <button id="palette-btn-official" class="btn btn-sm btn-info" style="margin-left:0;padding:4px 10px;font-size:11px;">官方色</button>
                </div>
            </div>
            <div class="line-grid" style="margin-top:16px;">${swatches}</div>
</div>

                <!-- 差异颜色对比卡片区 -->
                <h3 style="font-size:14px;font-weight:700;margin:24px 0 12px;color:var(--text-main);">官方色与优化色对比
                </h3>
                <p style="color:var(--text-light); font-size:13px; margin:0 0 16px; line-height:1.6;">
                    罗列出在发光屏幕下经过色差校正与对比度增强优化的 11 个典型线路系统，以解决亮/暗模式易读性、眩光及合并重叠等问题：
                </p>
                <div class="color-compare-grid" style="margin-bottom: 32px;">
                    <!-- 8号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>8号线 (绿)</span>
                            <span class="badge badge-primary">绿色彩度</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half light-text" style="background:#009b6b;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#009B6B</span>
                            </div>
                            <div class="compare-half light-text" style="background:#009b63;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#009B63</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            微调绿色的黄色成分，在发光屏或暗黑模式下表现出更好的对比度，同时增大与4号线（青绿）、10号线（天蓝）的颜色区分度，防止发生偏色混淆。
                        </div>
                    </div>

                    <!-- 9号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>9号线 (黄绿)</span>
                            <span class="badge badge-primary">亮度提纯</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half dark-text" style="background:#8fc31f;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#8FC31F</span>
                            </div>
                            <div class="compare-half dark-text" style="background:#abcd03;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#ABCD03</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            官方色偏黄绿、灰暗。优化色显著提高了明度与饱和度，在白底或深色模式下均清晰可见，同时增强了与16号线（草绿）在邻近色域下的视觉区分度。
                        </div>
                    </div>

                    <!-- 10号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>10号线 (天蓝)</span>
                            <span class="badge badge-primary">青蓝色调</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half light-text" style="background:#009bc0;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#009BC0</span>
                            </div>
                            <div class="compare-half light-text" style="background:#00a3c9;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#00A3C9</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            微调天蓝色调并提高青色纯度，消除深色背景下的暗沉感。同时在电子地图上拉开与相似天蓝/青绿色系（如8号线、17号线）的色彩区分度，使核心环线更醒目。
                        </div>
                    </div>

                    <!-- 13号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>13号线 (黄)</span>
                            <span class="badge badge-primary">白底防眩</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half dark-text" style="background:#f9e700;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#F9E700</span>
                            </div>
                            <div class="compare-half dark-text" style="background:#f8de00;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#F8DE00</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            官方柠檬黄明度极高，在白色背景上几乎不可见，引起强烈的眩光。屏幕色微调降低了明度、略微偏深，显著提升了对比度。
                        </div>
                    </div>

                    <!-- 14号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>14号线 (淡粉)</span>
                            <span class="badge badge-primary">粉色净化</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half dark-text" style="background:#d5a7a1;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#D5A7A1</span>
                            </div>
                            <div class="compare-half dark-text" style="background:#d5a7a9;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#D5A7A9</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            官方粉色偏灰，在发光屏上容易显得暗淡。优化色将色相略微向冷色（洋红）微调，呈现更饱满的粉色，显著增加了与同系19号线、昌平线颜色的区分度。
                        </div>
                    </div>

                    <!-- 16号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>16号线 (草绿)</span>
                            <span class="badge badge-primary">草绿提纯</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half light-text" style="background:#76a32d;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#76A32D</span>
                            </div>
                            <div class="compare-half light-text" style="background:#6e992a;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#6E992A</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            微调明度与绿色彩度，在多线重叠的枢纽站，增强与相邻黄绿色系 9号线 的颜色区分度，确保线路走向在视觉上的独立与清晰。
                        </div>
                    </div>

                    <!-- 17号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>17号线 (青)</span>
                            <span class="badge badge-primary">蓝绿发光</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half light-text" style="background:#00a9a9;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#00A9A9</span>
                            </div>
                            <div class="compare-half light-text" style="background:#00adb2;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#00ADB2</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            微调蓝绿色的波长偏向，提高在发光屏幕上的青色质感，增大与4号线（青绿）、10号线（天蓝）颜色的区分度，确保同框时清晰可辨.
                        </div>
                    </div>

                    <!-- 19号线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>19号线 (粉紫)</span>
                            <span class="badge badge-primary">粉紫强化</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half dark-text" style="background:#d6abc1;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#D6ABC1</span>
                            </div>
                            <div class="compare-half dark-text" style="background:#d5abce;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#D5ABCE</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            官方灰粉在白底上极易“隐形”。优化色调高了饱和度与亮度，既保障了文字易读性，又强化了与相似粉色系（14号线、昌平线）颜色的区分度。
                        </div>
                    </div>

                    <!-- 西郊线 / 亦庄T1 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>西郊线 / 亦庄T1 (红)</span>
                            <span class="badge badge-primary">电车深红</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half light-text" style="background:#e6081b;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#E6081B</span>
                            </div>
                            <div class="compare-half light-text" style="background:#d80618;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#D80618</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            官方红与1号线大红过于接近。屏幕色略微降低亮度并融入砖红质感，在视觉上增加了与1号线（大红）、3号线（洋红）颜色的区分度，突出了有轨电车系统的特征。
                        </div>
                    </div>

                    <!-- 昌平线 -->
                    <div class="compare-card">
                        <div class="compare-header">
                            <span>昌平线 (粉)</span>
                            <span class="badge badge-primary">粉红提亮</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half dark-text" style="background:#de82b2;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#DE82B2</span>
                            </div>
                            <div class="compare-half dark-text" style="background:#ee87b4;">
                                <span class="compare-label-tag">屏幕色</span>
                                <span class="color-hex">#EE87B4</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            官方粉红明度偏暗。优化色将其提纯提亮，使其在多主题切换时更具通透性，并显著增加了与14号线、19号线颜色的区分度，避免发生偏紫偏差。
                        </div>
                    </div>

                    <!-- 市郊铁路系统 -->
                    <div class="compare-card" style="grid-column: span 1;">
                        <div class="compare-header">
                            <span>市郊铁路系统 (多线)</span>
                            <span class="badge badge-primary">自定颜色</span>
                        </div>
                        <div class="compare-split-bar">
                            <div class="compare-half light-text" style="background:#717071;">
                                <span class="compare-label-tag">官方色</span>
                                <span class="color-hex">#717071</span>
                            </div>
                            <div class="compare-half light-text"
                                style="background:linear-gradient(90deg, #d93932 25%, #4080b7 25%, #4080b7 50%, #e98d95 50%, #e98d95 75%, #919a47 75%);">
                                <span class="compare-label-tag">自定颜色</span>
                                <span style="font-size: 8px; margin-top: 10px; font-weight: 500;">S1/S2/S5/S6 彩色化</span>
                            </div>
                        </div>
                        <div class="compare-body">
                            官方指定市郊铁路统一使用深灰色，多线并行重叠时无法辨认。屏幕色大胆为 S1(红)/S2(蓝)/S5(粉)/S6(绿) 赋色，实现完美视觉分割。
                        </div>
                    </div>
                </div>


                <h3 style="font-size:14px;font-weight:700;margin:20px 0 10px;color:var(--text-light);">筛选标签演示</h3>
                <div class="filter-tags" style="justify-content:flex-start;">
                    <div class="filter-tag active" data-line="all">全部</div>
                    <div class="filter-tag" data-line="2号线">2号线</div>
                    <div class="filter-tag" data-line="4号线大兴线">4号线大兴线</div>
                    <div class="filter-tag" data-line="10号线">10号线</div>
                    <div class="filter-tag" data-line="大兴机场线">大兴机场线</div>
                </div>
        </div>`;
}

/* ============ 渲染：字体排版 ============ */
function renderTypography() {
    return `<h1 class="doc-h1"><cgo-icon name="vi-oth" size="28"></cgo-icon> 字体排版</h1>
        <p class="doc-lead">主字体 <code>Noto Sans SC</code>，英文字体 <code>Arimo</code>，等宽字体用于代码块。</p>
        <div class="preview-box">
            <div class="liquid-glass-effect" aria-hidden="true"></div>
            <div style="position:relative;z-index:3;">
                <div style="font-size:28px;font-weight:800;margin-bottom:4px;">标题 H1 · 28px Bold</div>
                <div style="font-size:22px;font-weight:700;margin-bottom:4px;">标题 H2 · 22px Bold</div>
                <div style="font-size:18px;font-weight:600;margin-bottom:4px;">标题 H3 · 18px SemiBold</div>
                <div style="font-size:15px;margin-bottom:4px;">正文 Body · 15px Regular — 北京地铁线路图工具套件，供 CGo 工作室使用</div>
                <div style="font-size:13px;color:var(--text-light);">辅助文字 Caption · 13px — Secondary text used for descriptions and hints</div>
                <div style="font-size:11px;color:var(--text-light);margin-top:4px;">极小文字 · 11px — badge, label, meta info</div>
                <div style="font-family:var(--font-mono);font-size:12px;margin-top:12px;background:var(--help-code-bg);padding:8px 12px;border-radius:6px;">等宽字体 · JetBrains Mono — const version = "1.0.0";</div>
            </div>
        </div>`;
}

function renderTokens() {
    const cs = getComputedStyle(document.documentElement);
    const radiusLabels = ['xs', 'sm', 'md', 'lg', 'xl', 'full'];
    const radius = RADIUS_TOKENS.map(
        (
            t,
            i
        ) => `<button class="token-tile copy-swatch" data-copy-color="${cs.getPropertyValue(t).trim()}" title="点击复制 ${t}">
        <span class="token-square" style="border-radius:var(${t});"></span>
        <span>${radiusLabels[i]} · ${cs.getPropertyValue(t).trim()}</span>
    </button>`
    ).join('');
    const shadowLabels = ['xs', 'sm', 'md', 'lg', 'xl'];
    const shadow = SHADOW_TOKENS.map(
        (t, i) => `<button class="token-tile copy-swatch" data-copy-color="${t}" title="点击复制 ${t}">
        <span class="token-square shadow" style="box-shadow:var(${t});"></span>
        <span>${shadowLabels[i]}</span>
    </button>`
    ).join('');
    return `<h1 class="doc-h1"><cgo-icon name="design" size="28"></cgo-icon> 设计变量</h1>
        <p class="doc-lead">圆角、阴影、过渡速度的标准化变量，跨组件保持一致。</p>
        <h2 class="doc-h2">圆角 Border Radius</h2><div class="token-tile-grid">${radius}</div>
        <h2 class="doc-h2">阴影 Shadow</h2><div class="token-tile-grid">${shadow}</div>`;
}

/* ============ 渲染：快速接入指南（NPM 部署与接入）============ */
function renderUsage() {
    const npmInstall = `npm install @centralgo/cgo-ui@2.1.0`;

    const reactUsage = `import React from 'react';
import { CgoButton, CgoBadge, CgoIcon, showToast } from '@centralgo/cgo-ui/react';

export default function MyComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <CgoButton 
        variant="primary" 
        icon="save" 
        onClick={() => showToast('操作成功！', 'success')}
      >
        保存设置
      </CgoButton>
      
      <CgoBadge variant="success" style={{ marginLeft: '10px' }}>
        已完成
      </CgoBadge>
    </div>
  );
}`;

    const vanillaImport = `// 在入口 JS/TS 文件中引入（自动注册全部 <cgo-*> Web Components）
import '@centralgo/cgo-ui/register';`;

    const nextConfig = `// CGoUI 发布包已提供编译后的 ESM，通常不需要额外 transpilePackages。
// 只有在项目自行覆盖 exports 或调试源码时，才按需开启：
const nextConfig = {
  transpilePackages: ['@centralgo/cgo-ui'],
};`;

    const cdnSample = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CGoUI CDN 接入示例</title>

    <!-- 1. 核心 Bundle 最高优先级预加载 (Resource Hints，加速首屏响应) -->
                <link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/dist/cgo-ui.js">

    <!-- 2. Web Components 元素未注册前的占位与防无样式闪烁防护 (FOUC Protection) -->
    <style>
        cgo-icon:not(:defined) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            visibility: visible;
            opacity: 0.6;
        }
    </style>
</head>
<body>
    <!-- 像原生 HTML 标签一样直接使用组件 -->
    <cgo-theme-toggle></cgo-theme-toggle>
    <cgo-button variant="primary" icon="save">保存</cgo-button>
    <cgo-line-badge line="1">1号线</cgo-line-badge>
    <cgo-captcha></cgo-captcha>

    <!-- 引入 CDN bundle 脚本（组件自动注册并自动注入系统主题样式） -->
                <script type="module" src="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/dist/cgo-ui.js"></script>
</body>
</html>`;

    const monorepoBuild = `# 源码位于独立 CGoUI 仓库
cd CGoUI
npm run build`;

    return `<h1 class="doc-h1"><cgo-icon name="vi-way" size="28"></cgo-icon> 快速接入与部署教程</h1>
        <p class="doc-lead">
            CGoUI 已按 NPM 公共包规范完成构建，发布后可从 <a href="https://www.npmjs.com/package/@centralgo/cgo-ui" target="_blank" rel="noopener noreferrer" style="color:var(--primary-color);font-weight:600;">NPM 官方仓库</a> 获取固定版本。<br>
            你可以选择通过 <strong>NPM 依赖安装</strong>（推荐现代前端工程）或 <strong>CDN 静态引入</strong> 进行快速部署；发布前也可以使用独立仓库的本地打包产物验收。
        </p>

        <!-- NPM 部署卡片 -->
        <h2 class="doc-h2">方式 1：通过 NPM 安装与部署（React / Vue / Vite / Next.js 推荐）</h2>
        <p style="color:var(--text-main);font-size:14px;line-height:1.6;margin-bottom:12px;">
            在你的项目根目录中安装 <code>@centralgo/cgo-ui</code> 官方依赖：
        </p>
        ${codeBlock(npmInstall)}

        <h3 style="font-size:15px;font-weight:700;margin:20px 0 10px;color:var(--text-main);">1.1 在 React / Next.js 中使用（使用官方 React 封装）</h3>
        <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin-bottom:8px;">
            从 <code>@centralgo/cgo-ui/react</code> 直接导出 React 组件和命令式 API：
        </p>
        ${codeBlock(reactUsage)}

        <h3 style="font-size:15px;font-weight:700;margin:20px 0 10px;color:var(--text-main);">1.2 在 Vanilla JS / Vite / Vue 中注册 Web Components</h3>
        <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin-bottom:8px;">
            在主入口文件（如 <code>main.js</code> 或 <code>index.js</code>）中引入：
        </p>
        ${codeBlock(vanillaImport)}

        <h3 style="font-size:15px;font-weight:700;margin:20px 0 10px;color:var(--text-main);">1.3 Next.js (App Router) 转译配置提示</h3>
        <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin-bottom:8px;">
            若在 Next.js 项目中使用，请在 <code>next.config.mjs</code> 中开启 <code>transpilePackages</code> 配置：
        </p>
        ${codeBlock(nextConfig)}

        <h2 class="doc-h2">方式 2：通过 CDN 引入（静态 HTML / 零构建）</h2>
        <p style="color:var(--text-main);font-size:14px;line-height:1.6;margin-bottom:12px;">
            无需 npm 或打包步骤，直接在 HTML 中按规范引入：
        </p>
        ${codeBlock(cdnSample)}
        <div style="margin-top: 12px; margin-bottom: 24px; display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="./cdn_demo.html" class="btn btn-info btn-sm" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                <cgo-icon name="open-link" size="14"></cgo-icon>
                预览在线 CDN Demo 页面
            </a>
            <a href="./test_no_css.html" class="btn btn-info btn-sm" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                <cgo-icon name="open-link" size="14"></cgo-icon>
                预览零 CSS 依赖 Demo 页面
            </a>
        </div>

        <h2 class="doc-h2">最佳性能优化规范 (Performance & Resource Hints SOP)</h2>
        <p style="color:var(--text-main);font-size:14px;line-height:1.6;margin-bottom:12px;">
            为保证基于 CGoUI 构建的页面拥有极致流畅的加载体验，请遵循以下三项优化规范：
        </p>
        <ul style="color:var(--text-light);font-size:13px;line-height:1.8;margin-bottom:24px;padding-left:20px;">
            <li><strong>最高优先级预拉取：</strong>在 <code>&lt;head&gt;</code> 区域声明 <code>&lt;link rel="modulepreload" href="..."&gt;</code>，利用 Resource Hints 在第一毫秒发起并发拉取与 JS 引擎预解析。</li>
            <li><strong>避免无样式内容闪烁 (FOUC)：</strong>在 CSS 中添加 <code>cgo-icon:not(:defined)</code> 样式限制规则，消除组件未完全定义前的尺寸跳动。</li>
            <li><strong>Sparkle 占位符平滑替代：</strong>对于延迟/异步加载的 PNG 图标，推荐配合 <code>&lt;cgo-icon name="sparkle"&gt;</code> 及 <code>sparkle-pulse</code> 动画进行加载占位，实现透明度无缝淡入展示。</li>
        </ul>

        <h2 class="doc-h2">方式 3：本地构建与独立仓库开发</h2>
        <p style="color:var(--text-main);font-size:14px;line-height:1.6;margin-bottom:12px;">
            CGoUI 源码托管于独立仓库。修改组件后在 CGoUI 目录执行：
        </p>
        ${codeBlock(monorepoBuild)}
        <p style="color:var(--text-light);font-size:13px;line-height:1.6;margin-top:10px;">
            运行构建后产物统一写入 <code>dist/</code>，发布后由主项目按版本安装或通过版本化 CDN 引用。
        </p>`;
}

function initLegacyInteractions(root) {
    const paletteBox = root.querySelector('#metro-palette-box');
    const screenBtn = root.querySelector('#palette-btn-screen');
    const officialBtn = root.querySelector('#palette-btn-official');

    if (paletteBox && screenBtn && officialBtn) {
        const setPalette = (mode) => {
            paletteBox.setAttribute('data-color-palette', mode);
            screenBtn.classList.toggle('btn-primary', mode === 'screen');
            screenBtn.classList.toggle('btn-info', mode !== 'screen');
            screenBtn.classList.toggle('active', mode === 'screen');
            officialBtn.classList.toggle('btn-primary', mode === 'official');
            officialBtn.classList.toggle('btn-info', mode !== 'official');
            officialBtn.classList.toggle('active', mode === 'official');
        };
        screenBtn.addEventListener('click', () => setPalette('screen'));
        officialBtn.addEventListener('click', () => setPalette('official'));
        setPalette(paletteBox.getAttribute('data-color-palette') || 'screen');
    }

    root.querySelectorAll('.filter-tag').forEach((tag) => {
        tag.addEventListener('click', () => {
            tag.parentElement.querySelectorAll('.filter-tag').forEach((item) => item.classList.remove('active'));
            tag.classList.add('active');
        });
    });

    root.querySelectorAll('.line-chip').forEach((chip) => {
        const style = chip.getAttribute('style') || '';
        const match = style.match(/background(?:-color)?\s*:\s*var\((--line-color-[^)]+)\)/i);
        if (!match || chip.dataset.copyColor) return;
        const value = `var(${match[1]})`;
        chip.dataset.copyColor = value;
        chip.title = `点击复制 ${value}`;
        chip.style.cursor = 'pointer';
    });

    root.querySelectorAll('cgo-line-badge').forEach((badge) => {
        const line = (badge.getAttribute('line') || '1').trim().toLowerCase();
        const value = `var(--line-color-${line})`;
        badge.dataset.copyColor = value;
        badge.title = `点击复制 ${value}`;
        badge.style.cursor = 'pointer';
    });

    root.querySelectorAll('cgo-level-card').forEach((card) => {
        const level = (card.getAttribute('level') || 'default').trim().toLowerCase();
        const token = ['test', 'prime', 'admin'].includes(level) ? level : 'default';
        const value = `var(--level-${token}-gradient)`;
        card.dataset.copyColor = value;
        card.title = `点击复制 ${value}`;
        card.style.cursor = 'pointer';
    });

    root.querySelectorAll('.current-level-card').forEach((card) => {
        const token = card.classList.contains('level-card-test')
            ? 'test'
            : card.classList.contains('level-card-prime')
                ? 'prime'
                : card.classList.contains('level-card-admin')
                    ? 'admin'
                    : 'default';
        const value = `var(--level-${token}-gradient)`;
        card.dataset.copyColor = value;
        card.title = `点击复制 ${value}`;
        card.style.cursor = 'pointer';
    });

    if (window.CGO && window.CGO.initDropdowns) window.CGO.initDropdowns(root);
    initCustomThemeInteractions(root);
    injectLiquidGlassToCards(root);
}

/* ============ 自动为卡片注入液态玻璃物理折射层 ============ */
function injectLiquidGlassToCards(container) {
    if (!container) return;
    const cards = container.querySelectorAll('.glass-card, .tool-card, .compare-card, .preview-box');
    cards.forEach((card) => {
        if (!card.querySelector(':scope > .liquid-glass-effect') && !card.querySelector(':scope > .glass-refraction')) {
            const effect = document.createElement('div');
            effect.className = 'liquid-glass-effect';
            effect.setAttribute('aria-hidden', 'true');
            card.prepend(effect);
        }
    });
}

/* ============ 侧栏 + 移动端下拉 ============ */
function buildNav() {
    const sideNav = document.getElementById('doc-nav');
    if (!sideNav) return;

    // 直接在 <cgo-side-nav> 内插入 <cgo-nav-item>（不要嵌套另一层 cgo-side-nav）
    let html = '';
    GROUPS.forEach((g) => {
        html += `<cgo-nav-item heading label="${escAttr(g.title)}"></cgo-nav-item>`;
        g.items.forEach((it) => {
            const tagAttr = it.tag ? ` tag="${escAttr(it.tag)}"` : '';
            const iconAttr = it.icon ? ` icon="${escAttr(it.icon)}"` : '';
            html += `<cgo-nav-item label="${escAttr(it.label)}" target="${escAttr(it.id)}"${tagAttr}${iconAttr}></cgo-nav-item>`;
        });
    });
    sideNav.innerHTML = html;

    // 触发组件重新渲染（LitElement 不会自动感知 light DOM 子元素变化）
    if (sideNav.requestUpdate) sideNav.requestUpdate();

    // 监听导航切换事件
    sideNav.addEventListener('cgo-nav-change', (e) => {
        const target = e.detail.target;
        if (target) {
            location.hash = '#/' + target;
        }
    });
}

function escAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ============ 路由 ============ */
async function route() {
    const id = location.hash.replace(/^#\/?/, '') || 'colors';
    const main = document.getElementById('doc-main');
    const page = findPage(id);

    if (!page) {
        location.hash = '#/colors';
        return;
    }

    if (page.render) main.innerHTML = page.render();
    else if (page.comp) main.innerHTML = renderComponent(page.comp);

    injectLiquidGlassToCards(main);

    // 注入后渲染旧式 <i data-icon> 图标（路由内容是动态插入的，需手动触发）
    if (window.CGO && window.CGO.renderIcons) window.CGO.renderIcons(main);
    initLegacyInteractions(main);

    window.scrollTo(0, 0);

    // 更新侧边导航组件的高亮
    const sideNav = document.getElementById('doc-nav');
    if (sideNav && sideNav.selectByTarget) {
        sideNav.selectByTarget(id);
    }

    // 复制按钮
    main.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const code = btn.parentElement.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                btn.innerHTML = '已复制 <cgo-icon name="check-circle" size="14"></cgo-icon>';
                setTimeout(() => (btn.textContent = '复制'), 1500);
            });
        });
    });
    // 图标点击复制
    main.querySelectorAll('[data-icon-name]').forEach((cell) => {
        cell.addEventListener('click', () => {
            const code = `<cgo-icon name="${cell.dataset.iconName}"></cgo-icon>`;
            navigator.clipboard.writeText(code).then(() => {
                if (window.CGO) CGO.showToast('已复制 ' + cell.dataset.iconName, 'success', 1200);
            });
        });
    });
    main.querySelectorAll('[data-copy-color]').forEach((cell) => {
        cell.addEventListener('click', () => {
            const value = cell.dataset.copyColor;
            navigator.clipboard.writeText(value).then(() => {
                if (window.CGO) CGO.showToast('已复制 ' + value, 'success', 1200);
            });
        });
    });
}

/* ============ 启动 ============ */
function start() {
    buildNav();
    window.addEventListener('hashchange', route);
    if (!location.hash) location.hash = '#/welcome';
    route();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}
