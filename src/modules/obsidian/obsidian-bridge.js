/**
 * Obsidian Vault Bridge
 * - Export review data as .md files into Obsidian vault
 * - Import .md files from vault as learning modules
 * - Bidirectional sync via File System Access API
 */

const VAULT_HANDLE_KEY = "review-system:v2:vault-handle";

// ── Vault handle persistence via IndexedDB ──

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("review-system-obsidian", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("handles");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVaultHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("handles", "readwrite");
    tx.objectStore("handles").put(handle, VAULT_HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadVaultHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("handles", "readonly");
    const req = tx.objectStore("handles").get(VAULT_HANDLE_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearVaultHandle() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("handles", "readwrite");
    tx.objectStore("handles").delete(VAULT_HANDLE_KEY);
    tx.oncomplete = () => resolve();
  });
}

// ── Pick vault ──

export async function pickVault() {
  if (!window.showDirectoryPicker) {
    throw new Error("当前浏览器不支持 File System Access API。请使用 Chrome / Edge。");
  }
  const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  await saveVaultHandle(handle);
  return handle;
}

async function getVault() {
  let handle = await loadVaultHandle();
  if (!handle) {
    handle = await pickVault();
  }
  // Re-verify permission
  const opts = { mode: "readwrite" };
  if ((await handle.queryPermission(opts)) !== "granted") {
    await handle.requestPermission(opts);
  }
  return handle;
}

// ── Helpers ──

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, "-").trim() || "untitled";
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

async function writeFile(vault, filename, content) {
  const file = await vault.getFileHandle(filename, { create: true });
  const writable = await file.createWritable();
  await writable.write(content);
  await writable.close();
}

async function readFile(vault, filename) {
  try {
    const file = await vault.getFileHandle(filename);
    const f = await file.getFile();
    return await f.text();
  } catch {
    return null;
  }
}

// ── Export ──

export async function exportAll(store) {
  const vault = await getVault();
  const state = store.getState();
  const project = state.projects.find(p => p.id === state.currentProjectId) || state.projects[0];
  const results = [];

  // Vocabulary
  const vocabFolder = project.folders?.flatMap(f => f.modules || [])?.filter(m => m.type === "vocabulary") || [];
  if (vocabFolder.length) {
    let md = `# 词汇表 — ${project.title}\n\n> 导出时间：${formatDate()}\n\n`;
    vocabFolder.forEach(m => {
      md += `## ${m.title || "词汇"}\n\n`;
      (m.entries || []).forEach(e => {
        md += `- **${e.word || ""}** ${e.pos ? `*${e.pos}.*` : ""}  ${e.meaning || ""}\n`;
        if (e.example) md += `  - 📖 ${e.example}\n`;
      });
      md += "\n";
    });
    await writeFile(vault, `vocab-${sanitizeFilename(project.title)}.md`, md);
    results.push(`vocab-${sanitizeFilename(project.title)}.md`);
  }

  // Mistakes
  const mistakes = state.mistakes || [];
  if (mistakes.length) {
    let md = `# 错题笔记 — ${project.title}\n\n> 导出时间：${formatDate()}\n\n`;
    mistakes.forEach((m, i) => {
      md += `## 错题 ${i + 1}\n\n`;
      md += `- **题目**：${m.question || ""}\n`;
      if (m.userAnswer) md += `- **你的答案**：${m.userAnswer}\n`;
      if (m.correctAnswer) md += `- **正确答案**：${m.correctAnswer}\n`;
      if (m.note) md += `- **笔记**：${m.note}\n`;
      md += `- **状态**：${m.mastered ? "✅ 已掌握" : "🔄 待复习"}\n\n`;
    });
    await writeFile(vault, `mistakes-${sanitizeFilename(project.title)}.md`, md);
    results.push(`mistakes-${sanitizeFilename(project.title)}.md`);
  }

  // Quick notes
  try {
    const raw = localStorage.getItem("review-system:v2:quicknotes");
    if (raw) {
      const notes = JSON.parse(raw);
      const content = notes.map(n => `- ${n.text || n} _(${n.time || ""})_`).join("\n");
      if (content.trim()) {
        await writeFile(vault, `quick-notes.md`, `# 随手笔记\n\n${content}`);
        results.push("quick-notes.md");
      }
    }
  } catch { /* ignore */ }

  return results;
}

// ── Import ──

export async function scanVaultModules(vaultHandle) {
  const modules = [];
  const skip = new Set([".obsidian", ".trash", ".git"]);
  for await (const [name, handle] of vaultHandle.entries()) {
    if (skip.has(name)) continue;
    if (handle.kind === "file" && name.endsWith(".md") && !name.startsWith(".")) {
      modules.push({ name, handle });
    }
  }
  return modules;
}

export async function importModule(store, vaultHandle, filename) {
  const content = await readFile(vaultHandle, filename);
  if (!content) throw new Error("无法读取文件");

  // Parse frontmatter
  let title = filename.replace(/\.md$/, "");
  let type = "reading";
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const fm = frontmatterMatch[1];
    const titleMatch = fm.match(/title:\s*(.+)/);
    if (titleMatch) title = titleMatch[1].trim();
    const typeMatch = fm.match(/type:\s*(.+)/);
    if (typeMatch) type = typeMatch[1].trim();
  }

  // Parse body for vocabulary entries or reading passages
  const body = content.replace(/^---[\s\S]*?---\n*/, "").trim();
  let entries = [];
  let questions = [];

  if (type === "vocabulary") {
    const lines = body.split("\n").filter(l => l.startsWith("- "));
    entries = lines.map(l => {
      const m = l.match(/^\-\s+\*\*(.+?)\*\*\s*(?:(\w+)\.?\s*)?(.+?)(?:\s*📖\s*(.+))?$/);
      if (m) return { word: m[1], pos: m[2] || "", meaning: (m[3] || "").trim(), example: m[4] || "" };
      return { word: l.replace(/^-\s+/, ""), meaning: "" };
    });
  }

  const state = store.getState();
  const project = state.projects.find(p => p.id === state.currentProjectId);
  if (project) {
    const folderId = "folder-" + Date.now();
    store.actions.addFolder(project.id, {
      id: folderId,
      title: "📥 Obsidian 导入",
    });
    store.actions.addModule(project.id, folderId, {
      id: "mod-" + Date.now(),
      type,
      title,
      summary: `从 Obsidian 导入：${filename}`,
      entries,
      questions,
    });
  }

  return { title, type };
}

// ── Render UI ──

export function renderObsidianPanel(store, navigate) {
  const state = store.getState();
  const hasVault = false; // checked async below

  return `
    <section class="obsidian-panel paper-panel">
      <div class="obsidian-header">
        <p class="label">🔗 Obsidian 联机</p>
        <button class="secondary-btn" data-action="pick-vault">选择 Vault 目录</button>
      </div>
      <div class="obsidian-actions">
        <div class="obsidian-card">
          <h4>📤 导出到 Obsidian</h4>
          <p>将词汇表、错题笔记、随手笔记导出为 .md 文件</p>
          <button class="secondary-btn" data-action="export-obsidian">导出全部</button>
        </div>
        <div class="obsidian-card">
          <h4>📥 从 Obsidian 导入</h4>
          <p>扫描 vault 中的 .md 文件，导入为学习模块</p>
          <button class="secondary-btn" data-action="scan-obsidian">扫描文件</button>
        </div>
      </div>
      <div class="obsidian-status" data-obsidian-status></div>
      <div class="obsidian-file-list" data-obsidian-files></div>
    </section>
  `;
}

export function bindObsidianPanel(el, store, navigate) {
  const status = el.querySelector("[data-obsidian-status]");
  const fileList = el.querySelector("[data-obsidian-files]");

  function showStatus(msg, ok = true) {
    status.innerHTML = `<p class="${ok ? "obs-ok" : "obs-err"}">${msg}</p>`;
  }

  el.querySelector("[data-action='pick-vault']").addEventListener("click", async () => {
    try {
      await pickVault();
      showStatus("✅ Vault 已连接");
    } catch (e) {
      showStatus("⚠️ " + e.message, false);
    }
  });

  el.querySelector("[data-action='export-obsidian']").addEventListener("click", async () => {
    try {
      showStatus("⏳ 导出中…");
      const results = await exportAll(store);
      showStatus(`✅ 已导出 ${results.length} 个文件：${results.join(", ")}`);
    } catch (e) {
      showStatus("❌ " + e.message, false);
    }
  });

  el.querySelector("[data-action='scan-obsidian']").addEventListener("click", async () => {
    try {
      showStatus("⏳ 扫描中…");
      const vault = await getVault();
      const files = await scanVaultModules(vault);
      if (!files.length) {
        showStatus("📭 未找到 .md 文件");
        return;
      }
      fileList.innerHTML = files.map(f => `
        <div class="obsidian-file-row">
          <span>📄 ${f.name}</span>
          <button class="secondary-btn" data-import="${f.name}">导入</button>
        </div>
      `).join("");
      showStatus(`📂 找到 ${files.length} 个 .md 文件`);

      fileList.querySelectorAll("[data-import]").forEach(btn => {
        btn.addEventListener("click", async () => {
          try {
            const vault = await getVault();
            const result = await importModule(store, vault, btn.dataset.import);
            showStatus(`✅ 已导入「${result.title}」`);
            btn.disabled = true;
            btn.textContent = "已导入";
          } catch (e) {
            showStatus("❌ " + e.message, false);
          }
        });
      });
    } catch (e) {
      showStatus("❌ " + e.message, false);
    }
  });

  // Check existing handle on load
  loadVaultHandle().then(h => {
    if (h) showStatus("✅ Vault 已连接（上次选择）");
  }).catch(() => {});
}
