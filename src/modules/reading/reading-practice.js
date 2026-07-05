import { createHighlighter } from "../../core/highlighter.js";
import { renderMCQSection, bindMCQSubmit } from "../shared/mcq-renderer.js";

export function renderReadingPractice(store, navigate) {
  store.actions.markFishStep("reading");
  const state = store.getState();
  const folder = store.getCurrentFolder();
  const readingModules = folder ? folder.modules.filter((item) => item.type === "reading") : [];

  if (readingModules.length === 0) {
    const el = document.createElement("div");
    el.className = "stack-layout";
    el.innerHTML = `<section class="paper-panel"><p class="label">Reading Practice</p><h3>暂无阅读模块</h3><p>去导入中心添加阅读内容。</p></section>`;
    return el;
  }

  const clozeModule = readingModules.find((m) => m.mode === "cloze") || readingModules[0];
  const compModule = readingModules.find((m) => m.mode === "comprehension");
  const activeMode = state.routePayload?.mode || "cloze";
  const module = activeMode === "comprehension" && compModule ? compModule : clozeModule;

  const el = document.createElement("div");
  el.className = "stack-layout";

  // Build content based on mode
  let bodyHTML = "";
  if (module.mode === "comprehension") {
    bodyHTML = renderMCQSection(module);
  } else {
    const highlightedPassage = store.actions.getHighlightedReading(module.id);
    bodyHTML = `
      <article class="reading-passage">${highlightedPassage}</article>
      <div class="question-list">
        ${module.items
          .map(
            (item, index) => `
          <label class="question-item">
            <span>${index + 1}. ${item.prompt}</span>
            <input data-item-id="${item.id}" value="${item.userAnswer || ""}" placeholder="输入答案" />
            ${
              item.isCorrect === null
                ? ""
                : `<small class="${item.isCorrect ? "text-correct" : "text-wrong"}">${
                    item.isCorrect ? "正确" : `正确答案：${item.answer}`
                  }</small>`
            }
          </label>
        `
          )
          .join("")}
      </div>
      <div class="hero-actions">
        <button class="primary-btn" data-action="submit">提交并批改</button>
      </div>
    `;
  }

  el.innerHTML = `
    <section class="paper-panel reading-layout">
      <div class="reading-header">
        <div>
          <p class="label">Reading Practice</p>
          <h3>${module.title}</h3>
        </div>
        <div class="import-tabs">
          ${compModule ? `<button class="import-tab ${activeMode === "comprehension" ? "active" : ""}" data-tab="comprehension">📖 阅读理解</button>` : ""}
          <button class="import-tab ${activeMode === "cloze" ? "active" : ""}" data-tab="cloze">📝 填空练习</button>
          <button class="secondary-btn" data-action="to-mistakes">去错题笔记</button>
        </div>
      </div>
      ${bodyHTML}
    </section>
  `;

  // Tab switching
  el.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      store.actions.setRoute("reading", { mode: tab.dataset.tab });
      navigate("reading", { mode: tab.dataset.tab });
    });
  });

  // Cloze submit
  const submitBtn = el.querySelector('[data-action="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const answers = {};
      el.querySelectorAll("[data-item-id]").forEach((input) => {
        answers[input.dataset.itemId] = input.value;
      });
      store.actions.submitReadingAnswers(module.id, answers);
    });
  }

  // MCQ submit
  bindMCQSubmit(el, module, (moduleId, answers) => {
    store.actions.submitReadingAnswers(moduleId, answers);
    navigate("reading", { mode: "comprehension" });
  });

  el.querySelector('[data-action="to-mistakes"]')?.addEventListener("click", () => navigate("mistakes"));

  return el;
}
