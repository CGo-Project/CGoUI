# @centralgo/cgo-ui

**CGoUI（Central Go 前端视觉库）** 是一套面向公共服务网站与在线数字效率工具的轻量级前端视觉系统。项目基于 Lit 构建标准 Web Components，无需框架即可在原生 HTML 中使用，也提供可选的 React 适配器和版本化 CDN 入口。

[官网与在线文档](https://centralgo.site/cgoui/#/welcome) · [贡献指南](./CONTRIBUTING.md) · [安全政策](./SECURITY.md) · [更新记录](./CHANGELOG.md)

### 核心能力

- **标准 Web Components**：基于 Lit，原生 HTML、React 等宿主均可接入。
- **亮色 / 暗色与响应式布局**：组件支持明暗主题切换，并适配桌面端与移动端。
- **CSS 变量与自定义主题**：通过统一设计变量和 `CGO.theme.setThemeColor()` 管理品牌色及衍生色。
- **按需接入**：可通过 NPM 使用，也可直接加载固定版本 CDN 产物，无需额外构建工具。

本仓库是 CGoUI 的独立开源仓库。主项目不再读取这里的源码目录，而是通过
发布后的 `@centralgo/cgo-ui` 版本消费组件；主项目自己的备案号、应用路由、
品牌图片和业务兼容逻辑属于宿主应用，不属于通用组件库。

文档示例统一以 `2.1.0` 为版本。若该版本尚未上传公共 NPM，贡献者应先在本
仓库执行 `npm run release:check` 和 `npm pack`，使用生成的 tarball 做本地验收；
**普通贡献者无需、也不应直接向 NPM 发布包**。正式 NPM 发布只在 Pull Request
完成审核、CI 通过并合并到受保护的 `main` 后，由拥有 `@centralgo/cgo-ui`
发布权限的维护者执行。

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

## 开发与贡献

推荐从最新 `main` 创建独立分支，并使用锁文件进行可重复安装：

```sh
npm ci
npm run build
npm test
npm run check
npm run test:pack
npm run docs
```

普通贡献者的流程到 Pull Request 为止：

1. 从最新 `main` 创建功能或修复分支，不直接把日常开发提交推到 `main`。
2. 完成修改后至少运行 `npm run release:check`；涉及依赖变更时同步提交正确的 `package-lock.json`。
3. 将分支推送到 GitHub 并创建 Pull Request，说明改动、验证方式以及是否影响组件 API、主题或打包产物。
4. 等待 CI 通过并由维护者完成 Review；只有满足仓库合并规则的 PR 才进入 `main`。
5. PR 合并后，贡献者流程结束。除非维护者明确安排发布工作，否则不要创建发布 Tag、GitHub Release，也不要执行 `npm publish` 或 `npm run publish:public`。

## NPM 发布（仅维护者）

`@centralgo/cgo-ui` 的 NPM 写权限应只分配给实际负责发版的维护者。仓库中的
`publish:public` 只是防止误操作的发布辅助脚本，**它不会、也不应该给普通
贡献者任何 NPM 发布权限**；真正的授权由 npmjs.com 上的包权限、2FA 或 Trusted
Publishing 配置控制。

维护者应在 PR 已审核并合并、`main` CI 全绿后，从干净的 `main` 状态执行：

```sh
npm ci
npm run release:check
npm pack --dry-run

# 仅拥有 NPM 发布权限的维护者执行
NPM_PUBLISH_CONFIRM=YES npm run publish:public
```

`publish:public` 会再次执行完整发布前检查，并要求显式设置
`NPM_PUBLISH_CONFIRM=YES`；它不会自动修改版本号、提交 Git 或推送远端。发布前请先
更新 `CHANGELOG.md`、确认版本号、`npm whoami` 与双因素认证状态，并检查
`npm pack --dry-run` 的文件清单。

### 推荐的仓库与发布治理

- 将 `main` 设置为受保护分支，要求 Pull Request、至少一名维护者批准、CI 状态检查通过和未解决讨论清零后才能合并；关闭普通协作者直接 Push 与 Force Push。
- NPM 包只保留少量维护者的写权限并启用 2FA。不要把长期有效的 NPM 发布 Token 提交到仓库、PR、示例配置或普通开发环境中。
- 如果后续希望把发版自动化，优先使用 NPM Trusted Publishing + GitHub Actions OIDC：由受保护的 Tag / Release 或受保护 Environment 触发发布，仍由维护者决定何时发版，而不是让每个贡献者获得 Registry 凭证。
- 如需“CI 先产出、维护者最后确认”这一模式，可以进一步采用 NPM staged publishing；CI 只提交待发布包，维护者检查后再用 2FA 批准上线。

## 许可证

本项目以 Apache License 2.0 发布，详见 [LICENSE](./LICENSE)。第三方依赖的
许可证和版权声明见 [NOTICE](./NOTICE) 与 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)，
以及最终安装包中的依赖目录。
