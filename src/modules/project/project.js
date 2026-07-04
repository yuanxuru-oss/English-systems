import { icon } from "../../components/icons.js";

function moduleTag(type) {
  const labels = { reading: "阅读", listening: "听力", vocabulary: "词汇", translation: "翻译" };
  return `<span class="module-tag">${labels[type] || type}</span>`;
}

function createEditableTitle(folder, store, navigate) {
  const wrapper = document.createElement("div");
  wrapper.className = "folder-title-wrapper";
  wrapper.setAttribute("data-folder-edit", folder.id);

  const display = document.createElement("span");
  display.className = "folder-title-display";
  display.textContent = folder.title;

  const input = document.createElement("input");
  input.className = "folder-title-input";
  input.value = folder.title;
  input.style.display = "none";

  let editing = false;

  function startEdit() {
    editing = true;
    display.style.display = "none";
    input.style.display = "inline-block";
    input.focus();
    input.select();
  }

  wrapper.startEdit = startEdit;

  function endEdit() {
    if (!editing) return;
    editing = false;
    const newTitle = input.value.trim() || folder.title;
    input.value = newTitle;
    store.actions.renameFolder(folder.id, newTitle);
    display.textContent = newTitle;
    display.style.display = "";
    input.style.display = "none";
    navigate("project");
  }

  display.addEventListener("dblclick", startEdit);
  input.addEventListener("blur", endEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { input.blur(); }
    if (e.key === "Escape") { input.value = folder.title; input.blur(); }
  });

  wrapper.appendChild(display);
  wrapper.appendChild(input);
  return wrapper;
}

export function renderProject(store, navigate) {
  const state = store.getState();
  const project = state.projects.find((item) => item.id === state.currentProjectId) ?? state.projects[0];
  const activeFolderId = state.currentFolderId;

  const el = document.createElement("div");
  el.className = "stack-layout";

  const foldersHTML = (project.folders || []).map((folder) => {
    const isActive = folder.id === activeFolderId;

    return `
      <article class="folder-card ${isActive ? "folder-active" : ""}" data-folder-id="${folder.id}">
        <div class="folder-header">
          <div class="folder-info">
            <span class="folder-icon">${icon("project")}</span>
            <div class="folder-info-text">
              <h4 class="folder-title-placeholder" data-folder-title="${folder.id}">${folder.title}</h4>
              <p>${folder.description}</p>
            </div>
          </div>
          <div class="folder-actions">
            <button class="folder-action-btn" data-action="rename" data-folder="${folder.id}" title="重命名">✏️</button>
            ${project.folders.length > 1 ? `<button class="folder-action-btn folder-action-danger" data-action="delete" data-folder="${folder.id}" title="删除">🗑️</button>` : ""}
          </div>
        </div>
        <div class="folder-modules" data-folder-modules="${folder.id}">
          ${renderFolderModules(folder)}
        </div>
        <div class="folder-stats" data-folder-stats="${folder.id}">
          ${renderFolderStats(folder)}
        </div>
      </article>
    `;
  }).join("");

  el.innerHTML = `
    <section class="paper-panel detail-panel">
      <div class="reading-header">
        <div>
          <p class="label">Project Overview</p>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </div>
        <button class="primary-btn" data-action="create-folder">+ 新建试卷</button>
      </div>
      <div class="folder-list">
        ${foldersHTML}
      </div>
    </section>
    <section class="paper-panel action-panel">
      <button class="secondary-btn" data-action="import">📥 导入新试卷</button>
      <button class="secondary-btn" data-action="flashcards">📇 闪卡词库</button>
      <button class="secondary-btn" data-action="mistakes">📋 错题笔记</button>
    </section>
  `;

  // Inline editable titles
  el.querySelectorAll("[data-folder-title]").forEach((placeholder) => {
    const folderId = placeholder.dataset.folderTitle;
    const folder = (project.folders || []).find((f) => f.id === folderId);
    if (folder) {
      const editable = createEditableTitle(folder, store, navigate);
      placeholder.replaceWith(editable);
    }
  });

  // Create folder
  el.querySelector('[data-action="create-folder"]').addEventListener("click", () => {
    const newFolder = store.actions.createFolder();
    if (newFolder) navigate("project");
  });

  // Select folder
  el.querySelectorAll('[data-action="select-folder"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      store.actions.selectFolder(btn.dataset.folder);
      navigate("project");
    });
  });

  // Rename folder — trigger inline edit
  el.querySelectorAll('[data-action="rename"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrapper = el.querySelector(`[data-folder-edit="${btn.dataset.folder}"]`);
      if (wrapper && wrapper.startEdit) {
        wrapper.startEdit();
      }
    });
  });

  // Delete folder
  el.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const folderId = btn.dataset.folder;
      if (confirm("确定删除这个试卷文件夹？其中的模块将被删除。")) {
        store.actions.deleteFolder(folderId);
        navigate("project");
      }
    });
  });

  // Navigate to practice pages
  el.querySelectorAll('[data-action="go-reading"]').forEach((card) => {
    card.addEventListener("click", () => {
      store.actions.selectFolder(card.dataset.folder);
      navigate("reading");
    });
  });
  el.querySelectorAll('[data-action="go-listening"]').forEach((card) => {
    card.addEventListener("click", () => {
      store.actions.selectFolder(card.dataset.folder);
      navigate("listening");
    });
  });
  el.querySelectorAll('[data-action="go-vocab"]').forEach((card) => {
    card.addEventListener("click", () => {
      store.actions.selectFolder(card.dataset.folder);
      navigate("vocabulary");
    });
  });
  el.querySelectorAll('[data-action="go-translation"]').forEach((card) => {
    card.addEventListener("click", () => {
      store.actions.selectFolder(card.dataset.folder);
      navigate("translation");
    });
  });

  el.querySelector('[data-action="import"]').addEventListener("click", () => navigate("import"));
  el.querySelector('[data-action="flashcards"]').addEventListener("click", () => navigate("flashcards"));
  el.querySelector('[data-action="mistakes"]').addEventListener("click", () => navigate("mistakes"));

  return el;
}

function renderFolderModules(folder) {
  return folder.modules.map((mod) => {
    let action = "";
    if (mod.type === "reading") action = `data-action="go-reading" data-folder="${folder.id}"`;
    else if (mod.type === "listening") action = `data-action="go-listening" data-folder="${folder.id}"`;
    else if (mod.type === "vocabulary") action = `data-action="go-vocab" data-folder="${folder.id}"`;
    else if (mod.type === "translation") action = `data-action="go-translation" data-folder="${folder.id}"`;
    return `
      <div class="detail-card" ${action} style="cursor:pointer">
        ${moduleTag(mod.type)}
        <h4>${mod.title}</h4>
        <p>${mod.summary}</p>
      </div>
    `;
  }).join("");
}

function renderFolderStats(folder) {
  const readingMods = folder.modules.filter((m) => m.type === "reading");
  const listeningMods = folder.modules.filter((m) => m.type === "listening");
  const vocabMods = folder.modules.filter((m) => m.type === "vocabulary");
  const transMods = folder.modules.filter((m) => m.type === "translation");
  return `
    <span>📖 ${readingMods.length} 阅读</span>
    <span>🎧 ${listeningMods.length} 听力</span>
    <span>📝 ${vocabMods.length} 词汇</span>
    <span>🌐 ${transMods.length} 翻译</span>
  `;
}
