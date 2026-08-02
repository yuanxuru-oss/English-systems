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
    aiProvider: "proxy",
    aiEndpoint: "https://fishbone-ai.example.workers.dev/",
  }, async (url, options) => {
    assert.equal(url, "https://fishbone-ai.example.workers.dev/translate");
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(JSON.parse(options.body).query, "stress");
    return { ok: true, json: async () => ({ content: "n. 压力" }) };
  });
  assert.equal(result, "n. 压力");
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
  assert.equal(result, "v. 放弃");
});
