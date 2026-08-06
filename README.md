# @centralgo/cgo-ui

CGoUI 是一套基于 Lit 的 Web Components 组件库，同时提供可选的 React 适配
器。它可以独立安装、独立构建、独立发布，也可以不依赖构建工具直接通过
版本化 CDN 使用。

本仓库是 CGoUI 的独立开源仓库。主项目不再读取这里的源码目录，而是通过
发布后的 `@centralgo/cgo-ui` 版本消费组件；主项目自己的备案号、应用路由、
品牌图片和业务兼容逻辑属于宿主应用，不属于通用组件库。

文档示例统一以 `2.1.0` 为版本。若该版本尚未上传公共 NPM，先在本仓库执行
`npm run release:check` 和 `npm pack`，再用生成的 tarball 做本地验收；发布完成后
即可按下述 NPM 或 jsDelivr 地址安装/引用。

## 安装

### React / Next.js

```sh
npm install @centralgo/cgo-ui@2.1.0
```

```jsx
import { CgoButton, CgoBadge, showToast } from '@centralgo/cgo-ui/react';

export function Example() {
  return (
    <CgoButton variant="primary" onClick={() => showToast('已保存', 'success')}>
      保存
    </CgoButton>
  );
}
```

React、React DOM、`@lit/react` 和 Lit 应由宿主应用提供；React 适配器是可选
入口，纯 Web Components 用户不需要安装 React。

### 原生 HTML / CDN

CDN 地址必须固定版本，避免未审查的 `latest` 在生产环境中漂移：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/styles/cgo_clr.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/styles/cgo_element.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/styles/cgo_ui.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/styles/cgo_components.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/dist/cgo-ui.js"></script>
```

如果页面只使用 Shadow DOM 组件，也可以只加载 `dist/cgo-ui.js`；四份 CSS
用于宿主页面的通用主题变量、表单、布局和复杂组件样式。

## 宿主定制与兼容垫片

通用包不会内置某个项目的备案号、图片路径或应用判断。需要保留旧项目的
`window.CGO` / `window.ToolTheme` API 时，可以在加载 `register` 前提供配置：

```html
<script>
  window.CGoUIConfig = {
    branding: {
      copyright: 'Copyright © 2026 Example Team',
      links: [{ label: '备案信息', href: 'https://example.com/record' }],
      beianPath: '/assets/record.png',
      beianAlt: '备案图标'
    },
    embed: { queryParam: 'embed', queryValue: 'embedded-hide' },
    shouldHideHeader: ({ window }) => Boolean(window.parent?.isEmbeddedHost)
  };
</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@centralgo/cgo-ui@2.1.0/dist/cgo-ui.js"></script>
```

也可以在模块中调用 `configureGlobalShim()`，让备案、版权和嵌入式页面判定
完全由宿主应用维护。

## 目录结构

```text
src/             组件、主题、图标和兼容垫片源码
styles/          可直接被宿主页面引用的公共 CSS
dist/            由构建脚本生成的 NPM/CDN 产物
docs/            组件文档站数据与演示
legacy/          仅用于迁移参考的旧版脚本，不参与发布
scripts/         构建、检查、烟囱测试和清理脚本
```

## 开发、测试和发布

```sh
npm install
npm run build
npm test
npm run check
npm run test:pack
npm run docs
```

发布前使用：

```sh
npm run release:check
npm run publish:public
```

`publish:public` 会先执行完整的发布前检查，并要求显式设置
`NPM_PUBLISH_CONFIRM=YES`；它不会自动修改版本号、提交 Git 或推送远端。发布前请先
更新 `CHANGELOG.md`、确认 `npm whoami` 和双因素认证状态，并检查
`npm pack --dry-run` 的文件清单。

## 许可证

本项目以 Apache License 2.0 发布，详见 [LICENSE](./LICENSE)。第三方依赖的
许可证和版权声明见 [NOTICE](./NOTICE) 与 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)，
以及最终安装包中的依赖目录。
