export function parseTemplateBlock(raw) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const metadata = {};
  let section = null;
  const passageLines = [];
  const transcriptLines = [];
  const itemLines = [];
  const vocabLines = [];

  for (const line of lines) {
    if (line.startsWith("[") && line.includes("]")) {
      const closingIndex = line.indexOf("]");
      const key = line.slice(1, closingIndex);
      const value = line.slice(closingIndex + 1).trim();

      if (key === "文章" || key === "passage") {
        section = "passage";
        if (value) passageLines.push(value);
        continue;
      }

      if (key === "听力原文" || key === "transcript") {
        section = "transcript";
        if (value) transcriptLines.push(value);
        continue;
      }

      if (key === "题目" || key === "items") {
        section = "items";
        if (value) itemLines.push(value);
        continue;
      }

      if (key === "词汇表" || key === "vocabulary") {
        section = "vocabulary";
        if (value) vocabLines.push(value);
        continue;
      }

      // Metadata
      metadata[key] = value;
      section = null;
      continue;
    }

    if (section === "passage") {
      passageLines.push(line);
    } else if (section === "transcript") {
      transcriptLines.push(line);
    } else if (section === "items") {
      itemLines.push(line);
    } else if (section === "vocabulary") {
      vocabLines.push(line);
    }
  }

  const moduleType = metadata["模块类型"] || metadata["type"] || "reading";
  const moduleMode  = metadata["模式"] || metadata["mode"] || (moduleType === "listening" ? "dictation" : "cloze");
  const isMCQ = moduleMode === "comprehension";

  // Build items from pipe-delimited lines
  const items = itemLines
    .map((line, index) => {
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length < 2) return null;

      if (moduleType === "translation") {
        return {
          id: `imported-item-${index + 1}`,
          type: "translation",
          source: parts[0],
          reference: parts[1],
          userAnswer: "",
          isCorrect: null,
        };
      }

      // MCQ comprehension: question | optionA | optionB | optionC | optionD | answer
      if (isMCQ && parts.length >= 6) {
        const answer = parts[parts.length - 1].toUpperCase();
        const options = parts.slice(1, 5);
        return {
          id: `imported-item-${index + 1}`,
          type: "mcq",
          conversation: 0,
          question: parts[0],
          options,
          answer,
          userAnswer: "",
          isCorrect: null,
        };
      }

      return {
        id: `imported-item-${index + 1}`,
        prompt: parts[0],
        answer: parts[1],
        userAnswer: "",
        isCorrect: null,
      };
    })
    .filter(Boolean);

  // Build vocabulary entries
  const vocabulary = vocabLines
    .map((line, index) => {
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length < 2) return null;

      return {
        id: `imported-vocab-${index + 1}`,
        word: parts[0],
        pos: parts[1] || "",
        zh: parts[2] || "待补充释义",
        context: parts[3] || "",
        mastered: false,
      };
    })
    .filter(Boolean);

  const base = {
    id: `module-${Date.now()}`,
    type: moduleType,
    mode: moduleMode,
    title: metadata["标题"] || metadata["title"] || "未命名模块",
    source: "imported",
    summary: metadata["摘要"] || "由模板导入生成的练习模块。",
  };

  if (vocabulary.length > 0) {
    return {
      ...base,
      type: "vocabulary",
      items: [],
      vocabulary,
    };
  }

  return {
    ...base,
    passage: passageLines.join(" "),
    transcript: transcriptLines.join(" ") || passageLines.join(" "),
    items,
  };
}
