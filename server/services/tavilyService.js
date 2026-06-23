const { TavilySearch } = require("@langchain/community/tools/tavily_search");

const tavilyTool = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY,
  maxResults: 5,
});

module.exports = tavilyTool;