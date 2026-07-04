import test from "node:test";
import assert from "node:assert/strict";
import { parseTemplateBlock } from "../src/core/parser.js";

test("parseTemplateBlock extracts metadata, passage, and question rows", () => {
  const parsed = parseTemplateBlock(`[模块类型] reading
[标题] CET 完型训练
[文章]
This is a sample passage.
[题目]
blank one | answer1
blank two | answer2
`);

  assert.equal(parsed.type, "reading");
  assert.equal(parsed.title, "CET 完型训练");
  assert.equal(parsed.passage, "This is a sample passage.");
  assert.equal(parsed.items.length, 2);
  assert.equal(parsed.items[0].answer, "answer1");
});
