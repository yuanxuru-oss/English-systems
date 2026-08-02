# 🐟 鱼骨头英语复习系统

> 把英语啃的只剩鱼骨头。

一个面向英语训练的纯前端复习系统。以项目为中心，按试卷文件夹组织学习内容，支持听力、阅读、翻译、词汇、闪卡、错题等模块，数据完全本地化，无需后端。

**[🔗 在线使用](https://yuanxuru-oss.github.io/English-systems/review-system/)**

在线版与桌面版均只在用户自己的设备保存学习数据。需要在两个版本或不同设备之间迁移时，请使用设置页的「导出学习数据」和「导入学习数据」。

---

## ✨ 功能

| 模块 | 说明 |
|------|------|
| 📋 **仪表盘** | 复习流程步骤条（鱼骨进度）、今日打卡、错题统计 |
| 📁 **项目总览** | 文件夹式管理，支持新建/重命名/删除文件夹和模块 |
| 📥 **导入中心** | 模板快速导入听力、阅读、翻译、词汇等内容 |
| 🎧 **听力练习** | 音频播放器 + 精听训练层（挖空、关键词高亮） |
| 📖 **阅读练习** | 填空练习 + 阅读理解，支持切换模式 |
| ✍️ **翻译练习** | 中译英，答案核对含关键词匹配率评分 |
| 📝 **词汇表** | 单词列表 + 标记掌握 + 一键加入闪卡 |
| 🃏 **闪卡词库** | 卡片翻转记忆 |
| 📋 **错题笔记** | 错题汇总，支持笔记、再练、掌握状态追踪 |
| 📅 **打卡日历** | 完成学习动作自动打卡，打卡印章动画 |
| 🎨 **主题色系** | 5 套主题：基础色 / 暗夜 / 森林绿 / 海洋蓝 / 樱花粉 |
| ⚙️ **设置** | 自定义存储键、导出/导入数据、每日提醒 |
| 📝 **随手笔记** | `Ctrl+Shift+N` 弹窗，自动保存 |

### 🐟 鱼骨进度

首页复习流程步骤条：每完成一个模块，对应步骤亮起。六个模块全部完成后，鱼骨头 logo 亮起霓虹灯效果。

```
🐟(logo) → 🎧听力 → 📖阅读 → ✍️翻译 → 📝词汇 → 🃏闪卡 → 📋错题
```

---

## 🛠 技术栈

- **Vanilla JavaScript** (ES Modules)
- **localStorage** 持久化，键 `review-system:v2`
- **Node built-in test runner** (TDD)
- **单文件构建** — 所有 JS/CSS 内联为一个 HTML
- **dist 桌面构建产物** — 供 Tauri 打包使用
- **Tauri 桌面壳骨架** — 供本地桌面应用迭代
- **GitHub Pages** 部署

---

## 🚀 本地运行

```bash
# 克隆仓库
git clone https://github.com/yuanxuru-oss/English-systems.git
cd English-systems

# 直接用浏览器打开
start index.html

# 或启动本地服务器
npx serve .
```

---

## 🧪 测试

```bash
node --test tests/*.test.js
```

---

## 📦 构建部署

```bash
# 生成单文件预览
node build-preview.cjs

# 输出:
# - preview.html（可直接部署到任意静态托管）
# - dist/index.html（供 Tauri 打包）
```

## 🚀 发布版本

版本号只在 `package.json` 修改，使用 `主版本.功能版本.修复版本`：

- `1.2.1`：修复问题或微调体验
- `1.3.0`：新增学习者可用的功能
- `2.0.0`：产品架构发生明显变化

推送 `main` 会自动更新在线版；推送 `v1.2.0` 形式的 Git 标签会自动生成 Windows EXE，并发布到 GitHub Releases。

## Desktop Packaging

This repo now includes a Tauri-ready structure under `src-tauri/`.

Before packaging on Windows, install the official Tauri prerequisites:
- Rust / Cargo
- Visual Studio C++ build tools

Docs:
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
- [Tauri Windows bundling](https://v2.tauri.app/distribute/windows-installer/)

---

## 📂 项目结构

```
review-system/
├── index.html              # 入口 HTML
├── build-preview.js        # 构建脚本
├── .gitignore
├── src/
│   ├── app.js              # 路由 & 应用初始化
│   ├── core/
│   │   ├── store.js        # 状态管理
│   │   ├── persistence.js  # localStorage 持久化
│   │   ├── parser.js       # 内容解析器
│   │   ├── highlighter.js  # 关键词高亮
│   │   └── checkin.js      # 打卡逻辑
│   ├── data/
│   │   └── seed.js         # 初始种子数据
│   ├── components/
│   │   ├── layout/app-shell.js  # 侧边栏 + 顶栏布局
│   │   ├── audio-player.js      # 音频播放器
│   │   ├── icons.js             # SVG 图标系统
│   │   ├── quick-note.js        # 随手笔记
│   │   └── fish-progress.js     # 鱼骨进度步骤条
│   ├── modules/
│   │   ├── dashboard/      # 仪表盘
│   │   ├── project/        # 项目总览
│   │   ├── import/         # 导入中心
│   │   ├── listening/      # 听力练习 + 精听层
│   │   ├── reading/        # 阅读练习
│   │   ├── translation/    # 翻译练习
│   │   ├── vocabulary/     # 词汇表
│   │   ├── flashcards/     # 闪卡词库
│   │   ├── mistakes/       # 错题笔记
│   │   ├── checkin/        # 打卡日历
│   │   ├── profile/        # 个人中心
│   │   ├── settings/       # 设置
│   │   └── shared/         # 共享组件
│   └── styles/
│       ├── base.css        # CSS 变量 & 主题
│       ├── theme.css       # 布局 & 组件样式
│       ├── components.css  # 通用组件
│       └── modules.css     # 模块样式
└── tests/
    ├── store.test.js
    ├── persistence.test.js
    ├── parser.test.js
    ├── highlighter.test.js
    └── plan-preview.test.js
```

---

## 📄 License


<p align="center">🐟 — 啃完英语，只剩鱼骨头 — 🦴</p>
