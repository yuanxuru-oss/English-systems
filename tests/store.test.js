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
