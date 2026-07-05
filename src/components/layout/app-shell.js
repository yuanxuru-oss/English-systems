import { icon } from "../icons.js";

function navItem(route, label, iconName) {
  return `
    <button data-route="${route}" class="nav-pill">
      ${icon(iconName)}
      <span>${label}</span>
    </button>
  `;
}

export function createAppShell(store, navigate) {
  const state = store.getState();
  const project = state.projects.find((item) => item.id === state.currentProjectId) ?? state.projects[0];

  const shell = document.createElement("div");
  shell.className = "app-shell";
  shell.innerHTML = `
    <aside class="sidebar">
      <div class="paper-noise"></div>
      <div class="brand-block">
        <p class="brand-kicker">REVIEW ATELIER</p>
        <h1>鱼骨头英语复习系统</h1>
        <p class="brand-copy">把英语啃的只剩鱼骨头。</p>
      </div>
      <div class="sidebar-sketch">
        <div class="sketch-badge">${icon("user")} ${state.userName || "我的"}学习空间</div>
        <div class="sketch-profile-stats">
          <div class="sketch-stat">
            <span class="sketch-stat-num">${state.studyLog ? new Set(state.studyLog.map(e => e.date.slice(0,10))).size : 0}</span>
            <span class="sketch-stat-label">学习天数</span>
          </div>
          <div class="sketch-stat">
            <span class="sketch-stat-num">${state.flashcards ? state.flashcards.filter(c => c.mastered).length : 0}/${state.flashcards?.length || 0}</span>
            <span class="sketch-stat-label">已掌握闪卡</span>
          </div>
          <div class="sketch-stat">
            <span class="sketch-stat-num">${state.mistakes?.length || 0}</span>
            <span class="sketch-stat-label">错题积累</span>
          </div>
          <div class="sketch-stat">
            <span class="sketch-stat-num ${state.checkin?.isCheckedIn ? 'is-checked' : ''}">${state.checkin?.isCheckedIn ? '✓' : '—'}</span>
            <span class="sketch-stat-label">今日打卡</span>
          </div>
        </div>
      </div>
      <nav class="nav-list">
        ${navItem("dashboard", "首页", "dashboard")}
        ${navItem("project", "项目总览", "project")}
        ${navItem("import", "导入中心", "import")}
        ${navItem("listening", "听力练习", "listening")}
        ${navItem("reading", "阅读练习", "reading")}
        ${navItem("translation", "翻译练习", "import")}
        ${navItem("vocabulary", "词汇表", "flashcards")}
        ${navItem("mistakes", "错题笔记", "mistakes")}
        ${navItem("flashcards", "闪卡词库", "flashcards")}
        ${navItem("checkin", "打卡日历", "checkin")}
        ${navItem("profile", "个人中心", "user")}
        ${navItem("settings", "设置", "gear")}
      </nav>
      <div class="project-chip">
        ${icon("pin")}
        <div>
          <span>当前项目</span>
          <strong>${project?.title ?? "未选择项目"}</strong>
        </div>
      </div>
      <div class="version-badge">v1.0.0</div>
    </aside>
    <main class="main-panel">
      <header class="topbar">
        <div>
          <h2>${project?.title ?? "英语复习"}</h2>
        </div>
        <div class="checkin-state ${state.checkin.isCheckedIn ? "is-checked" : ""}">
          ${state.checkin.isCheckedIn
            ? '<span class="fishbone-stamp"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" class="stamp-svg"><ellipse cx="16" cy="24" rx="8" ry="6" fill="var(--accent-soft)" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="11" cy="22" r="1.5" fill="currentColor"/><line x1="24" y1="24" x2="42" y2="24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="28" y1="24" x2="33" y2="17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="28" y1="24" x2="33" y2="31" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="32" y1="24" x2="36" y2="18" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="32" y1="24" x2="36" y2="30" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="36" y1="24" x2="39" y2="19" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><line x1="36" y1="24" x2="39" y2="29" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M42 24 L46 20 L44 24 L46 28 Z" fill="var(--accent-soft)" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg></span> 今日已打卡'
            : "今日未打卡"}
        </div>
      </header>
      <section data-shell-content></section>
    </main>
  `;

  shell.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.route));
  });

  return shell;
}
