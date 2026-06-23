require("dotenv").config({ quiet: true });

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

let model;

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set GEMINI_API_KEY in server/.env before running analysis."
    );
  }

  if (!model) {
    model = new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      apiKey,
      temperature: 0.2,
    });
  }

  return model;
}

const modelProxy = {
  invoke: (...args) => getModel().invoke(...args),
};

module.exports = modelProxy;
