function stickerMarkup(index) {
  const labels = ["done", "gold", "focus", "ace"];
  return `<span class="checkin-sticker sticker-${(index % 4) + 1}">${labels[index % labels.length]}</span>`;
}

export function renderCheckin(store) {
  const state = store.getState();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = new Date(year, month + 1, 0).getDate();

  const el = document.createElement("div");
  el.className = "stack-layout";

  const completedSet = new Set(state.studyLog.map((entry) => entry.date.slice(0, 10)));
  const dayCells = Array.from({ length: days }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    const dateKey = `${state.checkin.today.slice(0, 8)}${day}`;
    const isDone = completedSet.has(dateKey);
    const isToday = dateKey === state.checkin.today;
    return `
      <div class="calendar-cell ${isDone ? "done" : ""} ${isToday ? "today" : ""}">
        <span class="calendar-number">${index + 1}</span>
        ${isDone ? stickerMarkup(index) : ""}
      </div>
    `;
  }).join("");

  el.innerHTML = `
    <section class="paper-panel">
      <div class="reading-header">
        <div>
          <p class="label">Check-in Calendar</p>
          <h3>${state.checkin.isCheckedIn ? "今日已打卡" : "今日未打卡"}</h3>
        </div>
        <p>${state.checkin.completedActions.length} 个有效学习动作</p>
      </div>
      <div class="calendar-grid">${dayCells}</div>
      <ul class="activity-list">
        ${state.checkin.completedActions
          .map((item) => `<li>${new Date(item.date).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} · ${item.title}</li>`)
          .join("")}
      </ul>
    </section>
  `;

  return el;
}
