function extractKeywords(text) {
  // Extract meaningful English words (3+ chars, not just stopwords)
  const stopWords = new Set(["the","and","for","not","are","how","can","that","this","with","when","from","its","has","but","was","now","all"]);
  const words = text.toLowerCase().replace(/[.,;!?()"']/g, " ").split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));
  return [...new Set(words)];
}

function computeSimilarity(userText, refText) {
  if (!userText.trim()) return 0;
  const refKeywords = extractKeywords(refText);
  if (refKeywords.length === 0) return 0;
  const userLower = userText.toLowerCase();
  const matched = refKeywords.filter(kw => userLower.includes(kw));
  return Math.round((matched.length / refKeywords.length) * 100);
}

function highlightMatches(userText, refText) {
  const refKeywords = extractKeywords(refText);
  const words = userText.split(/(\s+)/);
  return words.map(w => {
    const clean = w.replace(/[.,;!?()"']/g, "").toLowerCase();
    if (clean.length >= 3 && refKeywords.includes(clean)) {
      return `<mark class="trans-match">${w}</mark>`;
    }
    return w;
  }).join("");
}

export function renderTranslation(store, navigate) {
  store.actions.markFishStep("translation");
  const state = store.getState();
  const aiReady = Boolean(state.settings?.aiApiKey);
  const aiTranslationEnabled = state.settings?.aiTranslationEnabled !== false;
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
  const checked = state.routePayload?.checked;

  const el = document.createElement("div");
  el.className = "stack-layout";

  let itemsHTML = "";
  if (checked) {
    // Checked mode: show side-by-side comparison with highlights
    const totalScore = module.items.reduce((sum, item) => sum + computeSimilarity(item.userAnswer, item.reference), 0);
    const avgScore = Math.round(totalScore / module.items.length);

    itemsHTML = `
      <div class="trans-score-bar">
        <div class="trans-score-label">整体相似度</div>
        <div class="trans-score-meter">
          <div class="trans-score-fill" style="width:${avgScore}%"></div>
        </div>
        <div class="trans-score-num">${avgScore}%</div>
      </div>
      ${module.items.map((item, index) => {
        const similarity = computeSimilarity(item.userAnswer, item.reference);
        return `
          <div class="trans-compare-item">
            <div class="trans-compare-header">
              <span class="translation-num">${index + 1}</span>
              <span class="trans-compare-source">${item.source}</span>
              <span class="trans-compare-score" style="color:${similarity >= 60 ? 'var(--accent)' : similarity >= 30 ? '#b78b3d' : '#b75b3d'}">${similarity}% 匹配</span>
            </div>
            <div class="trans-compare-body">
              <div class="trans-compare-col">
                <div class="trans-compare-label">你的翻译</div>
                <div class="trans-compare-text trans-user">${highlightMatches(item.userAnswer, item.reference)}</div>
              </div>
              <div class="trans-compare-col">
                <div class="trans-compare-label">参考译文</div>
                <div class="trans-compare-text trans-ref">${item.reference}</div>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    `;
  } else {
    // Input mode
    itemsHTML = module.items.map((item, index) => `
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
      </div>
    `).join("");
  }

  el.innerHTML = `
    <section class="paper-panel translation-layout">
      <div class="reading-header">
        <div>
          <p class="label">Translation Practice</p>
          <h3>${module.title}</h3>
          <p>${module.summary}</p>
        </div>
        <div class="sketch-badge">${aiTranslationEnabled ? (aiReady ? "AI 翻译辅助已准备" : "填写 AI 服务信息后可使用") : "AI 翻译辅助已关闭"}</div>
      </div>
      <div class="preview-panel">
        <p class="label">AI 翻译辅助</p>
        <h4>翻译润色 / 表达建议 / 句子拆解</h4>
        <p>${aiTranslationEnabled ? "配置完成后，AI 可以润色你的答案、解释与参考译文的差异，并提炼值得记忆的表达。" : "你已在设置中关闭 AI 翻译辅助。"}</p>
        <div class="hero-actions">
          <button class="secondary-btn" data-action="ai-polish">${aiReady && aiTranslationEnabled ? "使用 AI 翻译辅助" : "去设置里启用 AI"}</button>
        </div>
      </div>
      <div class="translation-list">
        ${itemsHTML}
      </div>
      <div class="hero-actions">
        ${checked
          ? '<button class="secondary-btn" data-action="reset">重新翻译</button>'
          : allAnswered
            ? `
              <button class="secondary-btn" data-action="reset">清空重写</button>
              <button class="primary-btn" data-action="check">核对答案</button>
            `
            : '<button class="primary-btn" data-action="save">保存翻译</button>'
        }
      </div>
    </section>
  `;

  if (!checked) {
    const saveBtn = el.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const answers = Object.fromEntries(
          [...el.querySelectorAll("[data-item-id]")].map((input) => [input.dataset.itemId, input.value])
        );
        store.actions.saveTranslationDraft(module.id, answers);
        navigate("translation");
      });
    }

    const checkBtn = el.querySelector('[data-action="check"]');
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        const answers = Object.fromEntries(
          [...el.querySelectorAll("[data-item-id]")].map((input) => [input.dataset.itemId, input.value])
        );
        store.actions.checkTranslationAnswers(module.id, answers, 50);
        navigate("translation", { checked: true });
      });
    }

    const resetBtn = el.querySelector('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        store.actions.resetTranslationAnswers(module.id);
        navigate("translation");
      });
    }
  } else {
    const resetBtn = el.querySelector('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        store.actions.resetTranslationAnswers(module.id);
        navigate("translation", { checked: false });
      });
    }
  }

  el.querySelector('[data-action="ai-polish"]')?.addEventListener("click", () => {
    store.track("ai_translation_entry_clicked", {
      route: state.route,
      ai_ready: aiReady,
      enabled: aiTranslationEnabled,
      module_id: module.id,
    });
    if (!aiTranslationEnabled || !aiReady) {
      alert("先在设置中填写 AI 服务信息，之后就能使用翻译润色和讲解。");
      navigate("settings");
      return;
    }
    alert("AI 翻译辅助正在连接服务。配置完成后，这里会直接为你的翻译提供润色和讲解。");
  });

  return el;
}
