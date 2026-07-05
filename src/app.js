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
import { renderObsidianPanel, bindObsidianPanel } from "./modules/obsidian/obsidian-bridge.js";
import { seedState } from "./data/seed.js";

function renderObsidian(store, navigate) {
  const el = document.createElement("div");
  el.className = "page-grid";
  el.innerHTML = renderObsidianPanel(store, navigate);
  bindObsidianPanel(el, store, navigate);
  return el;
}

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
  obsidian: renderObsidian,
};

const app = document.getElementById("app");
let store;
let navigate;

// ── Login screen ──

function renderLoginScreen(onLogin) {
  const el = document.createElement("div");
  el.className = "login-gate";
  el.innerHTML = `
    <div class="login-gate-card paper-panel">
      <div class="login-gate-brand">
        <p class="label">REVIEW ATELIER</p>
        <h1>鱼骨头英语复习系统</h1>
        <p class="login-gate-slogan">把英语啃的只剩鱼骨头。</p>
      </div>
      <hr class="sketch-divider" />
      <div class="login-gate-form">
        <p class="label">输入你的名字，进入学习空间</p>
        <p style="font-size:0.82rem;color:var(--muted)">数据保存在你的浏览器中，不会上传。</p>
        <input type="text" class="login-gate-input" placeholder="你的名字…" maxlength="20" autofocus />
        <button class="primary-btn login-gate-btn">进入</button>
      </div>
    </div>
  `;
  const input = el.querySelector(".login-gate-input");
  const btn = el.querySelector(".login-gate-btn");
  const submit = () => {
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    onLogin(name);
  };
  btn.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  return el;
}

// ── Init ──

function bootstrap(userName) {
  const seed = structuredClone(seedState);
  if (userName) seed.userName = userName;
  const initialState = createHydratedState(seed);
  store = createStore(initialState, { persist(s) { persistState(s); } });

  // Apply theme
  const theme = initialState.settings?.colorTheme || "default";
  document.documentElement.setAttribute("data-theme", theme);

  function renderShell(contentNode) {
    const shell = createAppShell(store, navigate);
    shell.querySelector("[data-shell-content]").appendChild(contentNode);
    app.replaceChildren(shell);
  }

  navigate = (route, payload = {}) => {
    store.actions.setRoute(route, payload);
    const render = routes[route];
    if (render) {
      renderShell(render(store, navigate));
      return;
    }
    const state = store.getState();
    if (!state.currentProjectId) {
      store.actions.selectProject(state.projects[0]?.id ?? null);
    }
    renderShell(renderDashboard(store, navigate));
  };

  initQuickNote();

  try {
    navigate("dashboard");
  } catch (e) {
    console.error("Init failed:", e);
    try { globalThis.localStorage?.removeItem("review-system:v2:" + userName); } catch {}
    const fresh = createHydratedState(seed);
    store = createStore(fresh, { persist(s) { persistState(s); } });
    const shell = createAppShell(store, navigate);
    shell.querySelector("[data-shell-content]").appendChild(renderDashboard(store, navigate));
    app.replaceChildren(shell);
  }
}

// ── Logout handler (called from profile) ──

window.__logout = () => {
  // Remove any stored key with old format too
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("review-system:v2:"));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {}
  app.replaceChildren(renderLoginScreen(bootstrap));
};

// ── Start ──

// Check if there's a saved userName from old format (pre-login-gate migration)
let savedName = null;
try {
  // Try old format first
  const oldRaw = localStorage.getItem("review-system:v2");
  if (oldRaw) {
    const old = JSON.parse(oldRaw);
    if (old.state?.userName) {
      savedName = old.state.userName;
    }
  }
} catch {}

// If no old-format user, check any user-specific keys
if (!savedName) {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("review-system:v2:"));
    if (keys.length > 0) {
      savedName = keys[0].replace("review-system:v2:", "");
    }
  } catch {}
}

if (savedName) {
  bootstrap(savedName);
} else {
  app.replaceChildren(renderLoginScreen(bootstrap));
}
