import { serializePersistedState } from "../../core/persistence.js";
import { STORAGE_KEY } from "../../core/persistence.js";

const COLOR_THEMES = [
  { value: "default", label: "基础色", desc: "暖纸质感", color: "#b75b3d" },
  { value: "dark", label: "暗夜", desc: "深色护眼", color: "#2a2520" },
  { value: "forest", label: "森林绿", desc: "自然清新", color: "#4a7c52" },
  { value: "ocean", label: "海洋蓝", desc: "冷静专注", color: "#3d6d99" },
  { value: "sakura", label: "樱花粉", desc: "温柔暖调", color: "#b85a6a" },
];

function renderSection(title, content) {
  return `
    <div class="settings-section">
      <p class="label">${title}</p>
      ${content}
    </div>
  `;
}

export function renderSettings(store, navigate) {
  const state = store.getState();
  const settings = state.settings || {};
  const el = document.createElement("div");
  el.className = "stack-layout";

  const storageSize = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return "空";
      const kb = (new Blob([raw]).size / 1024).toFixed(1);
      return `${kb} KB`;
    } catch {
      return "未知";
    }
  })();

  el.innerHTML = `
    <section class="paper-panel settings-layout">
      <div class="reading-header">
        <div>
          <p class="label">Settings</p>
          <h3>系统设置</h3>
          <p>调整你的学习环境与偏好。</p>
        </div>
      </div>

      ${renderSection("💾 存储设置", `
        <div class="settings-row">
          <div class="settings-info">
            <span class="settings-info-label">存储键（可自定义）</span>
            <span class="settings-info-desc">修改后数据将迁移至新键，刷新后生效</span>
          </div>
        </div>
        <div class="settings-storage-key-row">
          <input type="text" class="settings-key-input" value="${STORAGE_KEY}" placeholder="review-system:v2" />
          <button class="primary-btn" data-action="change-key">应用</button>
        </div>
        <div class="settings-info" style="margin-top:12px">
          <span class="settings-info-label">已用空间</span>
          <span class="settings-info-value">${storageSize}</span>
        </div>
        <div class="hero-actions">
          <button class="secondary-btn" data-action="export">导出数据 (JSON)</button>
          <button class="secondary-btn" data-action="import-trigger">导入数据 (JSON)</button>
          <input type="file" accept=".json" class="settings-file-input" style="display:none" />
        </div>
      `)}

      ${renderSection("🎨 主题色系", `
        <div class="settings-option-group theme-group">
          ${COLOR_THEMES.map((t) => `
            <label class="settings-option theme-option ${(settings.colorTheme || "default") === t.value ? "active" : ""}" data-setting="colorTheme" data-value="${t.value}">
              <span class="theme-swatch" style="background:${t.color}"></span>
              <span class="settings-option-label">${t.label}</span>
              <span class="settings-option-desc">${t.desc}</span>
            </label>
          `).join("")}
        </div>
      `)}

      ${renderSection("📚 学习设置", `
        <div class="settings-toggles">
          <label class="settings-toggle">
            <div>
              <span class="settings-toggle-label">自动播放音频</span>
              <span class="settings-toggle-desc">进入听力练习时自动开始播放</span>
            </div>
            <input type="checkbox" data-setting="autoPlayAudio" ${settings.autoPlayAudio ? "checked" : ""} class="settings-switch" />
          </label>
          <label class="settings-toggle">
            <div>
              <span class="settings-toggle-label">显示参考译文</span>
              <span class="settings-toggle-desc">翻译练习提交后默认展开参考译文</span>
            </div>
            <input type="checkbox" data-setting="showReference" ${settings.showReference !== false ? "checked" : ""} class="settings-switch" />
          </label>
        </div>
      `)}

      ${renderSection("🔔 提醒设置", `
        <div class="settings-toggles">
          <label class="settings-toggle">
            <div>
              <span class="settings-toggle-label">每日学习提醒</span>
              <span class="settings-toggle-desc">每天在设定时间通过浏览器通知提醒学习</span>
            </div>
            <input type="checkbox" data-setting="dailyReminder" ${settings.dailyReminder ? "checked" : ""} class="settings-switch" />
          </label>
          <div class="settings-row" style="margin-top:8px">
            <span class="settings-info-label">提醒时间</span>
            <input type="time" value="${settings.reminderTime || "20:00"}" data-setting="reminderTime" class="settings-time-input" />
          </div>
        </div>
      `)}

      ${renderSection("ℹ️ 关于", `
        <div class="settings-info">
          <span class="settings-info-label">版本</span>
          <span class="settings-info-value">v1.0.0</span>
        </div>
        <div class="settings-info">
          <span class="settings-info-label">项目</span>
          <span class="settings-info-value">鱼头英语复习系统</span>
        </div>
      `)}
    </section>
  `;

  // --- Event handlers ---

  // Color theme options — re-render on click and apply theme
  el.querySelectorAll("[data-setting='colorTheme']").forEach((label) => {
    label.addEventListener("click", () => {
      store.actions.updateSettings({ colorTheme: label.dataset.value });
      document.documentElement.setAttribute("data-theme", label.dataset.value);
      navigate("settings");
    });
  });

  // Toggle switches
  el.querySelectorAll(".settings-switch").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      store.actions.updateSettings({ [checkbox.dataset.setting]: checkbox.checked });
    });
  });

  // Time input
  const timeInput = el.querySelector('[data-setting="reminderTime"]');
  if (timeInput) {
    timeInput.addEventListener("change", () => {
      store.actions.updateSettings({ reminderTime: timeInput.value });
    });
  }

  // Export
  el.querySelector('[data-action="export"]')?.addEventListener("click", () => {
    const json = serializePersistedState(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fishbone-review-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import
  const fileInput = el.querySelector(".settings-file-input");
  el.querySelector('[data-action="import-trigger"]')?.addEventListener("click", () => {
    fileInput.click();
  });
  fileInput?.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.version || !data.state) {
          alert("无效的备份文件格式。");
          return;
        }
        if (confirm("导入将覆盖当前所有学习数据（项目、错题、闪卡等），确定继续？")) {
          localStorage.setItem(STORAGE_KEY, reader.result);
          location.reload();
        }
      } catch {
        alert("文件解析失败，请确认是有效的 JSON 备份文件。");
      }
    };
    reader.readAsText(file);
  });

  // Change storage key
  el.querySelector('[data-action="change-key"]')?.addEventListener("click", () => {
    const newKey = el.querySelector('.settings-key-input')?.value?.trim();
    if (!newKey) return;
    if (newKey === STORAGE_KEY) return;
    if (!confirm(`将数据从 "${STORAGE_KEY}" 迁移到 "${newKey}"，刷新后生效。确定？`)) return;
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      localStorage.setItem(newKey, existing);
      localStorage.removeItem(STORAGE_KEY);
    }
    location.reload();
  });

  return el;
}
