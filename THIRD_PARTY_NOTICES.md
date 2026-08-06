# Third-party notices

本文件记录 CGoUI 构建和适配器使用的第三方项目及其许可证入口。CGoUI
本身仍以 Apache License 2.0 发布；第三方项目的许可证条款不因本包的发布
方式而改变。

| 项目 | 用途 | 许可证 | 许可证文本 |
| --- | --- | --- | --- |
| Lit / lit-html / lit-element | Web Components 运行时 | BSD-3-Clause | <https://github.com/lit/lit/blob/main/LICENSE> |
| `@lit/react` | React 适配器 | BSD-3-Clause | <https://github.com/lit/lit/blob/main/LICENSE> |
| React / React DOM | React 适配器的宿主 peer dependency | MIT | <https://github.com/facebook/react/blob/main/LICENSE> |

发布包不把这些 peer dependency 打包进 `dist`；使用方通过自己的依赖树安装，
并应继续保留相应许可证与版权声明。
