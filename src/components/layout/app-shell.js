const fishboneDataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA6ESURBVHhe7Zp5bBzXfcedJmnqxm5aI40l8dh7jp3Znd3Z+5i9T+7FY8mlyL14iiJ3eWhLiWfWJmNbsiXLhhU3suy6cKsUERA0DmojaNraf9RB/rFroClSt0FbuAYS20XitL6T6FvMKBRWE7tNW4dwrfkAC2Lxvu83xJvfe7/j7Q03KCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKOwvp0+fJm677bbW6urq1ubm5tmdnZ3R++6771a5TqGD9fX1W9vt9sbi4uK3K+XyO5VKBSMjI5iYmECj0RA/L+/s7Gy++OKLN8rnXveI3rWxvvHi5tYWyuUyfH4/LBYrOM4CI83A5/MhGo2iVCqhVqt9++TJk5+R29gvtm+/3XN8bf3rGxsbd9x5552EfHzfOXXqlGFtbe2ZRnMJmVweHp8Ai9UOvYGERqeHTmuA0ciAZVk4HA5ks1nMz89/s91u3yS39avk1KlTN88tLE9PTM++XJ+cQq0+gebi4o+2trZMcu2+8dhj93y61Wp9b6HRRDSeAs1yMFAsejUG9Gj00OhIqNR6kDQDmmFgNNLwer0YHR3FwsJCXG7vf8r58+c/OXW0lavNNC7MzK80pheWksPDwx+X69rtuw8caRx7tn94HKF4ErFkCsFwFI1GE0vNpU25ft9YXl6uiYsXjibB2dywOnygTTYYGA4mmweeQOwtlxABxXLoUauh0+lA0bTkidVq9VuXLl36dblNOWfOnHnfM3OkPPvIaP0ohsuTqM/MY2S8/qOVlZUuua420/xy8fAkeKcApzcArxBEPJlG6/dW8fnNz4/L9fvCmTNnbpmYmHyhf6AIjxCGwxuES4gi3DeAeK70Z4VS3dva3FWNzy0LTn/062otBZ2ekLY2QRBSgHnkkUe0crudNJvNTw2OTWirs0uB6fmlw51j9ZllPlssXw4n+xFLF9CXH8RoRQxYrUinbnNzV5Mrlt822/1gOQc43g2nV0Am1//jyamZL58/f/6znfp9ozw+/tVMJgub0w2byw/O7oVdiCOaL31JrgXwaxa7/yWCYsCaOJjNZuRyOaytrZXk2k6ERMHrj2SeC8Ryr+eGxjBWn7l6XqUHRr8QThYQimdhcwdgtrnRly9i5mjT22ljbKqx0jcwBrPNA42eRq+aQCyZweKx4//nI+R/zfr6erRSqVy22x3grDwYMw8tzcEVSr/y6FNP/YZcL+IP991nNPEgKBq00YhAICCmOHfLdSKXLl36eDDb73cGYm94AnFYnX54g/FX5lqtz+1pnP74M2beC6vDDyPngMUloDBc/m651fp0p638cP1JXySNXh2Ng91asJwdQ8Njf9qp2VcAfKzRaPyVuAUtFh56wohelR5uIYqB0cm8XL9HMlPMc7wHGp0BRpaFx+PB+Pj4c+12+xNyrYgjEDsnLoro3YSJh9UpPN057g/3PefxR8Fa3SBZK7yRFIrjU1/r1LTvfvRAZqj6poHhYaBM0JMs/KEExieOXHMc7CvHjx+na7UaYrEYzJwVeoIB5/Qjnit+S67tZHBsUmX3BN4kaAaUkYHT6RKj8b89+uijvy3XJgslNe8Nv05xdlBmG1jeBY+QXNgbn22f/qw3nH7dxDnQo6Uk73IHYxguTz9XPbLiHJtaHCvVF46NlI9cDKeHoKFYUIwFaj2NVH4Iq+vbwrVP3EdWV1ejAwMD8AsC7A4XxG0ZzxZ/Mr91kpFrO7n//ic/xVhcL5GMSQokRsaERDL12oULF26Ra8OZwXVPOA3W6gJJW8BanEjlhssrKys3ZorVRjRTfJK1eaHSkuhWaXGgWw2StSAQzyCULECI5ZAqjCKZLYJz+CUP7dVRuLVbi2Cs7/X7H3qoW/7MfWN+fv7PBwcHpUBgIChYHB709R9+udy655qzR4649Xln8FkDxUCrI6SI7PEJl0tjlYpcG0nmv8jybmgIFoTRDC1pgi+SfCOYyP+LP5oB5/DhUK9OOtMOdqvR1aOBSkeCMtmkNIqxOGGye2DzhNBLsOjRU+jWGNClNiCazP4AwCflz9wXdnd3e8rl8mvxeBwUJaYlJFibC/2l+t/Ite8F7w7/CUmbQZA0SMqIRKoP9amZWqcmnitrrE7hZZV46PdocahXix6NAZzdDcbiAsny0JAsDvZorny61TjYpZJ0WgONXg0BwsjByNlhtntAMFZ0a4grdrQE3IHou9XJ2UDnM/eNlZWVIfH88/v9oEgKWh0pRb/MYPmP5Nr3wh9NH+MdHmgJEiazBXanF9FEeqxUberS/aWzQizz17wn+AO1zogD3VocEhewR4uuXp1U3ai0BNSGK950sEeHA91XFvBAl0r6Ky4gYTRBQzDQEiYwVjcosx09OhoqvRFdKgO0FItoKvPP9Y6UaN+46667QrOzs1I5RpAkVFqDtE0KpcmNTp2Y93V+3yMUz/lYq+NnesoIimZg4uwIRNMv949U/jGczIM026AjTehVG3BQXJyfe5noPXppO3PQEGZpcTQGE3o0JLrVeumjJRjYPaEXhGj2CbsQf94VSP5lPFP8fSGee5pzBkCb7dBTZlCsBd5gFJncwI+Xl4+Nnzx5kp6dnd2fLb2zs7M9NTUFm80mNQfUOgL+cAq16WN1cTyfn7w53De8FkkX/yGdH/tKODEw0Tk/OzDOWxxeiIGEpBgYTVa4/RH4QklQZod05mkNDFTilpO2p0YKEOJWtnuCiKQLb/mj+bPOQGLSJcRfFbcpwXDQ0ybwLgGxzMA1L3KPTLF6xhWMSxGddwuIJjMIRBIYr9QxP9+4vLW19b7p1wfKxsbGnNjns1gsoCgaetIIfySN8vSyVD4FEvnHfJEMLA4/GM4Jk83/5sD4zMG9+QMjk6zV6busJSgpfxQrA4vNA5c/Im01A2MFw7uhN3LoVolBQiVtT4oVI/3Q4/2lGd2erfxQ5QG7Lwya42EwmqVa3BtKfb840fzdPc0e083j3cFk/kmbJ/wf7mAc/nASbiECjz+EbGEQ5WrthXa7/ZvyeR84a2try9VqFVarFSaTCYzZCk8g+nr7zIVbilMrt9g9kVd0NAeVnkKXSg89wyOQHLj6dlfOfOVGi9P/ks5AgqRZKYc08y44hfDbnMv/qjuUfCaQyLQ8weTDNGvFoR41DvRopEojlS1+s/N/yQ7V5mzeMNSEEWarE0azDb5QCtFU/x/ccMMNH+vU7lGqLakDsdzf2r1RyWO9QgSxRB+Ozjewu7l79eX8yjhx4sRtogfa7TYwLCudgQ5f+O3V9qlDA3Otz3nDKeiNFugokxTxNKQJjmBqrdOG0xv5jp6kQRA0xJSGd/l/kiiUvLXa0tWEOlOsOjm7DxqDEV1qPQ726hGMZ1GZXrmwpzl37tJNib7+l4ycTfJA2mSVOi35gSLm55ffNycdn1k+mC6M/nEsM4j+4TJGDlfRaC69tbu7q5FrP3BOnDhRED3QbrfDarWBMprhCyffmm5sSg8X4tmTnEOQqgPxgBcbDNFs8ZqGgTsYf45mzTAyZlh4B9z+0N93josE2+1P2IXYCyzvAWnkoNJRkhemC6OXZ+dXUnu6kXJtNJHKwSuEYOKssDvdGBuvYmGheexai79IqXYkVBipPFCuzZyZazT2pzJZX19n8/mc1K43Gs3QGWhYXf53ylMrenG82Wx3B+IFGHkv7P6oWBlcU7+KmHjPE+LZSRtNsNkdsNqdz8o1IsFkoWLzRqWFEz2aNFrFiI3q1Ozz7Xb7apQfGav8xchYBcFwDMlUn+hNWFvbmL3W2oeE22+/3XfkyCzELoxeT6BHpRUT1p/1DValxFSsNnLD1ZFgcugLsexou3XPL1YnNk/kcT0pViN6sGYzUpncq0vHj9NynYgv3HfB6hago80Qo3c8XUClPvtPYrdmT3Py/PnPzB1tPjBUHP27YrH0jUbj2r7hh4oHH3xQ22w23wwGQ2BZM/QGCpzNhdHqL9/dsDiFx7WE2NISUxkKuUIBi8vLS3LdHkI0ucq7Az90+sNvD49PoDRW/6WS9g8loofNzMx8J5FIgOd5MCYOOoqB0x/9hlz7fgiR9IOUyQLSyEJnMCCTzaKxuLgt13XSX6oQg4cPG2aPrkwsrK4eko//v2J7e/tcs9kEx3HQEyQO9KpBMDxGyzMuufa94N3B+8XkVyXe2Bn0iCcT4gXTA3LdR5bTp09TS0tLr6VSaYjRVEcyMBgtohd+d23trt+R6+WYncJFsfWk0uqg1ekQiUYxNTN1Tq77SLO1tfWHYj7o9gmwOTwgaBP0tBkOX/Tp8Wbzt+T6Tpy+6EO0mYdar4eBICC+iIVm84ty3Ueas2fPuqanp99NpNJXKgrySv3aa2DgEKLPF8cnSfmcPfyRxC5jsaFXq0OvSoNQMCz+7OMRue4jz8bGxvb8QgM2hxusmZcan10asV1khtUV+mFmqLL98MNfu1k+z+YLPCRewIt3I2JnOtOXxcrKyn1y3XXB2sbGxcmpGbh8AZh4O0iWk3p1Kj0NsaNsdQW/5xSSC6n+fl2xeqSrNr1o8wRi/2qy2GEUqxHWhJGREra328ty29cFTz311E3Lx1qXBosjsDk9UtNTLf6cQ0tI3RSxEaolWLHB+a6J976R6Bv4qXh7RzMcWLMFnIVHrVb/6blz56RK5rplUexU1ycvi+WU2WIHzVqkOpmgWJBih1hHg+EccHgCV7ovHj+cLjcKhQJardYTcnvXJcurq8Lc0flXhoZLsNpd0uKJPT+aMYOkTdLtndiBDkUSqNQmUBweweTk5Fdbc3NXL8uve+69915m9fjapdGxsXdyhQEEI3HwDhesdgecbh+EYBSzR45ia3v7S3fccUdYPl/h59x99/26jY2t+vKx1hOVWv3fh0ujGB4pYXFx+fut1mpLrlf4Lzh9+nTP+vp6eGdrh7t48eJ/W6koKCgoKCgoKCgoKCgoKCgoKCgoKCgoKLwX/wkpTDYJsNSnVQAAAABJRU5ErkJggg==";
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
            ? '<span class="fishbone-stamp"><img src="' + fishboneDataUri + '" alt="打卡印章" /></span> 今日已打卡'
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
