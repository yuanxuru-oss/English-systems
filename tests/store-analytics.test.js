import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/core/store.js";
import { seedState } from "../src/data/seed.js";

function createTrackedStore() {
  const events = [];
  const store = createStore(structuredClone(seedState), {
    persist() {},
    analytics: {
      track(name, properties) {
        events.push({ name, properties });
      },
    },
  });

  return { store, events };
}

test("import preview and apply emit analytics events", () => {
  const { store, events } = createTrackedStore();

  store.actions.importTemplateBlock(`[模块类型] reading
[标题] 埋点测试模块
[文章]
This is a sample passage.
[题目]
sample prompt | answer
`);
  store.actions.applyImportPreview();

  assert.equal(events[0].name, "import_preview_generated");
  assert.equal(events[0].properties.module_type, "reading");
  assert.equal(events[1].name, "import_applied");
  assert.equal(events[1].properties.item_count, 1);
});

test("submitting reading answers emits reading submission and checkin events", () => {
  const { store, events } = createTrackedStore();
  const moduleId = "mod-f1-reading-cloze";

  store.actions.submitReadingAnswers(moduleId, {
    f1r1: "satisfaction",
    f1r2: "wrong",
    f1r3: "adversity",
  });

  const eventNames = events.map((event) => event.name);

  assert.ok(eventNames.includes("reading_submitted"));
  assert.ok(eventNames.includes("checkin_completed"));

  const readingEvent = events.find((event) => event.name === "reading_submitted");
  assert.equal(readingEvent.properties.total_items, 3);
  assert.equal(readingEvent.properties.correct_count, 2);
});

test("mistake follow-up actions emit analytics events", () => {
  const { store, events } = createTrackedStore();
  const moduleId = "mod-f1-reading-cloze";

  store.actions.submitReadingAnswers(moduleId, {
    f1r1: "wrong",
    f1r2: "wrong",
    f1r3: "adversity",
  });

  const mistakeId = store.getState().mistakes[0].id;
  store.actions.addMistakeNote(mistakeId, "Need to review the collocation.");
  store.actions.toggleMistakeMastered(mistakeId);
  store.actions.addMistakeToFlashcards(mistakeId);

  const eventNames = events.map((event) => event.name);
  assert.ok(eventNames.includes("mistake_note_saved"));
  assert.ok(eventNames.includes("mistake_mastery_toggled"));
  assert.ok(eventNames.includes("mistake_added_to_flashcards"));
});

test("translation and vocabulary actions emit analytics events", () => {
  const { store, events } = createTrackedStore();
  const translationId = "mod-f1-translation";

  store.actions.saveTranslationDraft(translationId, {
    f1t1: "Creative thinking is not exclusive to artists.",
  });
  store.actions.checkTranslationAnswers(translationId, {
    f1t1: "Creative thinking is not a fixed trait reserved for artists and inventors.",
    f1t2: "The rise of e-commerce platforms has enabled even small businesses to reach global markets.",
  });
  store.actions.addVocabularyToFlashcards([
    { word: "prototype", pos: "n.", zh: "原型", context: "build a prototype", mastered: false },
  ]);
  store.actions.toggleVocabularyMastered("adversity");

  const eventNames = events.map((event) => event.name);
  assert.ok(eventNames.includes("translation_saved"));
  assert.ok(eventNames.includes("translation_checked"));
  assert.ok(eventNames.includes("vocabulary_added_to_flashcards"));
  assert.ok(eventNames.includes("vocabulary_mastery_toggled"));
});
