# Contributing to CGoUI

感谢参与 CGoUI。提交代码前，请先确认组件行为、无障碍属性、主题变量和
React 适配器没有回归。

## 本地开发

```sh
npm install
npm run build
npm test
npm run test:pack
```

`npm run dev` 会持续构建 `dist/`。不要直接编辑 `dist/`，它是可重复生成的
发布产物。

## 提交要求

- 新增或修改组件时同步更新 README、示例或变更日志。
- 不要把宿主业务的备案号、内部路径、登录逻辑或应用名称写入通用组件。
- 保留第三方依赖的版权与许可证声明。
- 发布前必须使用 `npm run release:check`，发布动作由维护者执行。
