const NOTES_KEY = "review-system:v2:quicknotes";

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed.content || "";
  } catch {
    return "";
  }
}

function saveNotes(content) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify({ content, updatedAt: new Date().toISOString() }));
  } catch {}
}

export function initQuickNote() {
  // Don't create if already exists
  if (document.querySelector(".quick-note-overlay")) return;

  const notes = loadNotes();

  // Floating toggle button (always visible)
  const toggle = document.createElement("button");
  toggle.className = "quick-note-toggle";
  toggle.title = "随手笔记 (Ctrl+Shift+N)";
  toggle.innerHTML = "📝";
  toggle.setAttribute("aria-label", "随手笔记");

  // Overlay backdrop
  const overlay = document.createElement("div");
  overlay.className = "quick-note-overlay";
  overlay.style.display = "none";

  const panel = document.createElement("div");
  panel.className = "quick-note-panel";
  panel.innerHTML = `
    <div class="quick-note-header">
      <span class="quick-note-title">📝 随手笔记</span>
      <div class="quick-note-actions">
        <span class="quick-note-hint">Ctrl+Shift+N</span>
        <button class="quick-note-close" title="关闭 (Esc)">✕</button>
      </div>
    </div>
    <textarea
      class="quick-note-textarea"
      placeholder="记下此刻的想法、灵感、待办..."
      spellcheck="true"
    >${notes}</textarea>
    <div class="quick-note-footer">
      <span class="quick-note-status">已自动保存</span>
      <button class="quick-note-clear secondary-btn">清空笔记</button>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  document.body.appendChild(toggle);

  const textarea = panel.querySelector(".quick-note-textarea");
  const statusEl = panel.querySelector(".quick-note-status");
  let saveTimer = null;

  function doSave() {
    saveNotes(textarea.value);
    statusEl.textContent = "已自动保存 " + new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }

  // Autosave on input
  textarea.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, 800);
  });

  // Save on blur
  textarea.addEventListener("blur", doSave);

  function open() {
    overlay.style.display = "flex";
    textarea.focus();
  }

  function close() {
    doSave();
    overlay.style.display = "none";
  }

  function toggleNote() {
    if (overlay.style.display === "none" || !overlay.style.display) {
      open();
    } else {
      close();
    }
  }

  // Toggle button
  toggle.addEventListener("click", toggleNote);

  // Close button
  panel.querySelector(".quick-note-close").addEventListener("click", close);

  // Click backdrop to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Clear button
  panel.querySelector(".quick-note-clear").addEventListener("click", () => {
    if (confirm("确定要清空笔记内容吗？")) {
      textarea.value = "";
      saveNotes("");
      statusEl.textContent = "已清空";
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl+Shift+N to toggle
    if (e.ctrlKey && e.shiftKey && e.key === "N") {
      e.preventDefault();
      toggleNote();
    }
    // Esc to close
    if (e.key === "Escape" && overlay.style.display === "flex") {
      close();
    }
  });

  // If there are existing notes, show a small indicator on toggle
  if (notes.trim()) {
    toggle.classList.add("has-notes");
  }

  // Update indicator on save
  const origSave = doSave;
  doSave = function () {
    origSave();
    if (textarea.value.trim()) {
      toggle.classList.add("has-notes");
    } else {
      toggle.classList.remove("has-notes");
    }
  };
}
