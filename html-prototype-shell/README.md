# HTML 原型外壳

这是一个独立的 HTML 原型浏览器，不依赖 Vue、Vite 或 npm 安装。

它只读取外部文件，不修改历史 HTML 和 PRD：

- 自动扫描 `config.json` 中的 HTML 原型目录；
- 左侧生成业务菜单，整体外观与后台业务页面保持一致；
- 中间用无边框全画布 iframe 保留原 HTML 的弹窗、表单和脚本交互；
- 加载页面时注入隔离样式，隐藏原页面菜单栏和顶部栏；
- PRD 默认关闭，需要时通过顶栏按钮在右侧展开；
- PRD 侧窗支持固定分屏、浮层、目录、正文搜索、前后匹配和新窗口打开；
- `bindings.json` 维护页面与 PRD 文件的关联；
- 多页 HTML 的原有相对链接继续在 iframe 内运行。

## 使用

1. 修改 `config.json`：

   - `prototypeRoot`：历史 HTML 原型根目录；
   - `docsRoot`：PRD Markdown 根目录；
   - `hideSelectors`：历史页面菜单栏和顶栏的 CSS 选择器；
   - `port`：外壳端口，默认 5190。

2. 修改 `bindings.json`：

```json
[
  {
    "page": "营运端/dashboard.html",
    "document": "公务车/01_Dashboard.md",
    "anchor": "1. 页面范围",
    "title": "Dashboard PRD"
  }
]
```

同一个页面可以配置多条关联。标题栏会在多文档时显示选择器；`primary` 决定默认文档，`category` 用于分组，`order` 控制展示顺序：

```json
[
  {
    "page": "营运端/order_detail.html",
    "document": "门市租赁/订单/订单详情.md",
    "title": "门市租赁 · 订单详情",
    "primary": true,
    "category": "页面主 PRD",
    "order": 1
  },
  {
    "page": "营运端/order_detail.html",
    "document": "门市租赁/订单/订单取车.md",
    "title": "订单取车",
    "category": "履约流程",
    "order": 2
  }
]
```

3. 双击 `start-shell.cmd`。
4. 打开 `http://127.0.0.1:5190`。

页面关联配置和外壳代码都在当前文件夹内，历史 HTML、Vue 工程和 PRD 文件不会被写入。
