function parseJsonFromModel(content, fallback = {}) {
  if (!content || typeof content !== "string") {
    return fallback;
  }

  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (nestedError) {
        console.error("JSON slice parse failed:", nestedError.message);
      }
    }

    console.error("Model JSON parse failed:", error.message);
    return fallback;
  }
}

module.exports = parseJsonFromModel;
