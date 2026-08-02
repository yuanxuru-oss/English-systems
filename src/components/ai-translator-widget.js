const POSITION_KEY = "review-system:v2:ai-translator-position";

function getSelectionText() {
  const selected = globalThis.getSelection?.();
  return selected ? selected.toString().trim() : "";
}

function readSavedPosition() {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return { x: null, y: null };
    const parsed = JSON.parse(raw);
    return {
      x: Number.isFinite(parsed.x) ? parsed.x : null,
      y: Number.isFinite(parsed.y) ? parsed.y : null,
    };
  } catch {
    return { x: null, y: null };
  }
}

function savePosition(x, y) {
  try {
    localStorage.setItem(POSITION_KEY, JSON.stringify({ x, y }));
  } catch {}
}

function collectLocalEntries(state) {
  const entries = [];

  for (const card of state.flashcards || []) {
    entries.push({
      word: card.word,
      zh: card.zh || "待补充释义",
      pos: card.pos || "—",
      context: card.context || "",
      source: "闪卡词库",
    });
  }

  for (const project of state.projects || []) {
    for (const folder of project.folders || []) {
      for (const module of folder.modules || []) {
        if (module.type !== "vocabulary") continue;
        for (const item of module.vocabulary || []) {
          entries.push({
            word: item.word,
            zh: item.zh || "待补充释义",
            pos: item.pos || "—",
            context: item.context || "",
            source: module.title || "词汇模块",
          });
        }
      }
    }
  }

  return entries;
}

function findLocalMeaning(state, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const entries = collectLocalEntries(state);
  return entries.find((item) => item.word.toLowerCase() === normalized)
    || entries.find((item) => item.word.toLowerCase().includes(normalized));
}

function buildResult(state, query, apiReady) {
  if (!query.trim()) {
    return {
      title: "输入一个单词或短语",
      body: "你可以自己输入，也可以先在页面里选中文字，再点“填入选中内容”。",
    };
  }

  const local = findLocalMeaning(state, query);
  if (local) {
    return {
      title: `${local.word} · ${local.pos}`,
      body: `${local.zh}\n\n来源：${local.source}${local.context ? `\n例句：${local.context}` : ""}`,
    };
  }

  if (!apiReady) {
    return {
      title: "本地词库未命中",
      body: `“${query}” 目前不在你的本地词库中。\n\n你可以前往设置启用 AI 翻译，获得词义、例句和记忆提示。`,
    };
  }

  return {
    title: "AI 翻译服务已准备",
    body: `已识别：${query}\n\n翻译结果会显示在这里。`,
  };
}

function clampPosition(x, y, panel) {
  const width = panel.offsetWidth || 380;
  const height = panel.offsetHeight || 420;
  const maxX = Math.max(12, window.innerWidth - width - 12);
  const maxY = Math.max(12, window.innerHeight - height - 12);

  return {
    x: Math.min(Math.max(12, x), maxX),
    y: Math.min(Math.max(12, y), maxY),
  };
}

function applyPosition(panel, x, y) {
  const next = clampPosition(x, y, panel);
  panel.style.left = `${next.x}px`;
  panel.style.top = `${next.y}px`;
  panel.style.right = "auto";
  panel.style.bottom = "auto";
  savePosition(next.x, next.y);
}

export function syncAiTranslatorWidget(store, navigate) {
  const state = store.getState();
  const enabled = state.settings?.aiFloatingTranslateEnabled !== false;
  const apiReady = Boolean(state.settings?.aiApiKey);

  let toggle = document.querySelector(".ai-translator-toggle");
  let panel = document.querySelector(".ai-translator-floating");

  if (!enabled) {
    toggle?.remove();
    panel?.remove();
    return;
  }

  if (!toggle) {
    toggle = document.createElement("button");
    toggle.className = "ai-translator-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "AI 翻译器");
    document.body.appendChild(toggle);
  }

  if (!panel) {
    panel = document.createElement("section");
    panel.className = "ai-translator-floating paper-panel";
    panel.style.display = "none";
    panel.innerHTML = `
      <div class="ai-translator-dragbar" data-drag-handle>
        <div>
          <p class="label">AI 翻译</p>
          <h4>自由翻译器</h4>
        </div>
        <div class="ai-translator-head-actions">
          <button class="ai-translator-head-btn" type="button" data-action="fill-selection">填入选中</button>
          <button class="ai-translator-head-btn" type="button" data-action="minimize">收起</button>
        </div>
      </div>
      <div class="ai-translator-window">
        <label class="ai-translator-input-wrap">
          <span class="ai-translator-kicker">输入生词 / 短语</span>
          <input class="ai-translator-input" type="text" placeholder="例如：adversity / cognitive flexibility" />
        </label>
        <div class="hero-actions ai-translator-actions">
          <button class="primary-btn" type="button" data-action="lookup">查询翻译</button>
          <button class="secondary-btn" type="button" data-action="open-settings">AI 设置</button>
        </div>
        <div class="ai-translator-result-card">
          <div class="ai-translator-result-title" data-ai-title>输入一个单词或短语</div>
          <div class="ai-translator-result" data-ai-result>你可以自己输入，也可以先在页面里选中文字，再点“填入选中内容”。</div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  toggle.innerHTML = `
    <span class="ai-translator-toggle-icon">译</span>
    <span class="ai-translator-toggle-text">翻译器</span>
  `;
  toggle.title = "打开自由翻译浮窗";

  const input = panel.querySelector(".ai-translator-input");
  const titleEl = panel.querySelector("[data-ai-title]");
  const resultEl = panel.querySelector("[data-ai-result]");

  function renderLookup(query) {
    const result = buildResult(store.getState(), query, apiReady);
    titleEl.textContent = result.title;
    resultEl.textContent = result.body;
  }

  function openPanel(prefill = "") {
    panel.style.display = "grid";
    const saved = readSavedPosition();
    if (saved.x === null || saved.y === null) {
      applyPosition(panel, window.innerWidth - 410, window.innerHeight - 520);
    } else {
      applyPosition(panel, saved.x, saved.y);
    }

    const query = prefill || input.value.trim() || getSelectionText();
    if (query) input.value = query;
    renderLookup(input.value.trim());
    input.focus();
    input.select();
  }

  function closePanel() {
    panel.style.display = "none";
  }

  toggle.onclick = () => openPanel();

  panel.querySelector('[data-action="minimize"]').onclick = closePanel;
  panel.querySelector('[data-action="open-settings"]').onclick = () => {
    store.track("ai_floating_settings_opened", { route: state.route });
    navigate("settings");
  };
  panel.querySelector('[data-action="fill-selection"]').onclick = () => {
    const selected = getSelectionText();
    if (!selected) {
      renderLookup("");
      return;
    }
    input.value = selected;
    renderLookup(selected);
  };
  panel.querySelector('[data-action="lookup"]').onclick = () => {
    const query = input.value.trim();
    store.track("ai_floating_lookup_submitted", {
      route: state.route,
      query_length: query.length,
      ai_ready: apiReady,
    });
    renderLookup(query);
  };

  input.onkeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      panel.querySelector('[data-action="lookup"]').click();
    }
    if (event.key === "Escape") {
      closePanel();
    }
  };

  const handle = panel.querySelector("[data-drag-handle]");
  if (!handle.dataset.bound) {
    handle.dataset.bound = "true";
    handle.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      const rect = panel.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const move = (moveEvent) => {
        applyPosition(panel, moveEvent.clientX - offsetX, moveEvent.clientY - offsetY);
      };

      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
    });
  }

  if (!window.__aiTranslatorResizeBound) {
    window.__aiTranslatorResizeBound = true;
    window.addEventListener("resize", () => {
      const activePanel = document.querySelector(".ai-translator-floating");
      if (activePanel && activePanel.style.display !== "none") {
        const rect = activePanel.getBoundingClientRect();
        applyPosition(activePanel, rect.left, rect.top);
      }
    });
  }
}
