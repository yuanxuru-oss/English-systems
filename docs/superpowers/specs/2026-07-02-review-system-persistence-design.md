# English Review System Local Persistence Design

## Context

The project has already been refactored from multiple standalone HTML files into a unified frontend application centered on projects. The current app includes:

- A mixed-home dashboard
- Project overview
- Import center
- Reading practice
- Mistakes notebook
- Flashcards
- Check-in calendar

The current state flow is centralized in `src/core/store.js`, with initial data seeded from `src/data/seed.js`. The app currently works in-memory only, which means imported modules, reading results, mistakes, flashcards, and check-in progress are lost on refresh.

This design adds first-phase local persistence while preserving the existing modular frontend architecture and leaving room for future evolution into:

- An open-source website
- A Windows local desktop/EXE distribution

## Goals

- Preserve the current unified frontend architecture
- Keep the project-centered product model intact
- Persist meaningful user learning progress locally
- Preserve minimal UI continuity across refreshes
- Avoid persisting fragile temporary UI state
- Keep the persistence layer framework-agnostic and frontend-only
- Avoid choices that block future account sync, cloud sync, or desktop packaging

## Non-Goals

- No backend
- No real login system yet
- No cloud sync yet
- No IndexedDB in this phase unless `localStorage` proves insufficient
- No full “restore every transient UI detail exactly as-is” behavior
- No schema migration framework beyond lightweight versioning/guardrails

## User Decision Captured

For phase one, persistence should follow option 2:

- Persist learning progress data
- Persist necessary UI state
- Do not attempt full raw store restoration

Concretely, the app should remember the learner’s progress and allow them to resume from the last meaningful context, but should not restore unstable temporary workbench state such as unfinished import previews.

## Recommended Approach

Use a selective local persistence layer backed by `localStorage`.

This approach is recommended because it matches the current app scale, works in a plain browser with no backend, is easy to inspect during development, and is compatible with both future directions:

- As an open-source web app, it provides a simple no-backend default
- As a Windows EXE wrapper, it can continue to work in a local browser-runtime shell before a future upgrade to richer storage if needed

## Why Not the Alternatives

### Full Store Persistence

Persisting nearly the entire store would create brittle restore behavior. Temporary fields such as route payloads and import previews can become stale or invalid as module flows become more complex, especially once listening and intensive-training layers are added.

### Data-Only Persistence

Persisting only learning data but not route or current project would be simpler, but it would weaken the “personal review system” feeling. Users would lose continuity after refresh and always re-enter at the default home state.

### IndexedDB First

IndexedDB is more scalable, but it adds implementation overhead before it is justified. The current data model is still compact, and localStorage is sufficient for this phase.

## Architecture

Add a dedicated persistence module:

- `src/core/persistence.js`

Responsibilities:

- Read persisted state from localStorage
- Validate the stored shape at a lightweight level
- Merge saved values onto the default seed state
- Serialize only the approved subset of state
- Gracefully recover from malformed or outdated saved data

Keep persistence logic outside rendering modules and outside individual feature modules. `store.js` remains the single state authority; persistence should act as a storage adapter around it.

## Persisted State Scope

Persist these fields:

- `projects`
- `currentProjectId`
- `mistakes`
- `flashcards`
- `studyLog`
- `route`

Do not persist these fields:

- `importPreview`
- `routePayload`
- `checkin`

Rules:

- `checkin` should be recalculated from `studyLog` on app startup and after learning actions
- `routePayload` should reset to an empty object on hydration unless a future route explicitly needs resumable payload support
- `importPreview` should always start empty because it is temporary authoring state

## Hydration Strategy

At app startup:

1. Load `seedState`
2. Read persisted payload from localStorage
3. Validate its version and basic shape
4. Merge only allowed fields onto the seed state
5. Recompute derived state such as `checkin`
6. Create the store with the hydrated result

This ensures:

- Newly added seed fields still get defaults
- Missing saved fields do not break the app
- Derived state is always current for today’s date

## Save Strategy

Persist after meaningful state-changing actions, not on render.

Recommended trigger model:

- Every mutating action in `store.js` should end by calling a shared persistence sync method

This includes:

- route changes
- project selection
- reading submission
- mistake note edits
- mistake mastered toggles
- adding mistakes to flashcards
- flashcard mastery updates
- import preview application

This should not include:

- pure getters
- preview-only parsing unless future UX explicitly needs draft recovery

## Storage Format

Use a single storage key, for example:

- `review-system:v1`

Suggested payload shape:

```js
{
  version: 1,
  savedAt: "2026-07-02T10:00:00.000Z",
  state: {
    projects: [...],
    currentProjectId: "project-cet",
    mistakes: [...],
    flashcards: [...],
    studyLog: [...],
    route: "reading"
  }
}
```

Benefits:

- Easier debugging
- Easier invalidation later
- Easy upgrade path if schema changes

## Error Handling

If localStorage is unavailable, blocked, or contains invalid JSON:

- The app should continue with seed state
- The app should fail silently at runtime, optionally logging a warning for development

If the saved version is unsupported:

- Ignore the saved payload
- Fall back to seed state

If individual saved fields are malformed:

- Ignore those fields and retain defaults

The user experience should always prefer a working app over strict restore behavior.

## Store Changes

`src/core/store.js` should remain the source of truth, but it needs a small persistence-aware extension:

- accept optional persistence callbacks or adapter methods
- centralize save-after-mutation behavior
- avoid duplicating save calls in every UI module

Preferred pattern:

- `createStore(initialState, options = {})`
- `options.persist` is an optional function
- mutating actions call an internal `commit()` helper

Example intent:

```js
function commit() {
  options.persist?.(state);
}
```

Each mutating action updates state, refreshes derived state if needed, then calls `commit()`.

## App Bootstrap Changes

`src/app.js` should:

- import persistence helpers
- build hydrated initial state before calling `createStore`
- pass a persist callback into the store

This keeps bootstrap concerns in the app entry and keeps feature modules unchanged.

## Testing Design

Add focused tests for the persistence layer before implementation:

- hydrates allowed fields from saved payload
- ignores unsupported versions
- ignores malformed JSON
- does not persist temporary fields such as `importPreview`
- recomputes checkin from studyLog rather than trusting stale saved checkin
- persists route and current project selection

Also add one store-level behavioral test to verify:

- a mutating action results in persistence being called with the expected serialized subset

This phase does not require browser E2E testing, but the persistence module should be written so it can be tested with a mocked storage interface in Node tests.

## Compatibility With Future Open-Source Web Release

This design is compatible with a future public web app because:

- it requires no private infrastructure
- it keeps the app usable immediately after deployment
- it allows a future account system to layer on top of local-first behavior

Future migration path:

- keep local persistence as offline/cache behavior
- introduce account auth later
- sync projects and study progress to a backend when available

## Compatibility With Future Windows EXE Packaging

This design is also compatible with a Windows local desktop/EXE version because:

- the app remains a self-contained frontend
- localStorage works in common webview/electron-style packaging scenarios
- no persistence decisions here require a browser-only deployment model

If the desktop app later needs larger audio-heavy storage or export/import bundles, a second-phase storage abstraction can switch from localStorage to IndexedDB or a desktop-specific storage layer without rewriting feature modules.

## Implementation Boundaries

This change should not:

- collapse the codebase back into monolithic HTML
- move feature logic into `index.html`
- force the listening module to be implemented now
- introduce backend assumptions
- introduce UI redesign unrelated to persistence

## Recommended Next Step After This Design

Implement phase-one local persistence first, because it strengthens the current product direction immediately and supports all later work:

- richer import center
- listening module and intensive listening layer
- stronger mistake and flashcard loops
- future login/account entry point

Once persistence is stable, the next likely priority should be the listening module architecture, because it has the most product-specific rules and will benefit from having durable project progress already in place.
