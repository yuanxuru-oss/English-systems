const FISH_STEPS = [
  { key: "listening",  label: "听力练习", icon: "🎧" },
  { key: "reading",    label: "阅读练习", icon: "📖" },
  { key: "translation", label: "翻译练习", icon: "✍️" },
  { key: "vocabulary", label: "词汇表",   icon: "📝" },
  { key: "flashcards", label: "闪卡词库", icon: "🃏" },
  { key: "mistakes",   label: "错题笔记", icon: "📋" },
];

const STEP_ROUTES = {
  listening: "listening",
  reading: "reading",
  translation: "translation",
  vocabulary: "vocabulary",
  flashcards: "flashcards",
  mistakes: "mistakes",
};

export function renderFishProgress(store, navigate) {
  const steps = store.getState().settings?.fishSteps || [];
  const done = steps.length;
  const total = FISH_STEPS.length;

  const logoHTML = `
    <div class="fish-stepper-logo" title="鱼骨头英语复习系统">
      <img src="${window.fishboneDataUri || ''}" alt="logo" />
    </div>
  `;

  const stepItems = FISH_STEPS.map((s, i) => {
    const isDone = steps.includes(s.key);
    const isNext = i === done; // first undone step is "current"
    let cls = "fish-step-item";
    if (isDone) cls += " is-done";
    else if (isNext) cls += " is-next";
    return `
      <button class="${cls}" data-step="${s.key}" title="${s.label}">
        <span class="fish-step-icon">${s.icon}</span>
        <span class="fish-step-label">${s.label}</span>
        ${isDone ? '<span class="fish-step-check">✓</span>' : ''}
      </button>
    `;
  }).join("");

  return `
    <section class="fish-stepper-widget paper-panel">
      <div class="fish-stepper-header">
        <p class="label">复习流程</p>
        <span class="fish-stepper-count">${done}/${total}</span>
      </div>
      <div class="fish-stepper-track">
        ${logoHTML}
        <div class="fish-stepper-connector"></div>
        ${stepItems}
      </div>
    </section>
  `;
}

export function bindFishStepper(el, navigate) {
  el.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = STEP_ROUTES[btn.dataset.step];
      if (route) navigate(route);
    });
  });
}
