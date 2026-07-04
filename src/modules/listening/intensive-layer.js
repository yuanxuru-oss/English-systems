import { createHighlighter } from "../../core/highlighter.js";

export function renderIntensiveLayer(store, navigate) {
  const state = store.getState();
  const moduleId = state.routePayload?.moduleId;
  const module = store.getModuleById(moduleId);

  if (!module) {
    const el = document.createElement("div");
    el.className = "stack-layout";
    el.innerHTML = `
      <section class="paper-panel">
        <p class="label">Intensive Listening</p>
        <h3>未找到对应的听力模块</h3>
        <p>请先从听力练习页进入精听训练层。</p>
        <div class="hero-actions">
          <button class="secondary-btn" data-action="back">返回听力练习</button>
        </div>
      </section>
    `;
    el.querySelector('[data-action="back"]').addEventListener("click", () => navigate("listening"));
    return el;
  }

  const highlight = createHighlighter(state.cetVocabulary, state.projectKeywords);
  const highlightedTranscript = highlight(module.transcript);

  const wrongItems = module.items.filter((item) => item.isCorrect === false);
  const correctCount = module.items.filter((item) => item.isCorrect === true).length;

  const el = document.createElement("div");
  el.className = "stack-layout";

  el.innerHTML = `
    <section class="paper-panel intensive-layout">
      <div class="reading-header">
        <div>
          <p class="label">🎯 精听训练层</p>
          <h3>${module.title}</h3>
          <p>重点词汇已高亮，回顾原文并对照你的答案。</p>
        </div>
        <span class="count-badge">${correctCount}/${module.items.length} 正确</span>
      </div>

      <div class="intensive-panels">
        <article class="intensive-transcript">
          <p class="label">原文 · 词汇高亮</p>
          <div class="reading-passage">${highlightedTranscript}</div>
        </article>

        <article class="intensive-review">
          <p class="label">你的答案回顾</p>
          <div class="intensive-answers">
            ${module.items
              .map(
                (item) => `
              <div class="intensive-answer-row ${item.isCorrect ? "correct" : "wrong"}">
                <span class="gap-label">${item.prompt}</span>
                <span class="gap-arrow">→</span>
                <span class="gap-value">${item.userAnswer || "（未填写）"}</span>
                ${!item.isCorrect ? `<span class="gap-correct">(${item.answer})</span>` : ""}
                <span class="gap-mark">${item.isCorrect ? "✓" : "✗"}</span>
              </div>
            `
              )
              .join("")}
          </div>

          ${
            wrongItems.length > 0
              ? `
          <div class="intensive-cloze">
            <p class="label">错题挖空复习</p>
            <div class="cloze-passage">
              ${highlightCloze(module.transcript, wrongItems, highlight)}
            </div>
          </div>`
              : `<p class="text-correct intensive-all-correct">🎉 全部正确，太棒了！</p>`
          }
        </article>
      </div>

      <div class="hero-actions">
        <button class="secondary-btn" data-action="back">返回听力练习</button>
        <button class="primary-btn" data-action="retry">重新练习</button>
      </div>
    </section>
  `;

  el.querySelector('[data-action="back"]').addEventListener("click", () => navigate("listening"));
  el.querySelector('[data-action="retry"]').addEventListener("click", () => {
    store.actions.resetModuleAnswers(moduleId);
    navigate("listening");
  });

  return el;
}

function highlightCloze(transcript, wrongItems, highlightFn) {
  let result = highlightFn(transcript);
  const sorted = [...wrongItems].sort((a, b) => b.answer.length - a.answer.length);

  for (const item of sorted) {
    const escaped = item.answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, `<span class="cloze-blank">${item.answer}</span>`);
  }

  return result;
}
