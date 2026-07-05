export function renderMistakes(store, navigate) {
  store.actions.markFishStep("mistakes");
  const state = store.getState();
  const el = document.createElement("div");
  el.className = "stack-layout";

  if (state.mistakes.length === 0) {
    el.innerHTML = `
      <section class="paper-panel">
        <p class="label">Mistake Notes</p>
        <h3>目前还没有错题记录</h3>
        <p>先去做一轮阅读练习，提交后这里会自动生成错题卡片，并支持笔记、掌握状态和加入闪卡。</p>
        <div class="hero-actions">
          <button class="primary-btn" data-action="go-reading">去做阅读练习</button>
        </div>
      </section>
    `;

    el.querySelector('[data-action="go-reading"]').addEventListener("click", () => navigate("reading"));
    return el;
  }

  el.innerHTML = `
    <section class="paper-panel">
      <p class="label">Mistake Notes</p>
      <h3>错题内容、错误次数、掌握状态与复盘动作集中在这里</h3>
      <div class="mistake-list">
        ${state.mistakes
          .map(
            (item) => `
          <article class="mistake-card" data-mistake-id="${item.id}">
            <div class="mistake-head">
              <div>
                <h4>${item.answer}</h4>
                <p>${item.prompt}</p>
              </div>
              <span class="count-badge">错 ${item.errorCount} 次</span>
            </div>
            <p class="status-line">状态：${item.mastered ? "已掌握" : "复习中"}</p>
            <textarea data-note-input>${item.note}</textarea>
            <div class="mistake-actions">
              <button class="secondary-btn" data-action="save-note">保存笔记</button>
              <button class="secondary-btn" data-action="toggle-mastered">${item.mastered ? "标记未掌握" : "标记已掌握"}</button>
              <button class="primary-btn" data-action="add-flashcard">加入闪卡</button>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;

  el.querySelectorAll(".mistake-card").forEach((card) => {
    const id = card.dataset.mistakeId;
    const input = card.querySelector("[data-note-input]");

    card.querySelector('[data-action="save-note"]').addEventListener("click", () => {
      store.actions.addMistakeNote(id, input.value);
    });

    card.querySelector('[data-action="toggle-mastered"]').addEventListener("click", () => {
      store.actions.toggleMistakeMastered(id);
      navigate("mistakes");
    });

    card.querySelector('[data-action="add-flashcard"]').addEventListener("click", () => {
      store.actions.addMistakeToFlashcards(id);
      navigate("flashcards");
    });
  });

  return el;
}
