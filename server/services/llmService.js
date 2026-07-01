require("dotenv").config({ quiet: true });

const { ChatGroq } = require("@langchain/groq");

let model;
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 45000;
const GROQ_MAX_RETRIES = Number(process.env.GROQ_MAX_RETRIES ?? 1);

function getModel() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Groq API key. Set GROQ_API_KEY in server/.env before running analysis."
    );
  }

  if (!model) {
    model = new ChatGroq({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      apiKey,
      temperature: 0.2,
      maxRetries: GROQ_MAX_RETRIES,
      maxTokens: 1200,
    });
  }

  return model;
}

const modelProxy = {
  invoke: (input, options = {}) =>
    getModel().invoke(input, {
      ...options,
      signal: options.signal || AbortSignal.timeout(LLM_TIMEOUT_MS),
    }),
};

module.exports = modelProxy;
