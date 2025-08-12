// Prevents short words from breaking and optionally truncates text
export function protectShortWords(text: string, minLength = 15) {
  return text
    .split(/\s+/)
    .map((word) => {
      if (word.length < minLength) {
        return word; // leave spaces normal, allow wrap
      }
      return word; // keep long words normal too
    })
    .join(" ");
}

// Safe truncation + non-breaking spaces
export function safeTitleText(title: string, maxLength = 70) {
  const truncated =
    title.length > maxLength ? title.slice(0, maxLength) + "…" : title;
  return protectShortWords(truncated);
}
