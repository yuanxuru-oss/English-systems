import { renderMCQSection, bindMCQSubmit } from "../shared/mcq-renderer.js";
import { createAudioPlayer } from "../../components/audio-player.js";

export function renderListeningPractice(store, navigate) {
  const state = store.getState();
  const folder = store.getCurrentFolder();
  const listeningModules = folder ? folder.modules.filter((item) => item.type === "listening") : [];

  if (listeningModules.length === 0) {
    const el = document.createElement("div");
    el.className = "stack-layout";
    el.innerHTML = `<section class="paper-panel"><p class="label">Listening Practice</p><h3>暂无听力模块</h3><p>去导入中心添加听力内容。</p></section>`;
    return el;
  }

  const dictationModule = listeningModules.find((m) => m.mode === "dictation") || listeningModules[0];
  const compModule = listeningModules.find((m) => m.mode === "comprehension");
  const activeMode = state.routePayload?.mode || (compModule ? "comprehension" : "dictation");
  const module = activeMode === "comprehension" && compModule ? compModule : dictationModule;

  const el = document.createElement("div");
  el.className = "stack-layout";

  let bodyHTML = "";
  let isCETComprehension = false;

  if (module.mode === "comprehension") {
    // CET-style: use the cet-listening layout
    isCETComprehension = true;
    bodyHTML = `
      <div class="audio-player-container" data-audio-player-anchor></div>
      ${renderMCQSection(module, "cet-listening")}
    `;
  } else {
    // Dictation / 精听训练
    const allAnswered = module.items.every((item) => item.isCorrect !== null);
    bodyHTML = `
      <p class="listening-hint">🎧 精听训练模式：先播放音频，在空格处填入你听到的单词。提交后进入精听层，查看重点词汇高亮和错题挖空复习。</p>
      <article class="listening-transcript">
        <p>${module.transcript}</p>
      </article>
      <div class="question-list">
        ${module.items
          .map(
            (item, index) => `
          <label class="question-item">
            <span>${index + 1}. ${item.prompt}</span>
            <input data-item-id="${item.id}" value="${item.userAnswer || ""}" placeholder="输入听到的单词" />
            ${
              item.isCorrect === null
                ? ""
                : `<small class="${item.isCorrect ? "text-correct" : "text-wrong"}">${
                    item.isCorrect ? "✓ 正确" : `✗ 正确答案：${item.answer}`
                  }</small>`
            }
          </label>
        `
          )
          .join("")}
      </div>
      <div class="hero-actions">
        <button class="primary-btn" data-action="submit">提交并进入精听训练</button>
        ${allAnswered ? '<button class="secondary-btn" data-action="intensive">查看精听训练层</button>' : ""}
      </div>
    `;
  }

  el.innerHTML = `
    <section class="paper-panel ${isCETComprehension ? "cet-listening-layout" : "listening-layout"}">
      <div class="reading-header">
        <div>
          <p class="label">听 力 练 习</p>
          <h3>${module.title}</h3>
        </div>
        <div class="import-tabs">
          ${compModule ? `<button class="import-tab ${activeMode === "comprehension" ? "active" : ""}" data-tab="comprehension">🔊 听力原题</button>` : ""}
          <button class="import-tab ${activeMode === "dictation" ? "active" : ""}" data-tab="dictation">🎧 精听训练</button>
        </div>
      </div>
      ${bodyHTML}
    </section>
  `;

  // Audio player for comprehension mode
  if (isCETComprehension) {
    const audioAnchor = el.querySelector("[data-audio-player-anchor]");
    if (audioAnchor) {
      const audioPlayer = createAudioPlayer({
        duration: 150,
        label: "🔊 播放听力音频 · Conversation 1 & 2",
        audioSrc: module.audioData || null,
        onEnded: () => {},
      });
      audioAnchor.appendChild(audioPlayer);
    }
  }

  // Tab switching
  el.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.tab;
      store.actions.setRoute("listening", { mode });
      navigate("listening", { mode });
    });
  });

  // Dictation submit
  const submitBtn = el.querySelector('[data-action="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const answers = {};
      el.querySelectorAll("[data-item-id]").forEach((input) => {
        answers[input.dataset.itemId] = input.value;
      });
      store.actions.submitListeningAnswers(module.id, answers);
      navigate("listening", { mode: "dictation" });
    });
  }

  // MCQ submit
  bindMCQSubmit(el, module, (moduleId, answers) => {
    store.actions.submitListeningAnswers(moduleId, answers);
    navigate("listening", { mode: "comprehension" });
  });

  // Intensive layer link
  el.querySelector('[data-action="intensive"]')?.addEventListener("click", () => {
    navigate("listening-intensive", { moduleId: module.id });
  });

  return el;
}
