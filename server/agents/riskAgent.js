const model = require("../services/llmService");
const parseJsonFromModel = require("../utils/json");

async function riskAgent(state) {
  const response = await model.invoke(`
You are a skeptical risk analyst. Identify investment risks for "${state.company}".

Use this context:
${JSON.stringify(
  {
    summary: state.summary,
    industry: state.industry,
    businessModel: state.businessModel,
    watchItems: state.watchItems,
    webContext: state.webContext,
  },
  null,
  2
)}

Score risk from 1 to 10, where 1 is low risk and 10 is very high risk. Be specific and avoid generic risks unless they clearly apply.

Return ONLY valid JSON:

{
  "riskScore": 0,
  "risks": ["", "", ""],
  "riskSummary": "",
  "redFlags": ["", ""]
}

Do not add markdown.
Return only JSON.
`);

  const parsedData = parseJsonFromModel(response.content, {
    riskScore: 6,
    risks: [
      "Market competition",
      "Economic uncertainty",
      "Regulatory challenges"
    ],
    riskSummary: "Fallback risk profile used because the model did not return valid JSON.",
    redFlags: [],
  });

  return {
    ...parsedData,
    riskScore: Number(parsedData.riskScore) || 0,
  };
}

module.exports = riskAgent;
