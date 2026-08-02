const ALLOWED_ORIGINS = new Set([
  "https://yuanxuru-oss.github.io",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

const SYSTEM_PROMPT = "You are an English learning assistant. Reply in concise Chinese. For a word or phrase, give: 1) part of speech, 2) Chinese meaning, 3) one short English example with Chinese translation, 4) a memorable usage tip. Do not use Markdown tables.";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://yuanxuru-oss.github.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(origin) });
    if (request.method !== "POST" || new URL(request.url).pathname !== "/translate") {
      return json({ error: { message: "Not found" } }, 404, origin);
    }
    if (!ALLOWED_ORIGINS.has(origin)) return json({ error: { message: "Origin is not allowed" } }, 403, origin);

    const { query } = await request.json().catch(() => ({}));
    if (typeof query !== "string" || !query.trim() || query.length > 500) {
      return json({ error: { message: "请输入 1 到 500 个字符的单词、短语或句子。" } }, 400, origin);
    }
    if (!env.DASHSCOPE_API_KEY) return json({ error: { message: "代理服务尚未配置 AI Key。" } }, 500, origin);

    const upstream = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.DASHSCOPE_MODEL || "qwen-turbo",
        temperature: 0.3,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: `Please explain and translate: ${query.trim()}` }],
      }),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json({ error: { message: data?.error?.message || "AI 服务请求失败。" } }, upstream.status, origin);

    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) return json({ error: { message: "AI 未返回有效内容。" } }, 502, origin);
    return json({ content }, 200, origin);
  },
};
