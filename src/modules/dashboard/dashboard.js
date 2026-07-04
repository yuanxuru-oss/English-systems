import { icon } from "../../components/icons.js";

function moduleIcon(type) {
  return `<span class="module-spot-icon">${icon(type)}</span>`;
}

export function renderDashboard(store, navigate) {
  const state = store.getState();
  const project = state.projects.find((item) => item.id === state.currentProjectId) ?? state.projects[0];

  const el = document.createElement("div");
  el.className = "page-grid";
  el.innerHTML = `
    <section class="hero-panel paper-panel">
      <div class="hero-copy">
        <p class="label">Portfolio-inspired study hub</p>
        <h3>把英语原题、精听、错题、闪卡和打卡，整理成一套可持续迭代的复习作品。</h3>
        <p>第一版先跑通项目中心、模板导入、阅读练习、错题联动、闪卡与打卡。听力精听层和更完整的原题解析，后续继续接入。</p>
        <div class="hero-actions">
          <button class="primary-btn" data-action="open-project">继续当前项目</button>
          <button class="secondary-btn" data-action="open-import">导入新内容</button>
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
    <section class="panel-row">
      <article class="paper-panel stat-panel">
        <p class="label">最近项目</p>
        <h4>${project.title}</h4>
        <p>${project.description}</p>
      </article>
      <article class="paper-panel stat-panel">
        <p class="label">今日动作</p>
        <h4>${state.checkin.completedActions.length} 次</h4>
        <p>完成任意有效学习动作，即可自动打卡。</p>
      </article>
      <article class="paper-panel stat-panel">
        <p class="label">错题池</p>
        <h4>${state.mistakes.length} 条</h4>
        <p>支持笔记、再练、加入闪卡与掌握状态追踪。</p>
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
  el.querySelector('[data-action="open-import"]').addEventListener("click", () => navigate("import"));

  return el;
}
