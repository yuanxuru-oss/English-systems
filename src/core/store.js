import { evaluateCheckinStatus } from "./checkin.js";
import { createHighlighter } from "./highlighter.js";
import { parseTemplateBlock } from "./parser.js";

export function createStore(initialState, options = {}) {
  let state = structuredClone(initialState);

  function commit() {
    options.persist?.(state);
  }

  const actions = {
    setRoute(route, payload = {}) {
      state.route = route;
      state.routePayload = payload;
      commit();
    },
    selectProject(projectId) {
      state.currentProjectId = projectId;
      commit();
    },
    selectFolder(folderId) {
      state.currentFolderId = folderId;
      commit();
    },
    createFolder(title = "新模拟卷") {
      const project = getCurrentProject();
      if (!project) return null;
      const folderNum = (project.folders || []).length + 1;
      const newFolder = {
        id: `folder-${Date.now()}`,
        title: `${title} ${folderNum}`,
        description: "新创建的模拟卷文件夹。",
        modules: [],
      };
      project.folders.push(newFolder);
      state.currentFolderId = newFolder.id;
      commit();
      return newFolder;
    },
    renameFolder(folderId, newTitle) {
      const folder = getFolderById(folderId);
      if (folder) {
        folder.title = newTitle;
        commit();
      }
    },
    deleteFolder(folderId) {
      const project = getCurrentProject();
      if (!project || project.folders.length <= 1) return;
      project.folders = project.folders.filter((f) => f.id !== folderId);
      if (state.currentFolderId === folderId) {
        state.currentFolderId = project.folders[0]?.id || null;
      }
      commit();
    },
    submitReadingAnswers(moduleId, answers) {
      submitAnswers(moduleId, answers, "reading-practice");
    },
    addMistakeNote(mistakeId, note) {
      const record = state.mistakes.find((item) => item.id === mistakeId);
      if (record) {
        record.note = note;
        commit();
      }
    },
    toggleMistakeMastered(mistakeId) {
      const record = state.mistakes.find((item) => item.id === mistakeId);
      if (record) {
        record.mastered = !record.mastered;
        record.status = record.mastered ? "mastered" : "reviewing";
        commit();
      }
    },
    addMistakeToFlashcards(mistakeId) {
      const record = state.mistakes.find((item) => item.id === mistakeId);
      if (!record) return;

      const exists = state.flashcards.some((card) => card.word.toLowerCase() === record.answer.toLowerCase());
      if (!exists) {
        state.flashcards.unshift({
          id: `flash-${record.itemId}`,
          word: record.answer,
          pos: "—",
          zh: "待补充释义",
          context: record.prompt,
          mastered: false,
        });
        commit();
      }
    },
    markFlashcard(cardId, mastered) {
      const card = state.flashcards.find((item) => item.id === cardId);
      if (card) {
        card.mastered = mastered;
      }

      state.studyLog.unshift({
        id: `log-${Date.now()}`,
        type: "flashcards",
        projectId: state.currentProjectId,
        date: new Date().toISOString(),
        title: "闪卡复习",
      });

      actions.refreshCheckin();
      commit();
    },
    importTemplateBlock(raw) {
      const parsed = parseTemplateBlock(raw);
      state.importPreview = parsed;
      return parsed;
    },
    applyImportPreview() {
      if (!state.importPreview) return;

      const folder = getCurrentFolder();

      if (state.importPreview.type === "vocabulary") {
        const existingWords = new Set(state.flashcards.map((card) => card.word.toLowerCase()));
        const toAdd = (state.importPreview.vocabulary || []).filter(
          (item) => !existingWords.has(item.word.toLowerCase())
        );
        state.flashcards.push(...toAdd);
      } else {
        if (folder) {
          folder.modules.push(state.importPreview);
        }
      }

      state.importPreview = null;
      commit();
    },
    refreshCheckin() {
      state.checkin = evaluateCheckinStatus(state.studyLog);
    },
    getHighlightedReading(moduleId) {
      const module = getModuleById(moduleId);
      return createHighlighter(state.cetVocabulary, state.projectKeywords)(module.passage);
    },
    submitListeningAnswers(moduleId, answers) {
      submitAnswers(moduleId, answers, "listening-practice");
    },
    resetModuleAnswers(moduleId) {
      const module = getModuleById(moduleId);
      if (module) {
        module.items = module.items.map((item) => ({
          ...item,
          userAnswer: "",
          isCorrect: null,
        }));
        commit();
      }
    },
  };

  function getCurrentProject() {
    return state.projects.find((project) => project.id === state.currentProjectId);
  }

  function getCurrentFolder() {
    const project = getCurrentProject();
    if (!project || !project.folders || !Array.isArray(project.folders)) return null;
    return project.folders.find((f) => f.id === state.currentFolderId) || project.folders[0] || null;
  }

  function getFolderById(folderId) {
    const project = getCurrentProject();
    if (!project || !project.folders) return null;
    return project.folders.find((f) => f.id === folderId) || null;
  }

  function getModuleById(moduleId) {
    for (const project of state.projects) {
      for (const folder of project.folders || []) {
        const found = folder.modules.find((module) => module.id === moduleId);
        if (found) return found;
      }
    }
    return null;
  }

  /** Shared answer-submission pipeline for reading & listening. */
  function submitAnswers(moduleId, answers, logType) {
    const module = getModuleById(moduleId);
    const sourceText = module.transcript || module.passage || "";
    const mistakes = [];

    module.items = module.items.map((item) => {
      const userAnswer = (answers[item.id] || "").trim().toLowerCase();
      const correct = item.answer.toLowerCase();
      const isCorrect = userAnswer === correct;
      const promptText = item.question || item.prompt || "";

      if (!isCorrect) {
        mistakes.push({
          id: `mistake-${item.id}`,
          moduleId,
          itemId: item.id,
          prompt: promptText,
          userAnswer,
          answer: item.answer,
          errorCount: 1,
          note: "",
          mastered: false,
          status: "unmastered",
          sourceSentence: sourceText,
        });
      }

      return { ...item, userAnswer, isCorrect, checkedAt: new Date().toISOString() };
    });

    const existingIds = new Set(state.mistakes.map((item) => item.itemId));
    mistakes.forEach((entry) => {
      const existing = state.mistakes.find((item) => item.itemId === entry.itemId);
      if (existing) {
        existing.errorCount += 1;
        existing.userAnswer = entry.userAnswer;
        existing.mastered = false;
        existing.status = "reviewing";
      } else if (!existingIds.has(entry.itemId)) {
        state.mistakes.push(entry);
      }
    });

    state.studyLog.unshift({
      id: `log-${Date.now()}`,
      type: logType,
      moduleId,
      projectId: state.currentProjectId,
      date: new Date().toISOString(),
      title: module.title,
    });

    actions.refreshCheckin();
    commit();
  }

  actions.setUserName = function (name) {
    state.userName = name ? name.trim() : "";
    commit();
  };

  return {
    getState() {
      return state;
    },
    getCurrentFolder() {
      return getCurrentFolder();
    },
    getModuleById(moduleId) {
      return getModuleById(moduleId);
    },
    actions,
  };
}
