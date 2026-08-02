const DASHSCOPE_ENDPOINT = "https://dashscope.aliyuncs.com/compatible-mode/v1";

export function resolveAiEndpoint(settings = {}) {
  if (settings.aiProvider === "proxy") {
    const base = settings.aiEndpoint?.trim();
    if (!base) throw new Error("请先在设置中填写 AI 代理地址。");
    return `${base.replace(/\/+$/, "")}/translate`;
  }
  const base = settings.aiProvider === "custom" && settings.aiEndpoint
    ? settings.aiEndpoint.trim()
    : DASHSCOPE_ENDPOINT;
  return `${base.replace(/\/+$/, "")}/chat/completions`;
}

export function buildTranslationMessages(query) {
  return [
    {
      role: "system",
      content: "You are an English learning assistant. Reply in concise Chinese. For a word or phrase, give: 1) part of speech, 2) Chinese meaning, 3) one short English example with Chinese translation, 4) a memorable usage tip. Do not use Markdown tables.",
    },
    {
      role: "user",
      content: `Please explain and translate: ${query}`,
    },
  ];
}

export async function translateWithAi(query, settings, request = globalThis.fetch) {
  const apiKey = settings?.aiApiKey?.trim();
  const usingProxy = settings?.aiProvider === "proxy";
  if (!usingProxy && !apiKey) throw new Error("请先在设置中保存 API Key。");
  if (typeof request !== "function") throw new Error("当前环境不支持 AI 请求。");

  let response;
  try {
    const endpoint = resolveAiEndpoint(settings);
    response = await request(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(usingProxy ? {} : { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(usingProxy
        ? { query }
        : {
            model: settings?.aiModel?.trim() || "qwen-turbo",
            messages: buildTranslationMessages(query),
            temperature: 0.3,
          }),
    });
  } catch {
    throw new Error("无法连接 AI 服务。请检查网络、接口地址，或确认该服务允许浏览器直接调用。");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `AI 服务返回错误（${response.status}）。`);
  }

  const content = usingProxy ? data?.content?.trim() : data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("AI 未返回可显示的翻译结果，请稍后重试。");
  return content;
}
