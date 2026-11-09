Luna 网页版 · 全地区 / 本地离线启动

网页本身不请求任何外部 API、字体或 CDN，全部 80 条动画均随包分发。

macOS：
双击 start-offline.command。若系统提示权限不足，在终端执行：
chmod +x start-offline.command
./start-offline.command

Windows：
双击 start-offline.bat。

也可以在当前目录运行：
node serve.mjs

然后用浏览器打开终端显示的 http://127.0.0.1:4173。
运行本地服务需要 Node.js 24 或更高版本。
