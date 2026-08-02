import { evaluateCheckinStatus } from "./checkin.js";
import { createHighlighter } from "./highlighter.js";
import { parseTemplateBlock } from "./parser.js";

export function createStore(initialState, options = {}) {
  let state = structuredClone(initialState);
  const analytics = options.analytics || {};

  function commit() {
    options.persist?.(state);
  }

  function track(eventName, properties = {}) {
    analytics.track?.(eventName, properties);
  }

  function getModuleContext(moduleId) {
    for (const project of state.projects) {
      for (const folder of project.folders || []) {
        const module = folder.modules.find((item) => item.id === moduleId);
        if (module) {
          return { project, folder, module };
        }
      }
    }
    return { project: null, folder: null, module: null };
  }

  const actions = {
    setRoute(route, payload = {}) {
      state.route = route;
      state.routePayload = payload;
      track("route_changed", { route });
      commit();
    },
    selectProject(projectId) {
      state.currentProjectId = projectId;
      track("project_selected", { project_id: projectId, route: state.route });
      commit();
    },
    selectFolder(folderId) {
      state.currentFolderId = folderId;
      track("folder_selected", {
        project_id: state.currentProjectId,
        folder_id: folderId,
        route: state.route,
      });
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
      track("folder_created", {
        project_id: project.id,
        folder_id: newFolder.id,
        folder_title: newFolder.title,
        route: state.route,
      });
      commit();
      return newFolder;
    },
    renameFolder(folderId, newTitle) {
      const folder = getFolderById(folderId);
      if (folder) {
        const previousTitle = folder.title;
        folder.title = newTitle;
        track("folder_renamed", {
          project_id: state.currentProjectId,
          folder_id: folderId,
          previous_title: previousTitle,
          next_title: newTitle,
          route: state.route,
        });
        commit();
      }
    },
    deleteFolder(folderId) {
      const project = getCurrentProject();
      if (!project || project.folders.length <= 1) return;
      const folder = getFolderById(folderId);
      project.folders = project.folders.filter((f) => f.id !== folderId);
      if (state.currentFolderId === folderId) {
        state.currentFolderId = project.folders[0]?.id || null;
      }
      track("folder_deleted", {
        project_id: project.id,
        folder_id: folderId,
        folder_title: folder?.title,
        route: state.route,
      });
      commit();
    },
    submitReadingAnswers(moduleId, answers) {
      submitAnswers(moduleId, answers, "reading-practice");
    },
    addMistakeNote(mistakeId, note) {
      const record = state.mistakes.find((item) => item.id === mistakeId);
      if (record) {
        record.note = note;
        track("mistake_note_saved", {
          mistake_id: mistakeId,
          module_id: record.moduleId,
          item_id: record.itemId,
          note_length: note.trim().length,
          route: state.route,
        });
        commit();
      }
    },
    toggleMistakeMastered(mistakeId) {
      const record = state.mistakes.find((item) => item.id === mistakeId);
      if (record) {
        record.mastered = !record.mastered;
        record.status = record.mastered ? "mastered" : "reviewing";
        track("mistake_mastery_toggled", {
          mistake_id: mistakeId,
          module_id: record.moduleId,
          item_id: record.itemId,
          mastered: record.mastered,
          route: state.route,
        });
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
        track("mistake_added_to_flashcards", {
          mistake_id: mistakeId,
          module_id: record.moduleId,
          item_id: record.itemId,
          word: record.answer,
          route: state.route,
        });
        commit();
      }
    },
    markFlashcard(cardId, mastered) {
      const card = state.flashcards.find((item) => item.id === cardId);
      if (card) {
        card.mastered = mastered;
        track("flashcard_reviewed", {
          card_id: cardId,
          word: card.word,
          mastered,
          route: state.route,
        });
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
    saveTranslationDraft(moduleId, answers) {
      const { module } = getModuleContext(moduleId);
      if (!module || !Array.isArray(module.items)) return;

      module.items = module.items.map((item) => ({
        ...item,
        userAnswer: answers[item.id] ?? item.userAnswer ?? "",
      }));

      state.studyLog.unshift({
        id: `log-${Date.now()}`,
        type: "translation",
        moduleId,
        projectId: state.currentProjectId,
        date: new Date().toISOString(),
        title: module.title,
      });

      actions.refreshCheckin();
      track("translation_saved", {
        route: state.route,
        module_id: moduleId,
        total_items: module.items.length,
      });
      commit();
    },
    checkTranslationAnswers(moduleId, answers, threshold = 50) {
      const { project, folder, module } = getModuleContext(moduleId);
      if (!module || !Array.isArray(module.items)) return null;

      let matchedCount = 0;
      module.items = module.items.map((item) => {
        const userAnswer = answers[item.id] ?? item.userAnswer ?? "";
        const isCorrect = estimateTranslationMatch(userAnswer, item.reference) >= threshold;
        if (isCorrect) matchedCount += 1;
        return {
          ...item,
          userAnswer,
          isCorrect,
        };
      });

      state.studyLog.unshift({
        id: `log-${Date.now()}`,
        type: "translation",
        moduleId,
        projectId: state.currentProjectId,
        date: new Date().toISOString(),
        title: module.title,
      });

      actions.refreshCheckin();
      track("translation_checked", {
        route: state.route,
        project_id: project?.id || state.currentProjectId,
        folder_id: folder?.id || state.currentFolderId,
        module_id: moduleId,
        total_items: module.items.length,
        matched_count: matchedCount,
        accuracy: module.items.length ? Number((matchedCount / module.items.length).toFixed(2)) : 0,
      });
      commit();
      return { matchedCount, totalItems: module.items.length };
    },
    resetTranslationAnswers(moduleId) {
      const { module } = getModuleContext(moduleId);
      if (!module || !Array.isArray(module.items)) return;

      module.items = module.items.map((item) => ({
        ...item,
        userAnswer: "",
        isCorrect: null,
      }));

      track("translation_reset", {
        route: state.route,
        module_id: moduleId,
      });
      commit();
    },
    addVocabularyToFlashcards(words) {
      if (!Array.isArray(words) || words.length === 0) return 0;
      const existingWords = new Set(state.flashcards.map((card) => card.word.toLowerCase()));
      let addedCount = 0;

      words.forEach((word) => {
        if (!word?.word) return;
        const normalized = word.word.toLowerCase();
        if (existingWords.has(normalized)) return;
        existingWords.add(normalized);
        state.flashcards.push({
          ...word,
          id: word.id || `flash-${normalized}`,
        });
        addedCount += 1;
      });

      if (addedCount > 0) {
        track("vocabulary_added_to_flashcards", {
          route: state.route,
          added_count: addedCount,
        });
        commit();
      }

      return addedCount;
    },
    toggleVocabularyMastered(wordText) {
      if (!wordText) return false;

      for (const project of state.projects) {
        for (const folder of project.folders || []) {
          for (const module of folder.modules || []) {
            if (module.type !== "vocabulary") continue;
            const entry = (module.vocabulary || []).find((item) => item.word === wordText);
            if (entry) {
              entry.mastered = !entry.mastered;
              track("vocabulary_mastery_toggled", {
                route: state.route,
                word: entry.word,
                mastered: entry.mastered,
              });
              commit();
              return true;
            }
          }
        }
      }

      return false;
    },
    importTemplateBlock(raw) {
      const parsed = parseTemplateBlock(raw);
      state.importPreview = parsed;
      track("import_preview_generated", {
        route: state.route,
        module_type: parsed.type,
        module_mode: parsed.mode,
        item_count: parsed.items?.length || parsed.vocabulary?.length || 0,
      });
      return parsed;
    },
    applyImportPreview() {
      if (!state.importPreview) return;

      const folder = getCurrentFolder();
      const preview = state.importPreview;

      if (preview.type === "vocabulary") {
        const existingWords = new Set(state.flashcards.map((card) => card.word.toLowerCase()));
        const toAdd = (preview.vocabulary || []).filter(
          (item) => !existingWords.has(item.word.toLowerCase())
        );
        state.flashcards.push(...toAdd);
      } else {
        if (folder) {
          folder.modules.push(preview);
        }
      }

      state.importPreview = null;
      track("import_applied", {
        route: state.route,
        project_id: state.currentProjectId,
        folder_id: folder?.id || state.currentFolderId,
        module_id: preview.id,
        module_type: preview.type,
        module_mode: preview.mode,
        item_count: preview.items?.length || preview.vocabulary?.length || 0,
      });
      commit();
    },
    refreshCheckin() {
      const previous = state.checkin?.isCheckedIn;
      state.checkin = evaluateCheckinStatus(state.studyLog);
      if (!previous && state.checkin?.isCheckedIn) {
        track("checkin_completed", {
          route: state.route,
          project_id: state.currentProjectId,
          completed_actions: state.checkin.completedActions.length,
        });
      }
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
    return getModuleContext(moduleId).module;
  }

  /** Shared answer-submission pipeline for reading & listening. */
  function submitAnswers(moduleId, answers, logType) {
    const { project, folder, module } = getModuleContext(moduleId);
    if (!module) return;
    const sourceText = module.transcript || module.passage || "";
    const mistakes = [];
    let correctCount = 0;

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
      } else {
        correctCount += 1;
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
    track(logType === "reading-practice" ? "reading_submitted" : "listening_submitted", {
      route: state.route,
      project_id: project?.id || state.currentProjectId,
      folder_id: folder?.id || state.currentFolderId,
      module_id: module.id,
      module_type: module.type,
      module_mode: module.mode,
      total_items: module.items.length,
      correct_count: correctCount,
      mistake_count: mistakes.length,
      accuracy: module.items.length ? Number((correctCount / module.items.length).toFixed(2)) : 0,
    });
    commit();
  }

  function estimateTranslationMatch(userText = "", refText = "") {
    if (!userText.trim()) return 0;
    const stopWords = new Set(["the","and","for","not","are","how","can","that","this","with","when","from","its","has","but","was","now","all"]);
    const refKeywords = [...new Set(
      refText
        .toLowerCase()
        .replace(/[.,;!?()"']/g, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 3 && !stopWords.has(word))
    )];
    if (refKeywords.length === 0) return 0;
    const userLower = userText.toLowerCase();
    const matched = refKeywords.filter((keyword) => userLower.includes(keyword));
    return Math.round((matched.length / refKeywords.length) * 100);
  }

  actions.setUserName = function (name) {
    state.userName = name ? name.trim() : "";
    commit();
  };

  actions.updateSettings = function (patch) {
    state.settings = { ...(state.settings || {}), ...patch };
    commit();
  };

  actions.markFishStep = function (step) {
    const steps = state.settings?.fishSteps || [];
    if (!steps.includes(step)) {
      state.settings = { ...(state.settings || {}), fishSteps: [...steps, step] };
      commit();
    }
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
    track,
    actions,
  };
}
