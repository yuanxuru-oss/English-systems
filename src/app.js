import { createStore } from "./core/store.js";
import { createHydratedState, persistState } from "./core/persistence.js";
import { createAppShell } from "./components/layout/app-shell.js";
import { initQuickNote } from "./components/quick-note.js";
import { renderDashboard } from "./modules/dashboard/dashboard.js";
import { renderProject } from "./modules/project/project.js";
import { renderImportCenter } from "./modules/import/import-center.js";
import { renderReadingPractice } from "./modules/reading/reading-practice.js";
import { renderMistakes } from "./modules/mistakes/mistakes.js";
import { renderFlashcards } from "./modules/flashcards/flashcards.js";
import { renderCheckin } from "./modules/checkin/checkin.js";
import { renderListeningPractice } from "./modules/listening/listening-practice.js";
import { renderIntensiveLayer } from "./modules/listening/intensive-layer.js";
import { renderProfile } from "./modules/profile/profile.js";
import { renderTranslation } from "./modules/translation/translation.js";
import { renderVocabulary } from "./modules/vocabulary/vocabulary.js";
import { renderSettings } from "./modules/settings/settings.js";
import { seedState } from "./data/seed.js";

const routes = {
  project: renderProject,
  import: renderImportCenter,
  reading: renderReadingPractice,
  mistakes: renderMistakes,
  flashcards: renderFlashcards,
  checkin: renderCheckin,
  listening: renderListeningPractice,
  "listening-intensive": renderIntensiveLayer,
  profile: renderProfile,
  translation: renderTranslation,
  vocabulary: renderVocabulary,
  settings: renderSettings,
};

const initialState = createHydratedState(seedState);
const store = createStore(initialState, {
  persist(state) {
    persistState(state);
  },
});
const app = document.getElementById("app");

function renderShell(contentNode) {
  const shell = createAppShell(store, navigate);
  shell.querySelector("[data-shell-content]").appendChild(contentNode);
  app.replaceChildren(shell);
}

function navigate(route, payload = {}) {
  store.actions.setRoute(route, payload);

  const render = routes[route];
  if (render) {
    renderShell(render(store, navigate));
    return;
  }

  // fallback: dashboard
  const state = store.getState();
  if (!state.currentProjectId) {
    store.actions.selectProject(state.projects[0]?.id ?? null);
  }
  renderShell(renderDashboard(store, navigate));
}

try {
  navigate("dashboard");
} catch (e) {
  console.error("Init failed, clearing storage and retrying:", e);
  try { globalThis.localStorage?.removeItem("review-system:v2"); } catch {}
  try { globalThis.localStorage?.removeItem("review-system:v1"); } catch {}
  const fresh = createHydratedState(seedState);
  const store2 = createStore(fresh, { persist(s) { persistState(s); } });
  const dash = renderDashboard(store2, (route, payload) => {
    store2.actions.setRoute(route, payload);
    const shell2 = createAppShell(store2, () => {});
    const renderFn = routes[route];
    if (renderFn) {
      shell2.querySelector("[data-shell-content]").appendChild(renderFn(store2, () => {}));
    }
    app.replaceChildren(shell2);
  });
  const shell2 = createAppShell(store2, () => {});
  shell2.querySelector("[data-shell-content]").appendChild(dash);
  app.replaceChildren(shell2);
}

// Initialize quick-note overlay after app is mounted
initQuickNote();

// Apply saved color theme on init
const theme = initialState.settings?.colorTheme || "default";
document.documentElement.setAttribute("data-theme", theme);
