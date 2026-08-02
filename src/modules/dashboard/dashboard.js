import { icon } from "../../components/icons.js";
import { renderFishProgress, bindFishStepper } from "../../components/fish-progress.js";

function moduleIcon(type) {
  return `<span class="module-spot-icon">${icon(type)}</span>`;
}

function formatDay(date) {
  return date.toISOString().slice(0, 10);
}

function getDashboardStats(studyLog, mistakes, flashcards) {
  const studyDays = new Set((studyLog || []).map((entry) => entry.date.slice(0, 10)));
  const cursor = new Date();
  let streak = 0;
  while (studyDays.has(formatDay(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weeklyActions = (studyLog || []).filter((entry) => new Date(entry.date) >= weekStart).length;
  const pendingCards = (flashcards || []).filter((card) => !card.mastered).length;

  return { streak, weeklyActions, pendingCards, pendingMistakes: mistakes?.length || 0 };
}

function getTodayFocus(stats, state) {
  if (!state.checkin?.isCheckedIn) {
    return { route: "reading", title: "先完成一项练习，点亮今天", copy: "从阅读、听力或翻译里任选一个开始，完成后会自动打卡。", action: "开始练习" };
  }
  if (stats.pendingMistakes > 0) {
    return { route: "mistakes", title: `回顾 ${stats.pendingMistakes} 条错题`, copy: "把今天遇到的问题变成下一次更稳的答案。", action: "查看错题" };
  }
  if (stats.pendingCards > 0) {
    return { route: "flashcards", title: `巩固 ${stats.pendingCards} 张闪卡`, copy: "用几分钟复习核心词，让记忆更牢。", action: "去复习闪卡" };
  }
  return { route: "project", title: "今天的任务已完成", copy: "可以继续挑战下一套练习，或导入新的复习内容。", action: "继续学习" };
}

export function renderDashboard(store, navigate) {
  const state = store.getState();
  const project = state.projects.find((item) => item.id === state.currentProjectId) ?? state.projects[0];
  const fishSteps = state.settings?.fishSteps || [];
  const fishProgress = fishSteps.length;
  const stats = getDashboardStats(state.studyLog, state.mistakes, state.flashcards);
  const focus = getTodayFocus(stats, state);

  const el = document.createElement("div");
  el.className = "page-grid";
  el.innerHTML = `
    <section class="hero-panel paper-panel">
      <div class="hero-copy">
        <p class="label">今天的英语复习</p>
        <h3>把每一次练习，变成看得见的进步。</h3>
        <p>从听力、阅读或翻译开始。做错的题会自动回收到错题笔记和闪卡，让下一次练习更有把握。</p>
        <div class="hero-actions">
          <button class="primary-btn" data-action="open-project">继续学习</button>
          <button class="secondary-btn" data-action="open-import">导入内容</button>
        </div>
      </div>
      <div class="hero-illustration" aria-hidden="true">
        <div class="hero-sticker">sketch study board</div>
        <div class="hero-sheet">
          <div class="hero-doodle-head">
            <span class="hero-dot"></span>
            <span class="hero-dot"></span>
            <span class="hero-dot"></span>
          </div>
          <div class="hero-doodle-rows">
            <div class="hero-doodle-card">
              <strong>LISTEN</strong>
              <small>exam mode → intensive mode</small>
            </div>
            <div class="hero-doodle-card">
              <strong>READ</strong>
              <small>fill in blanks + keyword highlight</small>
            </div>
            <div class="hero-doodle-card">
              <strong>NOTE</strong>
              <small>mistake board + flashcards</small>
            </div>
            <div class="hero-doodle-card">
              <strong>CHECK</strong>
              <small>daily calendar + stickers</small>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="study-path" aria-label="学习流程">
      <button type="button" data-action="open-import"><span>01</span>导入内容</button>
      <i aria-hidden="true"></i>
      <button type="button" data-action="open-reading"><span>02</span>开始练习</button>
      <i aria-hidden="true"></i>
      <button type="button" data-action="open-mistakes"><span>03</span>错题回收</button>
      <i aria-hidden="true"></i>
      <button type="button" data-action="open-flashcards"><span>04</span>闪卡巩固</button>
    </section>
    <section class="today-focus" aria-label="今日建议">
      <div>
        <p class="label">今日建议</p>
        <h4>${focus.title}</h4>
        <p>${focus.copy}</p>
      </div>
      <button class="primary-btn" type="button" data-action="open-focus">${focus.action}</button>
    </section>
    ${renderFishProgress(store, navigate)}
    <section class="panel-row">
      <article class="paper-panel stat-panel">
        <p class="label">最近项目</p>
        <h4>${project.title}</h4>
        <p>${project.description}</p>
      </article>
      <article class="paper-panel stat-panel">
        <p class="label">连续打卡</p>
        <h4>${stats.streak} 天</h4>
        <p>${state.checkin.isCheckedIn ? "今天已经点亮，继续保持这个节奏。" : "完成一项练习，就能点亮今天。"}</p>
      </article>
      <article class="paper-panel stat-panel">
        <p class="label">本周完成</p>
        <h4>${stats.weeklyActions} 次</h4>
        <p>每一次提交、核对与闪卡复习都会记录在这里。</p>
      </article>
      <article class="paper-panel stat-panel">
        <p class="label">待巩固内容</p>
        <h4>${stats.pendingMistakes + stats.pendingCards} 项</h4>
        <p>${stats.pendingMistakes} 条错题，${stats.pendingCards} 张待复习闪卡。</p>
      </article>
    </section>
    <section class="panel-row">
      <article class="paper-panel module-card listening">
        ${moduleIcon("listening")}
        <p class="label">听力</p>
        <h4>原题练习 + 精听层</h4>
        <p>主练习不高亮，精听挖空阶段再高亮重点词。</p>
      </article>
      <article class="paper-panel module-card reading">
        ${moduleIcon("reading")}
        <p class="label">阅读</p>
        <h4>完型 / 选词 / 词汇高亮</h4>
        <p>文章、选项、解析和错题页统一接入范围词高亮。</p>
      </article>
      <article class="paper-panel module-card notebook">
        ${moduleIcon("notebook")}
        <p class="label">错题笔记</p>
        <h4>从错题直达再练与闪卡</h4>
        <p>形成做题、复盘、再练、背词与打卡的闭环。</p>
      </article>
    </section>
  `;

  el.querySelector('[data-action="open-project"]').addEventListener("click", () => navigate("project"));
  el.querySelectorAll('[data-action="open-import"]').forEach((button) => button.addEventListener("click", () => navigate("import")));
  el.querySelector('[data-action="open-reading"]').addEventListener("click", () => navigate("reading"));
  el.querySelector('[data-action="open-mistakes"]').addEventListener("click", () => navigate("mistakes"));
  el.querySelector('[data-action="open-flashcards"]').addEventListener("click", () => navigate("flashcards"));
  el.querySelector('[data-action="open-focus"]').addEventListener("click", () => navigate(focus.route));

  bindFishStepper(el, navigate);

  return el;
}
