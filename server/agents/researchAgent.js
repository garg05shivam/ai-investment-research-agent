const model = require("../services/llmService");
const tavilyTool = require("../services/tavilyService");
const parseJsonFromModel = require("../utils/json");

const TAVILY_MAX_RESULTS = Number(process.env.TAVILY_MAX_RESULTS) || 4;
const TAVILY_SEARCH_DEPTH = process.env.TAVILY_SEARCH_DEPTH || "basic";

async function getWebContext(company) {
  if (!tavilyTool) {
    return {
      webContext: "Tavily key not configured. Use general market knowledge and mark live evidence as limited.",
      sources: [],
    };
  }

  try {
    const searchResult = await tavilyTool.search(
      `${company} company latest financial performance business risks investment analysis`,
      {
        maxResults: TAVILY_MAX_RESULTS,
        searchDepth: TAVILY_SEARCH_DEPTH,
      }
    );

    const raw = typeof searchResult === "string" ? searchResult : JSON.stringify(searchResult);

    return {
      webContext: raw.slice(0, 6000),
      sources: Array.isArray(searchResult?.results)
        ? searchResult.results.slice(0, 5).map((item) => ({
            title: item.title,
            url: item.url,
          }))
        : [],
    };
  } catch (error) {
    console.error("Tavily search failed:", error.message);
    return {
      webContext: "Live search failed. Use general market knowledge and note evidence limitations.",
      sources: [],
    };
  }
}

async function researchAgent(company) {
  const { webContext, sources } = await getWebContext(company);

  const response = await model.invoke(`
You are an equity research analyst. Build a concise research brief for "${company}".

Use this web/search context when available:
${webContext}

Return ONLY valid JSON:

{
  "summary": "",
  "industry": "",
  "businessModel": "",
  "strengths": ["", "", ""],
  "watchItems": ["", "", ""]
}

Do not add markdown.
Do not add explanation.
Return only JSON.
`);

  const parsedData = parseJsonFromModel(response.content, {
    summary: response.content,
    industry: "Unknown",
    businessModel: "Unknown",
    strengths: [],
    watchItems: [],
  });

  return {
    company,
    sources,
    webContext,
    ...parsedData,
  };
}

module.exports = researchAgent;
