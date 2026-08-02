# 鱼骨头 AI 代理

这个 Worker 解决 GitHub Pages 无法直接调用阿里云百炼的跨域问题，并将百炼 API Key 保留在服务器密钥中。

## 部署

1. 安装 Node.js 后，在此目录执行 `npx wrangler login`，浏览器中登录 Cloudflare。
2. 执行 `npx wrangler secret put DASHSCOPE_API_KEY`，粘贴阿里云百炼 API Key。
3. 执行 `npx wrangler deploy`。
4. 复制输出的 `https://fishbone-ai.<你的子域>.workers.dev` 地址。
5. 在英语系统的「设置」中选择「安全代理」，填入该地址并保存。

API Key 不要填写到在线版设置，也不要提交到 GitHub。
