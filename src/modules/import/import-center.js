const templates = {
  reading: `[模块类型] reading
[标题] CET 完型训练 · Unit 1
[文章]
This broader definition of good living blends deep satisfaction and empathy. It also brings a richer way to notice what matters in study.
[题目]
deep satisfaction | satisfaction
richer way | richer
`,

  listening: `[模块类型] listening
[模式] dictation
[标题] 精听填空 · Campus Life
[听力原文]
College students often struggle with time management. Balancing coursework, part-time jobs, and social activities requires discipline and careful planning. Many find that creating a weekly schedule helps reduce stress.
[题目]
struggle with time ____ | management
Balancing coursework, ____ jobs | part-time
requires ____ and careful planning | discipline
creating a ____ schedule | weekly
helps reduce ____ | stress
`,

  readingComp: `[模块类型] reading
[模式] comprehension
[标题] 阅读理解 · Climate Change
[文章]
Climate change is one of the most pressing issues of our time. Rising global temperatures have led to more frequent extreme weather events, including hurricanes, floods, and droughts. Scientists warn that without immediate action, the consequences will become irreversible. Many countries have pledged to reduce carbon emissions, but progress has been slow. Renewable energy sources such as solar and wind power offer promising alternatives to fossil fuels.
[题目]
What is the main topic of the passage? | A. The history of weather forecasting | B. Climate change and its consequences | C. The benefits of fossil fuels | D. Population growth in cities | B
According to scientists, what will happen without immediate action? | A. Temperatures will stabilize naturally | B. The economy will improve | C. Consequences will become irreversible | D. Weather patterns will return to normal | C
What has been the progress of carbon emission reduction? | A. Very fast and successful | B. Slow despite pledges | C. Already completed | D. Not started yet | B
What does the passage suggest as alternatives to fossil fuels? | A. Nuclear power only | B. Coal and natural gas | C. Solar and wind power | D. Hydroelectric dams only | C
`,

  listeningComp: `[模块类型] listening
[模式] comprehension
[标题] 听力理解 · Library Conversation
[听力原文]
Librarian: Good afternoon. How can I help you? Student: Hi, I'm looking for books on cognitive psychology for my research paper. Librarian: Those are on the third floor, in the psychology section. The call numbers start with BF. Student: Great. Do you also have access to online journals? Librarian: Yes, you can access them through the university library portal with your student ID. Student: Perfect. And how many books can I borrow at once? Librarian: Up to ten books for two weeks, and you can renew online if no one has reserved them.
[题目]
What subject is the student researching? | A. Clinical psychology | B. Cognitive psychology | C. Social psychology | D. Developmental psychology | B
Where are the psychology books located? | A. First floor | B. Second floor | C. Third floor | D. Basement | C
How can the student access online journals? | A. Through a public website | B. By paying a subscription fee | C. Through the university portal with student ID | D. By visiting the IT department | C
What is the maximum number of books the student can borrow? | A. Five books | B. Seven books | C. Ten books | D. Fifteen books | C
`,
};

const vocabTemplate = `[模块类型] vocabulary
[标题] CET 核心词汇导入
[词汇表]
ambitious | adj. | 有雄心的 | She is an ambitious student.
curiosity | n. | 好奇心 | Curiosity drives learning.
discipline | n. | 纪律 | Self-discipline is essential.
flexibility | n. | 灵活性 | Flexibility matters in problem-solving.
insight | n. | 洞察力 | Creative insight emerges from practice.
`;

const translationTemplate = `[模块类型] translation
[标题] 翻译练习 · 中译英
[题目]
有效的决策需要在直觉和分析之间取得微妙的平衡。 | Effective decision making requires a delicate balance between intuition and analysis.
电子商务平台的兴起使小企业也能进入全球市场。 | The rise of e-commerce platforms has enabled even small businesses to reach global markets.
`;

export function renderImportCenter(store) {
  const state = store.getState();
  const folder = store.getCurrentFolder();
  const el = document.createElement("div");
  el.className = "stack-layout";

  el.innerHTML = `
    <section class="paper-panel import-layout">
      <div>
        <p class="label">Template-first import</p>
        <h3>模板化粘贴，一键生成练习模块</h3>
        <p>支持阅读、精听填空、听力原题、词汇、翻译模板。导入内容将加入：<strong>${folder ? folder.title : "未选择试卷"}</strong>。<br/>听力类型可上传音频文件（MP3/WAV），导入后自动绑定。</p>
      </div>
      <div class="import-tabs" data-tabs>
        <button class="import-tab active" data-tab="reading">📖 阅读填空</button>
        <button class="import-tab" data-tab="readingComp">📖 阅读原题</button>
        <button class="import-tab" data-tab="listening">🎧 精听填空</button>
        <button class="import-tab" data-tab="listeningComp">🔊 听力原题</button>
        <button class="import-tab" data-tab="vocabulary">📝 词汇表</button>
        <button class="import-tab" data-tab="translation">🌐 翻译练习</button>
      </div>
      <div class="import-duo">
        <textarea class="editor-panel" data-template-input>${templates.reading}</textarea>
        <div class="preview-panel" data-preview-panel>
          <p class="preview-empty">点击"生成预览"后，这里会显示将被导入的模块内容。</p>
        </div>
      </div>
      <div class="import-audio-row" data-import-audio>
        <label class="import-audio-label">
          <span>🎵 听力音频（可选）</span>
          <input type="file" accept="audio/mp3,audio/wav,audio/mpeg,audio/wav" data-audio-file hidden />
          <span class="import-audio-btn">选择音频文件</span>
        </label>
        <span class="import-audio-name" data-audio-name>未选择文件</span>
        <span class="import-audio-hint">仅精听填空 / 听力原题模块需要。支持 MP3、WAV。</span>
      </div>
      <div class="hero-actions">
        <button class="primary-btn" data-action="preview">生成预览</button>
        <button class="secondary-btn" data-action="apply">加入当前项目</button>
      </div>
    </section>
  `;

  const input = el.querySelector("[data-template-input]");
  const previewPanel = el.querySelector("[data-preview-panel]");
  const audioFileInput = el.querySelector("[data-audio-file]");
  const audioNameEl = el.querySelector("[data-audio-name]");
  let audioDataUrl = null;

  // Audio file upload
  const audioBtn = el.querySelector(".import-audio-btn");
  audioBtn.addEventListener("click", () => audioFileInput.click());
  audioFileInput.addEventListener("change", () => {
    const file = audioFileInput.files[0];
    if (!file) {
      audioDataUrl = null;
      audioNameEl.textContent = "未选择文件";
      return;
    }
    audioNameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      audioDataUrl = reader.result;
      audioNameEl.textContent = `${file.name} ✓`;
    };
    reader.readAsDataURL(file);
  });

  // Tab switching
  el.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      el.querySelectorAll("[data-tab]").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const tabKey = tab.dataset.tab;
      if (tabKey === "listening") {
        input.value = templates.listening;
      } else if (tabKey === "readingComp") {
        input.value = templates.readingComp;
      } else if (tabKey === "listeningComp") {
        input.value = templates.listeningComp;
      } else if (tabKey === "vocabulary") {
        input.value = vocabTemplate;
      } else if (tabKey === "translation") {
        input.value = translationTemplate;
      } else {
        input.value = templates.reading;
      }
    });
  });

  function renderPreview() {
    const parsed = state.importPreview;
    if (!parsed) return;

    if (parsed.type === "vocabulary") {
      previewPanel.innerHTML = `
        <p class="label">Vocabulary Import Preview</p>
        <h4>${parsed.title}</h4>
        <p>将导入 <strong>${parsed.vocabulary.length}</strong> 个单词到闪卡词库</p>
        <ul class="preview-list">
          ${parsed.vocabulary
            .map(
              (item) =>
                `<li><strong>${item.word}</strong> <span class="text-muted">${item.pos}</span> — ${item.zh}${item.context ? `<br><small>${item.context}</small>` : ""}</li>`
            )
            .join("")}
        </ul>
      `;
    } else if (parsed.mode === "comprehension") {
      const labelText = parsed.type === "listening" ? "Listening Comprehension" : "Reading Comprehension";
      previewPanel.innerHTML = `
        <p class="label">${labelText} Import Preview</p>
        <h4>${parsed.title}</h4>
        <p>${parsed.passage || parsed.transcript || ""}</p>
        <p>将导入 <strong>${parsed.items.length}</strong> 道选择题</p>
        <ul class="preview-list">
          ${parsed.items.map((item) => `<li>${item.question} → <strong>${item.answer}</strong> (${item.options ? item.options.join(" | ") : ""})</li>`).join("")}
        </ul>
      `;
    } else {
      previewPanel.innerHTML = `
        <p class="label">${parsed.type === "listening" ? "Listening" : "Reading"} Import Preview</p>
        <h4>${parsed.title}</h4>
        <p>${parsed.passage || parsed.transcript || ""}</p>
        <ul class="preview-list">
          ${parsed.items.map((item) => `<li>${item.prompt} <strong>${item.answer}</strong></li>`).join("")}
        </ul>
      `;
    }
  }

  el.querySelector('[data-action="preview"]').addEventListener("click", () => {
    store.actions.importTemplateBlock(input.value);
    renderPreview();
  });

  el.querySelector('[data-action="apply"]').addEventListener("click", () => {
    // Attach audio data if present and module is listening type
    const p = state.importPreview;
    if (p && (p.type === "listening") && audioDataUrl) {
      p.audioData = audioDataUrl;
    }
    store.actions.applyImportPreview();
    audioDataUrl = null;
    audioFileInput.value = "";
    audioNameEl.textContent = "未选择文件";
    if (p?.type === "vocabulary") {
      previewPanel.innerHTML = `<p class="preview-empty">单词已加入闪卡词库 ✓。</p>`;
    } else if (p?.mode === "comprehension") {
      previewPanel.innerHTML = `<p class="preview-empty">${p.type === "listening" ? "听力原题" : "阅读原题"}已加入当前试卷 ✓。</p>`;
    } else {
      previewPanel.innerHTML = `<p class="preview-empty">已加入当前项目 ✓。</p>`;
    }
  });

  return el;
}
