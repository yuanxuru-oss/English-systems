# 鱼骨头 AI 代理

这个 Worker 解决 GitHub Pages 无法直接调用阿里云百炼的跨域问题，并将百炼 API Key 保留在服务器密钥中。

## 部署

1. 安装 Node.js 后，在此目录执行 `npx wrangler login`，浏览器中登录 Cloudflare。
2. 执行 `npx wrangler kv namespace create USAGE`，复制输出的 namespace id。
3. 打开 `wrangler.toml`，将 `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` 替换为刚才复制的 id。
4. 执行 `npx wrangler secret put DASHSCOPE_API_KEY`，粘贴阿里云百炼 API Key。
5. 执行 `npx wrangler deploy`。
6. 复制输出的 `https://fishbone-ai.<你的子域>.workers.dev` 地址。
7. 在英语系统的「设置」中选择「免费额度」。系统会自动使用项目配置的代理地址。

API Key 不要填写到在线版设置，也不要提交到 GitHub。

## 免费额度规则

- 每个学习空间每天可查询 5 次不在本地词库中的生词或短句。
- 本地词库命中不消耗额度。
- 达到额度后，页面会显示“今日免费额度已用完”，而不是请求失败。
