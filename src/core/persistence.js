import { evaluateCheckinStatus } from "./checkin.js";

export const STORAGE_KEY = "review-system:v2";
export const STORAGE_VERSION = 2;

const PERSISTED_FIELDS = [
  "projects",
  "currentProjectId",
  "currentFolderId",
  "mistakes",
  "flashcards",
  "studyLog",
  "userName",
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

    // Safety check: if projects exist but lack folder structure, fall back to seed
    const projects = baseState.projects;
    if (Array.isArray(projects) && projects.length > 0) {
      const hasFolders = projects.some((p) => Array.isArray(p.folders) && p.folders.length > 0);
      if (!hasFolders) {
        // Old data format — clear and use seed
        try { storage.removeItem(STORAGE_KEY); } catch {}
        const fresh = structuredClone(seedState);
        fresh.checkin = evaluateCheckinStatus(fresh.studyLog);
        return fresh;
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
