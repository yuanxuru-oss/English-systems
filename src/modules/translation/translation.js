import { evaluateCheckinStatus } from "../../core/checkin.js";

export function renderTranslation(store, navigate) {
  const state = store.getState();
  const folder = store.getCurrentFolder();
  const transModules = folder ? folder.modules.filter((item) => item.type === "translation") : [];

  if (transModules.length === 0) {
    const el = document.createElement("div");
    el.className = "stack-layout";
    el.innerHTML = `
      <section class="paper-panel">
        <p class="label">Translation</p>
        <h3>当前试卷暂无翻译练习</h3>
        <p>去导入中心为当前试卷添加翻译模块。</p>
      </section>
    `;
    return el;
  }

  const module = transModules[0];
  const allAnswered = module.items.every((item) => item.userAnswer.trim() !== "");

  const el = document.createElement("div");
  el.className = "stack-layout";
  el.innerHTML = `
    <section class="paper-panel translation-layout">
      <div class="reading-header">
        <div>
          <p class="label">Translation Practice</p>
          <h3>${module.title}</h3>
          <p>${module.summary}</p>
        </div>
      </div>
      <div class="translation-list">
        ${module.items
          .map(
            (item, index) => `
          <div class="translation-item">
            <div class="translation-source">
              <span class="translation-num">${index + 1}</span>
              <p>${item.source}</p>
            </div>
            <textarea
              class="translation-input"
              data-item-id="${item.id}"
              placeholder="输入你的翻译..."
              rows="3"
            >${item.userAnswer || ""}</textarea>
            ${
              item.userAnswer
                ? `
            <details class="translation-ref">
              <summary>参考译文</summary>
              <p>${item.reference}</p>
            </details>`
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
      <div class="hero-actions">
        ${!allAnswered ? '<button class="primary-btn" data-action="save">保存翻译</button>' : '<button class="secondary-btn" data-action="reset">重新翻译</button>'}
      </div>
    </section>
  `;

  const saveBtn = el.querySelector('[data-action="save"]');
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      el.querySelectorAll("[data-item-id]").forEach((input) => {
        const item = module.items.find((i) => i.id === input.dataset.itemId);
        if (item) item.userAnswer = input.value;
      });
      state.studyLog.unshift({
        id: `log-${Date.now()}`,
        type: "translation",
        projectId: state.currentProjectId,
        date: new Date().toISOString(),
        title: module.title,
      });
      state.checkin = evaluateCheckinStatus(state.studyLog);
      navigate("translation");
    });
  }

  const resetBtn = el.querySelector('[data-action="reset"]');
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      module.items.forEach((item) => (item.userAnswer = ""));
      navigate("translation");
    });
  }

  return el;
}
