export function renderVocabulary(store, navigate) {
  store.actions.markFishStep("vocabulary");
  const folder = store.getCurrentFolder();
  const vocabModules = folder ? folder.modules.filter((item) => item.type === "vocabulary") : [];

  const el = document.createElement("div");
  el.className = "stack-layout";

  if (vocabModules.length === 0) {
    el.innerHTML = `
      <section class="paper-panel">
        <p class="label">Vocabulary</p>
        <h3>当前试卷暂无词汇表</h3>
        <p>去导入中心为当前试卷添加词汇模块，或从已有词汇模块中复习。</p>
      </section>
    `;
    return el;
  }

  const allWords = vocabModules.flatMap((mod) => mod.vocabulary || []);
  const mastered = allWords.filter((w) => w.mastered).length;

  el.innerHTML = `
    <section class="paper-panel">
      <div class="reading-header">
        <div>
          <p class="label">Vocabulary · ${folder.title}</p>
          <h3>词汇表</h3>
          <p>${allWords.length} 个单词 · ${mastered} 已掌握</p>
        </div>
        <div class="hero-actions">
          <button class="primary-btn" data-action="add-all-flashcards">全部加入闪卡</button>
        </div>
      </div>
      <div class="vocab-list">
        ${allWords
          .map(
            (word, index) => `
          <div class="vocab-card ${word.mastered ? "vocab-mastered" : ""}">
            <div class="vocab-head">
              <span class="vocab-num">${index + 1}</span>
              <div>
                <h4>${word.word}</h4>
                <span class="vocab-pos">${word.pos}</span>
              </div>
              <span class="vocab-toggle" data-word="${word.word}">${word.mastered ? "✓ 已掌握" : "标记掌握"}</span>
            </div>
            <p class="vocab-zh">${word.zh}</p>
            ${word.context ? `<p class="vocab-context">📖 ${word.context}</p>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    </section>
  `;

  el.querySelector('[data-action="add-all-flashcards"]').addEventListener("click", () => {
    const state = store.getState();
    const existingWords = new Set(state.flashcards.map((c) => c.word.toLowerCase()));
    allWords.forEach((w) => {
      if (!existingWords.has(w.word.toLowerCase())) {
        state.flashcards.push({ ...w, id: `flash-${w.word.toLowerCase()}` });
      }
    });
    navigate("flashcards");
  });

  el.querySelectorAll(".vocab-toggle").forEach((span) => {
    span.addEventListener("click", () => {
      const word = allWords.find((w) => w.word === span.dataset.word);
      if (word) word.mastered = !word.mastered;
      navigate("vocabulary");
    });
  });

  return el;
}
