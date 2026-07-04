/**
 * Renders multiple-choice question sets for reading/listening comprehension.
 * Supports "reading" layout (passage + single-col options) and
 * "cet-listening" layout (grouped by conversation + 2-col options + CET instructions).
 */

export function renderMCQSection(module, layout = "reading") {
  const allAnswered = module.items.every((item) => item.isCorrect !== null);
  const items = module.items || [];

  // Group questions by conversation if available
  const groups = [];
  if (items.length > 0 && items[0].conversation != null) {
    const groupMap = new Map();
    items.forEach((item) => {
      const key = item.conversation ?? 0;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push(item);
    });
    for (const [conv, qs] of groupMap) groups.push({ conversation: conv, questions: qs });
  } else {
    groups.push({ conversation: null, questions: items });
  }

  if (layout === "cet-listening") {
    return renderCETStyle(module, groups, allAnswered);
  }

  // --- Reading layout (original) ---
  return `
    <article class="reading-passage">
      <p>${module.passage || module.transcript || ""}</p>
    </article>
    <div class="mcq-list">
      ${items.map((item, index) => renderMCQItem(item, index)).join("")}
    </div>
    ${!allAnswered ? `<div class="hero-actions"><button class="primary-btn" data-action="submit-mcq">提交答案</button></div>` : ""}
  `;
}

/** CET-style listening layout: instructions + grouped questions + 2-col grid */
function renderCETStyle(module, groups, allAnswered) {
  return `
    ${renderCETInstructions(module)}
    ${groups
      .map((group) => {
        const nums = group.questions.map((_, i) => {
          // Calculate absolute numbering across all groups
          const allItems = module.items || [];
          const idx = allItems.indexOf(group.questions[i]);
          return idx + 1;
        });
        return `
      <div class="cet-conversation-group">
        ${group.conversation != null ? `<p class="cet-convo-label">Conversation ${group.conversation} · Questions ${nums[0]}–${nums[nums.length - 1]}</p>` : ""}
        <div class="cet-question-grid">
          ${group.questions.map((item, i) => renderCETQuestionItem(item, nums[i])).join("")}
        </div>
      </div>
    `;
      })
      .join("")}
    ${!allAnswered ? `<div class="hero-actions"><button class="primary-btn" data-action="submit-mcq">提交答案</button></div>` : ""}
  `;
}

function renderCETInstructions(module) {
  return `
    <div class="cet-instructions">
      <p class="cet-instruction-title">${iconInline("listening")} ${module.title}</p>
      <p class="cet-instruction-text">The conversation and the questions will be spoken only once. After you hear a question, read the four possible answers and choose the best answer.</p>
    </div>
  `;
}

function renderCETQuestionItem(item, num) {
  return `
    <fieldset class="cet-mcq-item ${item.isCorrect !== null ? (item.isCorrect ? "cet-mcq-correct" : "cet-mcq-wrong") : ""}">
      <legend><span class="cet-q-num">${num}.</span> ${item.question}</legend>
      <div class="cet-options-grid">
        ${item.options
          .map(
            (opt) => `
          <label class="cet-option ${item.isCorrect !== null && opt.startsWith(item.answer) ? "cet-option-correct" : ""} ${item.isCorrect !== null && item.userAnswer === opt[0].toLowerCase() && !item.isCorrect ? "cet-option-wrong" : ""}">
            <input
              type="radio"
              name="cet-mcq-${item.id}"
              value="${opt[0].toLowerCase()}"
              data-item-id="${item.id}"
              ${item.userAnswer === opt[0].toLowerCase() ? "checked" : ""}
              ${item.isCorrect !== null ? "disabled" : ""}
            />
            <span>${opt}</span>
          </label>
        `
          )
          .join("")}
      </div>
      ${
        item.isCorrect !== null
          ? `<p class="cet-feedback ${item.isCorrect ? "text-correct" : "text-wrong"}">${
              item.isCorrect
                ? "✓ 正确"
                : `✗ 正确答案：${item.options.find((o) => o.startsWith(item.answer))}`
            }</p>`
          : ""
      }
    </fieldset>
  `;
}

function renderMCQItem(item, index) {
  return `
    <fieldset class="mcq-item ${item.isCorrect !== null ? (item.isCorrect ? "mcq-correct" : "mcq-wrong") : ""}">
      <legend>${index + 1}. ${item.question}</legend>
      <div class="mcq-options">
        ${item.options
          .map(
            (opt) => `
          <label class="mcq-option ${item.isCorrect !== null && opt.startsWith(item.answer) ? "mcq-answer-reveal" : ""} ${item.isCorrect !== null && item.userAnswer === opt[0].toLowerCase() && !item.isCorrect ? "mcq-selected-wrong" : ""}">
            <input
              type="radio"
              name="mcq-${item.id}"
              value="${opt[0].toLowerCase()}"
              data-item-id="${item.id}"
              ${item.userAnswer === opt[0].toLowerCase() ? "checked" : ""}
              ${item.isCorrect !== null ? "disabled" : ""}
            />
            <span>${opt}</span>
          </label>
        `
          )
          .join("")}
      </div>
      ${
        item.isCorrect !== null
          ? `<p class="mcq-feedback ${item.isCorrect ? "text-correct" : "text-wrong"}">${
              item.isCorrect
                ? "✓ 正确"
                : `✗ 正确答案：${item.options.find((o) => o.startsWith(item.answer))}`
            }</p>`
          : ""
      }
    </fieldset>
  `;
}

export function bindMCQSubmit(container, module, onSubmit) {
  const btn = container.querySelector('[data-action="submit-mcq"]');
  if (!btn) return;

  btn.addEventListener("click", () => {
    const answers = {};
    container.querySelectorAll("[data-item-id]").forEach((input) => {
      if (input.checked) {
        answers[input.dataset.itemId] = input.value;
      }
    });
    onSubmit(module.id, answers);
  });
}

function iconInline(name) {
  const map = {
    listening: "🎧",
  };
  return map[name] || "";
}
