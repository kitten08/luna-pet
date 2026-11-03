# Luna · 她的陪伴小屋

以用户提供的女孩形象制作的可换装桌宠。包含网页小屋、Electron 桌面端、Chrome / Edge MV3 插件与 DSH 组合插件。

## 真实视频动作制作（2026-11-04）

按用户最新要求，新的动作视频仅依据用户附件与补充分镜制作，不沿用旧版动作配置。视频制作目录共 117 个条目。当前已免费生成 **4 段日常装 5 秒样片**：挥手、托腮笑、食指害羞、抱胸鼓嘴；每段 560×832、16 fps、81 帧，原始 MP4 保存在 `assets/videos/`。

打开 `video.html` 可播放、切换动作、逐帧查看、下载视频和抽帧图。页面可随网站、桌面包和浏览器插件一起构建。它是独立视频预览入口；旧版透明桌宠运行时尚未切换到视频。现有安装包仍为早期程序动画版。

完整 10 秒动作、睡眠三段的共享睡姿及无缝循环、透明背景、另外三套换装视频均未完成。样片带黑色背景，首尾未逐像素对齐；食指方向及抱胸鼓嘴停留仍需改进，不应当作已完成的正式素材。Hugging Face 每日免费额度在第 5 条任务时耗尽，未购买或使用付费额度。

分镜、117 项目录、每条样片参数、哈希和抽查记录见 [视频制作记录](docs/video-production/generation-results.json) 与 [完整制作清单](docs/video-production/video-production-manifest.json)。下面的 109 动作与换装说明属于先前的程序动画版本。

## 先前程序动画版本功能

- 四套穿搭：原图日常、紫色洛丽塔、海军领 JK、黑白女仆装；本地记忆。
- 参考 [dsh-pet](https://github.com/PC2005-cloud/dsh-pet) 当前配置的 **109 个动作**全部可点播、可搜索、可分类浏览。完整映射见 [动作对照表](docs/ACTIONS.md)。
- 同一套 2.5D 网格骨架驱动头部、手臂、裙摆、双腿和发丝；呼吸、眨眼、进出动作平滑插值、换装淡入淡出。
- 点击回应、拖拽抛掷、重力与回弹、睡眠与叫醒、随机活动、三种场景、大小及轻缓动作设置。
- 桌面端透明置顶窗、系统托盘、桌面拖动；浏览器插件点击工具栏后在当前页面显示。
- 无账户、无云端模型依赖；偏好保存在当前设备。

这些是为女孩重编的程序化动作，**并非 109 段重新绘制的逐帧视频或 Live2D 模型**。原参考的鲸鱼尾巴、蓝鲸等动作改为女孩踏步、漂浮与鲸鱼道具；转身采用 2.5D 透视变化。身体姿态与道具有针对性配置，服装沿用同一动作骨架。动画效果仍需在目标设备上做实际视觉验收。

## 网站

需要 Node.js 24+。网页运行无第三方依赖：

```sh
npm run dev
```

打开终端输出的本机地址 `http://127.0.0.1:4173`。`npm run build` 生成 `dist/`，可交给任意静态网站服务托管。不要直接双击 HTML（浏览器会限制本地 ES 模块）。

## 桌面端

```sh
npm ci
npm start
```

首次使用先执行 `npm run build`。上方 ⠿ 手柄可将透明宠物窗拖到桌面任意显示器；拖动人物本身可在窗内抛掷玩耍。工具条在鼠标移入后显示。托盘可再次呼唤隐藏的 Luna 或退出软件。

```sh
npm run pack:mac    # 在 macOS 上生成 ZIP 应用包
npm run pack:win    # Windows 便携 EXE
npm run pack:linux  # Linux AppImage
```

在对应操作系统构建。生成到 `release/`。macOS 包未签名或公证；Windows 包未签名。当前本地交付为 Intel Mac 构建，Apple Silicon 可从源码原生构建或使用仓库构建工作流。签名、公证、自动更新和应用商店上架未配置。

## 浏览器插件

1. `npm run build`。
2. Chrome / Edge 的扩展管理页面开启开发者模式。
3. 加载已解压的扩展，选择 `builds/browser-extension/`。
4. 在普通 HTTP / HTTPS 网页点击工具栏上的 Luna 图标显示，再点隐藏。浏览器内置页和应用商店页面受浏览器限制。

只请求 `activeTab`、`scripting`、`storage`，点击时临时注入，不主动读取网页内容。部分站点的 CSP 可能阻止 iframe。插件尚未发布到扩展商店。

## DSH 插件

```sh
npm run build
cd builds/dsh-plugin
npm pack
```

通过 DSH 添加本地组合插件包，选择生成的 `dsh-luna-pet-1.0.0.tgz`，完成后重启 DSH。包中的 `cordis.patch.yml`、经典脚本客户端和 `webServer.register` 路由遵循参考仓库的插件契约。该接入未在真实 DSH 宿主内验证。

同页客户端插件：

```js
const luna = ctx.get('lunaPet', false);
luna?.play('点击回应-元气挥手');
luna?.outfit('lolita'); // original / lolita / jk / maid
```

## 开发与验证

```sh
npm test
npm run build
```

测试覆盖动作清单、姿态范围、动作衔接、轻缓模式、素材存在性、睡眠状态、抛掷边界与换装保护。浏览器可视化和真实 DSH 安装验证状态见 [验收记录](docs/VALIDATION.md)。

GitHub Actions 提供手动触发的四平台构建，产物在运行页面的 Artifacts 中。不会自动发布公共 Release。

## 文件

- `src/engine.js`：动画、网格形变、物理和渲染。
- `src/actions.js` / `src/catalog.js`：109 个动作编排与原始清单。
- `assets/`：原图及三套服装的开眼 / 闭眼精灵图。
- `desktop/`、`extension/`、`dsh-plugin/`：各平台入口。
- [素材提示词](docs/ASSET_PROMPTS.md) / [许可来源](THIRD_PARTY_NOTICES.md)。
