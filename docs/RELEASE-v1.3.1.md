# Luna Pet v1.3.1

区域可用性与离线运行补丁版。

## 主要更新

- 桌面端只加载随包内置的 `file://` 素材，并拦截 HTTP、HTTPS、WebSocket 请求。
- 网页不请求外部 API、字体或 CDN，并带有本地离线启动器。
- DSH 插件取消国家/地区发布白名单，使用公共 npm registry 配置。
- 保留 20 个精选动作、四套服装和 80 条透明动画。
- 日常装中用户认可的 8 条原片保持逐字节不变。

## 地区说明

- 桌面端及本地离线网页包不依赖地区网络，可直接在中国大陆使用。
- `chatgpt.site` 在线地址在中国大陆探测节点会被 Cloudflare 拦截，不应作为中国大陆公网入口。
- 中国大陆公网发布请使用当地可访问的静态托管或 CDN。

## 安装包

- macOS Intel / Apple Silicon
- Windows x64 便携版
- Linux x64 AppImage
- 静态网页包
- Chrome / Edge 扩展
- DSH 插件

所有发布文件均附有 `SHA256SUMS.txt`。
