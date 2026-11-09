# Luna · 她的陪伴小屋

Luna 是用用户提供的女孩形象制作的可换装桌宠，包含网站、Electron 桌面端、Chrome / Edge 扩展和 DSH 宿主插件。

## 动作剧场

剧场有 20 个精选动作，日常装、洛丽塔、JK 和女仆装各有 20 条透明动画。每条 10 秒。详细名称和制作结果见 [动作清单](docs/动作清单.md)。

日常装中用户确认的 8 条原片原样保留。新片使用内置 imagegen 绘制各服装的关键姿势，再本地补间。每套服装的入睡、循环和醒来共用自己的蜷睡画面。

点击 Luna 时交替播放两种点击回应，拖动时进入悬空动画。松开后恢复待机。睡觉按钮会先播入睡，再进入睡眠循环，再次点击会播放醒来。

## 网站

需要 Node.js 24+。

```sh
npm run dev
```

打开终端显示的本机地址。页面上的「动作剧场」也可通过 `index.html?view=actions` 直接打开。`npm run build` 把网站构建到 `dist/`。

网页不请求外部 API、字体或 CDN，全部动作、服装和脚本都随静态包分发。`connect-src 'none'` 会阻止页面自行建立网络连接，因此发布到任何地区相同的静态内容均可使用。离线使用时，把网页包解压后在该目录运行 `npx serve .`，或直接使用桌面端。

## 桌面端

```sh
npm ci
npm run build
npm start
```

透明窗口支持换装、点播和拖动。工具栏的 ⠿ 可拖动整个宠物窗口，系统托盘可重新呼唤 Luna 或退出。

桌面端只加载随包内置的 `file://` 资源；运行时统一拦截 HTTP、HTTPS 和 WebSocket 请求，因此不依赖网络线路或地区服务。

```sh
npm run pack:mac
npm run pack:win
npm run pack:linux
```

在相应平台构建，产物写入 `release/`。本地 macOS 包为 Intel 版，未签名和公证。其他平台可在仓库手动运行构建工作流。

## 插件

Chrome / Edge 使用扩展管理页的「加载已解压的扩展」，选择 `builds/browser-extension/`。在普通网页点击工具栏 Luna 图标显示或隐藏。扩展仅使用 `activeTab`、`scripting` 和 `storage`。

DSH 宿主可加载在 `builds/dsh-plugin/` 执行 `npm pack` 得到的本地包。其他插件可通过 `ctx.get('lunaPet', false)` 获取接口，调用 `play('new-01')` 播放挥手。素材加载前或睡眠片段与当前服装不匹配时，`play` 返回 `false`。推荐使用动作 ID。

## 验证

```sh
npm test
npm run build
```

动作媒体的来源和验收记录见 [素材提示词](docs/ASSET_PROMPTS.md) 与 [验收](docs/VALIDATION.md)。
