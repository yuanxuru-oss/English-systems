import test from "node:test";
import assert from "node:assert/strict";
import {
  getOrCreateAnalyticsIdentity,
  normalizeEventProperties,
} from "../src/core/analytics.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

test("getOrCreateAnalyticsIdentity returns a stable generated id for the same user", () => {
  const storage = createMemoryStorage();

  const first = getOrCreateAnalyticsIdentity("alice", storage);
  const second = getOrCreateAnalyticsIdentity("alice", storage);

  assert.equal(first, second);
  assert.match(first, /^anon_[a-z0-9]+$/);
});

test("normalizeEventProperties strips undefined values and keeps serializable primitives", () => {
  const normalized = normalizeEventProperties({
    route: "reading",
    module_type: "reading",
    accuracy: 0.67,
    ignored: undefined,
    nested: { unsafe: true },
  });

  assert.deepEqual(normalized, {
    route: "reading",
    module_type: "reading",
    accuracy: 0.67,
  });
});
