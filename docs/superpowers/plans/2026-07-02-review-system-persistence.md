# Review System Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-phase local persistence to the unified English review frontend so study progress and minimal UI continuity survive refreshes.

**Architecture:** Add a focused `src/core/persistence.js` adapter around `localStorage`, hydrate persisted state onto `seedState` during app bootstrap, and wire store mutations to persist only the approved state subset. Keep `checkin` derived from `studyLog` instead of trusting stored derived data.

**Tech Stack:** Vanilla ES modules, browser `localStorage`, Node built-in test runner, `node:assert/strict`

---

### Task 1: Add persistence module tests first

**Files:**
- Create: `tests/persistence.test.js`
- Test: `tests/persistence.test.js`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createHydratedState, serializePersistedState } from "../src/core/persistence.js";
import { seedState } from "../src/data/seed.js";

function createMemoryStorage(initialValue = null) {
  const map = new Map();
  if (initialValue !== null) {
    map.set("review-system:v1", initialValue);
  }

  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

test("serializePersistedState stores only the approved subset", () => {
  const serialized = serializePersistedState({
    ...structuredClone(seedState),
    route: "reading",
    routePayload: { moduleId: "module-reading-1" },
    importPreview: { id: "preview-1" },
  });

  const parsed = JSON.parse(serialized);

  assert.equal(parsed.version, 1);
  assert.equal(parsed.state.route, "reading");
  assert.ok("projects" in parsed.state);
  assert.ok(!("routePayload" in parsed.state));
  assert.ok(!("importPreview" in parsed.state));
  assert.ok(!("checkin" in parsed.state));
});

test("createHydratedState merges allowed fields and recomputes checkin", () => {
  const payload = JSON.stringify({
    version: 1,
    savedAt: "2026-07-02T10:00:00.000Z",
    state: {
      route: "flashcards",
      currentProjectId: "project-cet",
      studyLog: [
        {
          id: "log-1",
          type: "reading-practice",
          moduleId: "module-reading-1",
          projectId: "project-cet",
          date: new Date().toISOString(),
          title: "Reading",
        },
      ],
      flashcards: [],
      mistakes: [],
      projects: seedState.projects,
      checkin: {
        today: "1999-01-01",
        isCheckedIn: false,
        completedActions: [],
      },
    },
  });

  const hydrated = createHydratedState(seedState, createMemoryStorage(payload));

  assert.equal(hydrated.route, "flashcards");
  assert.equal(hydrated.importPreview, null);
  assert.equal(hydrated.routePayload && Object.keys(hydrated.routePayload).length, 0);
  assert.equal(hydrated.checkin.isCheckedIn, true);
  assert.notEqual(hydrated.checkin.today, "1999-01-01");
});

test("createHydratedState falls back to seedState on malformed JSON", () => {
  const hydrated = createHydratedState(seedState, createMemoryStorage("{bad json"));

  assert.deepEqual(hydrated.projects, seedState.projects);
  assert.equal(hydrated.route, seedState.route);
});

test("createHydratedState ignores unsupported versions", () => {
  const payload = JSON.stringify({
    version: 999,
    state: {
      route: "mistakes",
    },
  });

  const hydrated = createHydratedState(seedState, createMemoryStorage(payload));

  assert.equal(hydrated.route, seedState.route);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/persistence.test.js`  
Expected: FAIL because `../src/core/persistence.js` does not exist yet or required exports are missing.

- [ ] **Step 3: Write minimal implementation**

Create `src/core/persistence.js` with this first-pass implementation:

```js
import { evaluateCheckinStatus } from "./checkin.js";

export const STORAGE_KEY = "review-system:v1";
export const STORAGE_VERSION = 1;

const PERSISTED_FIELDS = [
  "projects",
  "currentProjectId",
  "mistakes",
  "flashcards",
  "studyLog",
  "route",
];

function pickPersistedState(state) {
  return PERSISTED_FIELDS.reduce((result, field) => {
    result[field] = structuredClone(state[field]);
    return result;
  }, {});
}

export function serializePersistedState(state) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    state: pickPersistedState(state),
  });
}

export function createHydratedState(seedState, storage = globalThis.localStorage) {
  const baseState = structuredClone(seedState);

  if (!storage || typeof storage.getItem !== "function") {
    baseState.checkin = evaluateCheckinStatus(baseState.studyLog);
    return baseState;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      baseState.checkin = evaluateCheckinStatus(baseState.studyLog);
      return baseState;
    }

    const parsed = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION || !parsed.state || typeof parsed.state !== "object") {
      baseState.checkin = evaluateCheckinStatus(baseState.studyLog);
      return baseState;
    }

    for (const field of PERSISTED_FIELDS) {
      if (field in parsed.state) {
        baseState[field] = structuredClone(parsed.state[field]);
      }
    }
  } catch {
    return {
      ...baseState,
      checkin: evaluateCheckinStatus(baseState.studyLog),
    };
  }

  return {
    ...baseState,
    importPreview: null,
    routePayload: {},
    checkin: evaluateCheckinStatus(baseState.studyLog),
  };
}

export function persistState(state, storage = globalThis.localStorage) {
  if (!storage || typeof storage.setItem !== "function") {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, serializePersistedState(state));
  } catch {}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/persistence.test.js`  
Expected: PASS with 4 passing tests and 0 failures.

- [ ] **Step 5: Commit**

```bash
git add tests/persistence.test.js src/core/persistence.js
git commit -m "test: add persistence adapter coverage"
```

### Task 2: Add store-level persistence callback coverage

**Files:**
- Create: `tests/store.test.js`
- Test: `tests/store.test.js`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/core/store.js";
import { seedState } from "../src/data/seed.js";

test("createStore persists after mutating actions using the latest state", () => {
  const snapshots = [];
  const store = createStore(seedState, {
    persist(nextState) {
      snapshots.push(structuredClone(nextState));
    },
  });

  store.actions.setRoute("reading");
  store.actions.selectProject("project-cet");

  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[0].route, "reading");
  assert.equal(snapshots[1].currentProjectId, "project-cet");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/store.test.js`  
Expected: FAIL because `createStore` currently ignores the persistence callback argument.

- [ ] **Step 3: Write minimal implementation**

Update `src/core/store.js` so `createStore` accepts an optional second parameter and commits after mutating actions:

```js
export function createStore(initialState, options = {}) {
  let state = structuredClone(initialState);

  function commit() {
    options.persist?.(state);
  }

  const actions = {
    setRoute(route, payload = {}) {
      state.route = route;
      state.routePayload = payload;
      commit();
    },
    selectProject(projectId) {
      state.currentProjectId = projectId;
      commit();
    },
    // keep existing logic in other mutating actions, then call commit()
  };

  return {
    getState() {
      return state;
    },
    actions,
  };
}
```

Then append `commit()` to these existing mutating actions after state updates:

- `submitReadingAnswers`
- `addMistakeNote`
- `toggleMistakeMastered`
- `addMistakeToFlashcards`
- `markFlashcard`
- `importTemplateBlock`
- `applyImportPreview`
- `refreshCheckin`

Do not call `commit()` from `getHighlightedReading`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/store.test.js`  
Expected: PASS with 1 passing test and 0 failures.

- [ ] **Step 5: Commit**

```bash
git add tests/store.test.js src/core/store.js
git commit -m "feat: wire persistence commits through store actions"
```

### Task 3: Hydrate app state and persist through the browser entrypoint

**Files:**
- Modify: `src/app.js`
- Test: `tests/persistence.test.js`
- Test: `tests/store.test.js`

- [ ] **Step 1: Write the failing test**

Extend `tests/persistence.test.js` with a test for the adapter write path:

```js
test("persistState writes the serialized payload under the storage key", () => {
  const storage = createMemoryStorage();
  persistState(seedState, storage);

  const saved = storage.getItem("review-system:v1");
  assert.ok(saved);

  const parsed = JSON.parse(saved);
  assert.equal(parsed.version, 1);
  assert.equal(parsed.state.currentProjectId, seedState.currentProjectId);
});
```

Make sure the imports at the top include `persistState`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/persistence.test.js`  
Expected: FAIL because the new test references `persistState` before the implementation and/or because the current adapter shape is incomplete.

- [ ] **Step 3: Write minimal implementation**

Update `src/app.js` to hydrate initial state and pass the persistence callback:

```js
import { createStore } from "./core/store.js";
import { createHydratedState, persistState } from "./core/persistence.js";
import { createAppShell } from "./components/layout/app-shell.js";
import { renderDashboard } from "./modules/dashboard/dashboard.js";
import { renderProject } from "./modules/project/project.js";
import { renderImportCenter } from "./modules/import/import-center.js";
import { renderReadingPractice } from "./modules/reading/reading-practice.js";
import { renderMistakes } from "./modules/mistakes/mistakes.js";
import { renderFlashcards } from "./modules/flashcards/flashcards.js";
import { renderCheckin } from "./modules/checkin/checkin.js";
import { seedState } from "./data/seed.js";

const initialState = createHydratedState(seedState);
const store = createStore(initialState, {
  persist(state) {
    persistState(state);
  },
});
const app = document.getElementById("app");
```

Keep the rest of the route rendering flow unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/persistence.test.js tests/store.test.js`  
Expected: PASS with all persistence and store tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app.js tests/persistence.test.js
git commit -m "feat: hydrate and persist review system state"
```

### Task 4: Run the full regression suite and verify behavior

**Files:**
- Test: `tests/parser.test.js`
- Test: `tests/highlighter.test.js`
- Test: `tests/persistence.test.js`
- Test: `tests/store.test.js`

- [ ] **Step 1: Run the full targeted test suite**

Run:

```bash
node --test tests/parser.test.js tests/highlighter.test.js tests/persistence.test.js tests/store.test.js
```

Expected:

- 4 test files run
- 0 failures
- persistence tests pass
- existing parser/highlighter tests remain green

- [ ] **Step 2: Perform a manual browser verification**

Open `index.html` in the local browser and verify this exact flow:

1. Go to import center and generate/apply a template import.
2. Go to reading and submit at least one wrong answer.
3. Confirm the mistake appears in mistakes.
4. Add the mistake to flashcards.
5. Confirm today shows checked-in state.
6. Refresh the page.
7. Confirm current route is restored.
8. Confirm imported module, mistakes, flashcards, and check-in state remain.
9. Confirm import preview does not come back after refresh unless recreated.

- [ ] **Step 3: Commit**

```bash
git add src/app.js src/core/persistence.js src/core/store.js tests/persistence.test.js tests/store.test.js
git commit -m "chore: verify first-phase local persistence"
```

## Self-Review

Spec coverage check:

- Persist approved fields only: covered in Task 1 serialization tests and adapter implementation.
- Recompute checkin from studyLog: covered in Task 1 hydration test and adapter implementation.
- Do not persist importPreview/routePayload/checkin: covered in Task 1 tests and serialization rules.
- Store-level save-after-mutation behavior: covered in Task 2.
- App bootstrap hydration and persistence callback wiring: covered in Task 3.
- Preserve modular architecture and avoid HTML regression: maintained by only touching `src/core` and `src/app.js`.
- Leave room for future website/EXE packaging: preserved by browser-native adapter boundary in Task 1 and Task 3.

Placeholder scan:

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Every test and command is concrete.

Type consistency:

- The plan uses `createHydratedState`, `serializePersistedState`, and `persistState` consistently.
- Persisted field names match the approved spec and current store shape.
