function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createHighlighter(cetWords, projectKeywords) {
  const dictionary = [...new Set([...cetWords, ...projectKeywords])]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  return function highlight(text) {
    let output = text;

    for (const word of dictionary) {
      const matcher = new RegExp(`\\b(${escapeRegExp(word)})\\b`, "gi");
      output = output.replace(matcher, '<span class="vocab-highlight">$1</span>');
    }

    return output;
  };
}
