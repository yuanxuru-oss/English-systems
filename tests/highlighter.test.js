import test from "node:test";
import assert from "node:assert/strict";
import { createHighlighter } from "../src/core/highlighter.js";

test("createHighlighter wraps CET and project keywords in highlight spans", () => {
  const highlight = createHighlighter(["adversity"], ["wisdom"]);
  const output = highlight("Adversity can shape wisdom.");

  assert.match(output, /<span class="vocab-highlight">Adversity<\/span>/);
  assert.match(output, /<span class="vocab-highlight">wisdom<\/span>/);
});
