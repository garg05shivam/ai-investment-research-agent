require("dotenv").config({ quiet: true });

const { tavily } = require("@tavily/core");

const tavilyTool = process.env.TAVILY_API_KEY
  ? tavily({
      apiKey: process.env.TAVILY_API_KEY,
    })
  : null;

module.exports = tavilyTool;
