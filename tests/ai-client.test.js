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
