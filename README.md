# Luna · 她的陪伴小屋

Luna 是用用户提供的女孩形象制作的可换装桌宠，包含网站、Electron 桌面端、Chrome / Edge 扩展和 DSH 宿主插件。

## 动作剧场

[动作清单](docs/video-production/动作目录.md)包含用户附件 105 项、新增表情 9 项、睡眠三段，共 117 项，每项 10 秒。可搜索并按类别筛选。

附件动作采用实时 2D 骨架、服装素材和独立的动作及道具轨迹。四套服装均可使用这套骨架。日常装的委屈、捂嘴、思考、V 字和比心优先播放透明关键帧动画，其他服装使用对应的实时 2D 版本。睡眠三段使用日常装的透明关键帧动画。入睡结束自动进入循环，从循环可以叫醒。四条早期 MP4 仍可在视频样片页逐帧查看和下载。

当前实现是 2D 插画动画。完整空间转身、复杂道具操作和手指细节作了 2D 简化。作品不依赖网络模型运行。

## 网站

需要 Node.js 24+。

```sh
npm run dev
```

打开终端显示的本机地址。页面上的「动作剧场」也可通过 `index.html?view=actions` 直接打开。`npm run build` 把网站构建到 `dist/`。

## 桌面端

```sh
npm ci
npm run build
npm start
```

透明窗口支持换装、点播和拖动。工具栏的 ⠿ 可拖动整个宠物窗口，系统托盘可重新呼唤 Luna 或退出。

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

动作媒体的来源、制作状态和检查记录见 [视频制作记录](docs/video-production/generation-results.json)。
