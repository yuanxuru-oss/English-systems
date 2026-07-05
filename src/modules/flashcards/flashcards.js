export function renderFlashcards(store, navigate) {
  store.actions.markFishStep("flashcards");
  const state = store.getState();
  const current = state.flashcards.find((item) => !item.mastered) ?? state.flashcards[0];
  const el = document.createElement("div");
  el.className = "stack-layout";

  if (!current) {
    el.innerHTML = `
      <section class="paper-panel flashcard-layout">
        <p class="label">Flashcards</p>
        <h3>当前还没有闪卡</h3>
        <p>你可以从错题笔记里把重点词加入闪卡，或者后续从导入内容里自动生成词库。</p>
      </section>
    `;
    return el;
  }

  el.innerHTML = `
    <section class="paper-panel flashcard-layout">
      <p class="label">Flashcards</p>
      <h3>重点词与错题词汇流入同一个闪卡池</h3>
      <div class="flashcard-display">
        <h4>${current.word}</h4>
        <p>${current.pos} · ${current.zh}</p>
        <div class="context-box">${current.context}</div>
      </div>
      <div class="hero-actions">
        <button class="secondary-btn" data-action="again">还不熟</button>
        <button class="primary-btn" data-action="known">已掌握</button>
      </div>
    </section>
  `;

  el.querySelector('[data-action="again"]').addEventListener("click", () => {
    store.actions.markFlashcard(current.id, false);
    navigate("flashcards");
  });
  el.querySelector('[data-action="known"]').addEventListener("click", () => {
    store.actions.markFlashcard(current.id, true);
    navigate("flashcards");
  });

  return el;
}
