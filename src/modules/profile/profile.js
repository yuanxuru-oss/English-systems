export function renderProfile(store, navigate) {
  const state = store.getState();
  const el = document.createElement("div");
  el.className = "stack-layout";

  const totalStudyDays = new Set(state.studyLog.map((entry) => entry.date.slice(0, 10))).size;
  const totalActions = state.studyLog.length;
  const totalMistakes = state.mistakes.length;
  const totalFlashcards = state.flashcards.length;
  const masteredFlashcards = state.flashcards.filter((card) => card.mastered).length;
  const userName = state.userName || "";
  const isLoggedIn = state.userName && state.userName.trim().length > 0;

  el.innerHTML = `
    <section class="paper-panel profile-layout">
      <div class="profile-header">
        <div class="profile-avatar">
          <svg viewBox="0 0 24 24" aria-hidden="true" style="width:48px;height:48px">
            <path d="M17.2 20v-1.3c0-2-1.5-3.6-3.5-3.6h-3.4c-2 0-3.5 1.6-3.5 3.6V20" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="9" r="3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
          </svg>
        </div>
        <div>
          <p class="label">Personal Center</p>
          <h3>${isLoggedIn ? `${userName}的学习空间` : "我的学习空间"}</h3>
          <p>你的复习进度与数据总览。</p>
        </div>
      </div>

      <hr class="sketch-divider" />

      <div class="profile-stats">
        <article class="stat-card">
          <p class="stat-number">${totalStudyDays}</p>
          <p class="stat-label">学习天数</p>
        </article>
        <article class="stat-card">
          <p class="stat-number">${totalActions}</p>
          <p class="stat-label">学习动作</p>
        </article>
        <article class="stat-card">
          <p class="stat-number">${totalMistakes}</p>
          <p class="stat-label">错题积累</p>
        </article>
        <article class="stat-card">
          <p class="stat-number">${masteredFlashcards}/${totalFlashcards}</p>
          <p class="stat-label">闪卡掌握</p>
        </article>
      </div>

      <div class="profile-section">
        <p class="label">账号设置</p>
        ${isLoggedIn ? `
          <div class="login-card">
            <div class="login-card-header">
              <span>👤 已登录</span>
              <span class="text-muted">用户名：${userName}</span>
            </div>
            <p>你的学习数据保存在此浏览器中，可以在不同试卷间自由切换。</p>
            <button class="secondary-btn" data-action="logout">退出登录</button>
          </div>
        ` : `
          <div class="login-card">
            <p class="label">设置你的用户名</p>
            <p>输入一个名字来标识你的学习空间。数据仍保存在本地浏览器中。</p>
            <div class="login-form">
              <input type="text" class="profile-name-input" placeholder="输入你的名字…" maxlength="20" />
              <button class="primary-btn" data-action="login">确认</button>
            </div>
          </div>
        `}
      </div>

      <div class="profile-section">
        <p class="label">数据管理</p>
        <div class="hero-actions">
          <button class="secondary-btn" data-action="export">导出学习数据 (JSON)</button>
          <button class="secondary-btn" data-action="clear">清除本地数据</button>
        </div>
      </div>
    </section>
  `;

  // Login handler
  if (!isLoggedIn) {
    const loginBtn = el.querySelector('[data-action="login"]');
    const nameInput = el.querySelector('.profile-name-input');
    if (loginBtn && nameInput) {
      loginBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (!name) {
          nameInput.focus();
          return;
        }
        store.actions.setUserName(name);
      });
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const name = nameInput.value.trim();
          if (name) store.actions.setUserName(name);
        }
      });
    }
  } else {
    const logoutBtn = el.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (confirm("确定要退出登录吗？数据仍会保留在本地。")) {
          store.actions.setUserName("");
        }
      });
    }
  }

  el.querySelector('[data-action="export"]').addEventListener("click", () => {
    const data = JSON.stringify(
      {
        projects: state.projects,
        mistakes: state.mistakes,
        flashcards: state.flashcards,
        studyLog: state.studyLog,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-system-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  el.querySelector('[data-action="clear"]').addEventListener("click", () => {
    if (confirm("确定要清除所有本地学习数据吗？此操作不可恢复。")) {
      localStorage.removeItem("review-system:v2");
      localStorage.removeItem("review-system:v1");
      location.reload();
    }
  });

  return el;
}
