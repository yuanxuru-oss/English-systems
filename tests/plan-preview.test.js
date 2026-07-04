import test from "node:test";
import assert from "node:assert/strict";
import { planPreviewContent } from "../src/data/plan-preview.js";

test("plan preview content covers persistence, restore flow, and future roadmap", () => {
  assert.equal(planPreviewContent.hero.title, "这次准备接入什么");
  assert.equal(planPreviewContent.persisted.length, 6);
  assert.equal(planPreviewContent.notPersisted.length, 3);
  assert.equal(planPreviewContent.flow.length, 4);
  assert.equal(planPreviewContent.files.length, 4);
  assert.equal(planPreviewContent.roadmap.length, 2);
  assert.match(planPreviewContent.roadmap[0].title, /开源网站/);
  assert.match(planPreviewContent.roadmap[1].title, /Windows EXE/);
});
