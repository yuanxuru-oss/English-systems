import test from "node:test";
import assert from "node:assert/strict";
import { buildTranslationMessages, resolveAiEndpoint, translateWithAi } from "../src/core/ai-client.js";

test("DashScope uses the compatible chat completions endpoint", () => {
  assert.equal(
    resolveAiEndpoint({ aiProvider: "dashscope" }),
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
  );
  assert.match(buildTranslationMessages("abandon")[1].content, /abandon/);
});

test("proxy uses its translate endpoint without a browser API key", async () => {
  const result = await translateWithAi("stress", {
    aiProvider: "free",
  }, async (url, options) => {
    assert.equal(url, "https://fishbone-ai.yoselin-fishbone-ai.workers.dev/translate");
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(JSON.parse(options.body).query, "stress");
    assert.equal(options.headers["X-Review-User"], "anon_test-user");
    return { ok: true, json: async () => ({ content: "n. 压力", remaining: 4 }) };
  }, "anon_test-user");
  assert.equal(result.content, "n. 压力");
  assert.equal(result.remaining, 4);
});

test("translateWithAi returns the compatible API response text", async () => {
  const result = await translateWithAi("abandon", { aiApiKey: "test-key" }, async (url, options) => {
    assert.match(url, /chat\/completions$/);
    assert.equal(options.headers.Authorization, "Bearer test-key");
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "v. 放弃" } }] }),
    };
  });
  assert.equal(result.content, "v. 放弃");
});
