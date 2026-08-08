# Contributing to CGoUI

感谢参与 CGoUI。提交代码前，请先确认组件行为、无障碍属性、主题变量和 React 适配器没有回归。

## 本地开发

推荐使用锁文件进行可重复安装：

```sh
npm ci
npm run build
npm test
npm run check
npm run test:pack
```

`npm run dev` 会持续构建 `dist/`。不要直接编辑 `dist/`，它是可重复生成的发布产物。

只有在确实需要增加、删除或升级依赖时才运行 `npm install`，并把对应的 `package.json` / `package-lock.json` 变更一并提交，确保 CI 中的 `npm ci` 可复现。

## 提交与 Pull Request

普通贡献者的交付边界是 GitHub Pull Request，而不是 NPM Registry：

1. 从最新 `main` 创建独立的功能或修复分支，不直接把日常开发提交推到 `main`。
2. 完成修改后运行 `npm run release:check`；涉及打包内容时再检查 `npm pack --dry-run`。
3. 推送你的分支并创建 Pull Request，在描述中说明改动目的、验证方式，以及是否影响组件 API、主题、样式或构建产物。
4. 等待 CI 通过、Review 意见处理完成并由维护者批准后再合并。仓库启用分支保护时，以保护规则为准。
5. PR 合并后，普通贡献者的发布流程即告结束。除非维护者明确安排发版任务，否则不要创建发布 Tag / GitHub Release，也不要执行任何 NPM 发布命令。

## NPM 发布边界

- **禁止普通贡献者执行 `npm publish` 或 `npm run publish:public`。** 仓库中保留的 `publish:public` 是维护者发布辅助脚本，不是普通开发命令，也不会赋予任何 NPM 权限。
- `@centralgo/cgo-ui` 的正式 NPM 发布只能由拥有该包发布权限的维护者，在 PR 已审核并合并、`main` CI 全绿后执行。
- 不要在仓库、PR、Issue、示例配置或普通开发环境中提交、粘贴或共享 NPM 发布 Token、OTP 或其他 Registry 凭据。
- 若仓库后续接入 NPM Trusted Publishing / GitHub Actions OIDC，贡献者仍只提交 PR；发布工作流与受保护的 Tag、Release 或 Environment 应由维护者控制。

## 提交要求

- 新增或修改组件时同步更新 README、示例或变更日志。
- 修改主题系统时同步核对 `src/theme.js`、文档站的 Custom Theme 示例以及 `templates/PROMPT.md` 中公开给 AI 的主题契约。
- 不要把宿主业务的备案号、内部路径、登录逻辑或应用名称写入通用组件。
- 保留第三方依赖的版权与许可证声明。
- 提交 PR 前必须使用 `npm run release:check`；正式发布动作由维护者执行。
