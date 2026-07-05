import test from "node:test";
import assert from "node:assert/strict";
import { createHydratedState, serializePersistedState, persistState, STORAGE_PREFIX, storageKey } from "../src/core/persistence.js";
import { seedState } from "../src/data/seed.js";

const TEST_USER = "test-user";
const TEST_KEY = storageKey(TEST_USER);

function createMemoryStorage(initialValue = null) {
  const map = new Map();
  if (initialValue !== null) {
    map.set(TEST_KEY, initialValue);
  }
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, value); },
  };
}

function userSeed() {
  const s = structuredClone(seedState);
  s.userName = TEST_USER;
  return s;
}

test("serializePersistedState stores only the approved subset", () => {
  const serialized = serializePersistedState({
    ...userSeed(),
    route: "reading",
    routePayload: { moduleId: "module-reading-1" },
    importPreview: { id: "preview-1" },
  });

  const parsed = JSON.parse(serialized);

  assert.equal(parsed.version, 2);
  assert.equal(parsed.state.route, "reading");
  assert.ok("projects" in parsed.state);
  assert.ok(!("routePayload" in parsed.state));
  assert.ok(!("importPreview" in parsed.state));
  assert.ok(!("checkin" in parsed.state));
});

test("createHydratedState merges allowed fields and recomputes checkin", () => {
  const payload = JSON.stringify({
    version: 2,
    savedAt: "2026-07-02T10:00:00.000Z",
    state: {
      route: "flashcards",
      currentProjectId: "project-cet",
      studyLog: [{
        id: "log-1", type: "reading-practice", moduleId: "module-reading-1",
        projectId: "project-cet", date: new Date().toISOString(), title: "Reading",
      }],
      flashcards: [],
      mistakes: [],
      projects: seedState.projects,
      checkin: { today: "1999-01-01", isCheckedIn: false, completedActions: [] },
    },
  });

  const hydrated = createHydratedState(userSeed(), createMemoryStorage(payload));

  assert.equal(hydrated.route, "flashcards");
  assert.equal(hydrated.importPreview, null);
  assert.equal(hydrated.routePayload && Object.keys(hydrated.routePayload).length, 0);
  assert.equal(hydrated.checkin.isCheckedIn, true);
  assert.notEqual(hydrated.checkin.today, "1999-01-01");
});

test("createHydratedState falls back to seedState on malformed JSON", () => {
  const hydrated = createHydratedState(userSeed(), createMemoryStorage("{bad json"));
  assert.deepEqual(hydrated.projects, seedState.projects);
  assert.equal(hydrated.route, seedState.route);
});

test("createHydratedState ignores unsupported versions", () => {
  const payload = JSON.stringify({ version: 999, state: { route: "mistakes" } });
  const hydrated = createHydratedState(userSeed(), createMemoryStorage(payload));
  assert.equal(hydrated.route, seedState.route);
});

test("persistState writes the serialized payload under the storage key", () => {
  const storage = createMemoryStorage();
  persistState(userSeed(), storage);

  const saved = storage.getItem(TEST_KEY);
  assert.ok(saved);

  const parsed = JSON.parse(saved);
  assert.equal(parsed.version, 2);
  assert.equal(parsed.state.currentProjectId, seedState.currentProjectId);
});

test("no login = seed only, no persistence", () => {
  const hydrated = createHydratedState(seedState);
  assert.equal(hydrated.userName, seedState.userName);
  assert.equal(hydrated.checkin.isCheckedIn, false);
});
