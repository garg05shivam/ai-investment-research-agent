const model = require("../services/llmService");
const parseJsonFromModel = require("../utils/json");

async function financeAgent(state) {
  const response = await model.invoke(`
You are a fundamental analyst. Estimate the financial quality of "${state.company}" for an investment research memo.

Use this context:
${JSON.stringify(
  {
    summary: state.summary,
    industry: state.industry,
    businessModel: state.businessModel,
    webContext: state.webContext,
  },
  null,
  2
)}

Score conservatively from 1 to 10. If exact current financial data is unavailable, say so in "financialNotes" and use cautious qualitative estimates.

Return ONLY valid JSON:

{
  "financialScore": 0,
  "revenueGrowth": "",
  "profitability": "",
  "debtLevel": "",
  "cashFlowQuality": "",
  "valuationView": "",
  "financialNotes": ""
}

Do not add markdown.
Return only JSON.
`);

  const parsedData = parseJsonFromModel(response.content, {
    financialScore: 0,
    revenueGrowth: "Not verified",
    profitability: "Not verified",
    debtLevel: "Not verified",
    cashFlowQuality: "Unknown",
    valuationView: "Not assessed",
    financialNotes: "Fallback estimate used because the model did not return valid JSON.",
  });

  return {
    ...parsedData,
    financialScore: Math.max(
      0,
      Math.min(10, Number(parsedData.financialScore) || 0)
    ),
  };
}

module.exports = financeAgent;
