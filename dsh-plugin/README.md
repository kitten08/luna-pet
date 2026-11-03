# DSH Luna Pet

DSH 组合插件，包含宿主静态资源路由与经典脚本客户端。安装构建得到的 `dsh-luna-pet-1.0.0.tgz` 后重启 DSH，浏览器页面右下角会出现 Luna。服装和动作菜单在她上方的 ♧ 按钮中。

同页插件可以用 `ctx.get('lunaPet', false)` 取得 `play(name)`、`outfit(id)`、`state()`、`show()` 和 `hide()`。不依赖原版 dsh-pet，不复用原角色视频。

已按参考仓库的 bundle patch / `__ModuleLoader__` / `webServer.register` 契约实现。当前环境未安装 DSH，尚未进行真实宿主安装验证。
