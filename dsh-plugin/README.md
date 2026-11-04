# Luna 桌宠插件

在项目根目录执行 `npm run build`，进入 `builds/dsh-plugin` 后执行 `npm pack`。在宿主中加载生成的本地包，重启后打开 Luna。插件使用 Luna 的用户动作清单。

同页插件可以用 `ctx.get('lunaPet', false)` 取得 `play(id)`、`outfit(id)`、`state()`、`show()` 和 `hide()`。例如 `play('new-01')` 播放当前服装的打招呼动画。
