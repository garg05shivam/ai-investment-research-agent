const model = require("../services/llmService");
const parseJsonFromModel = require("../utils/json");

async function decisionAgent(state) {
  const response = await model.invoke(`
You are the portfolio manager making the final call. Decide whether to INVEST or PASS on "${state.company}".

Use this analysis:
${JSON.stringify(
  {
    summary: state.summary,
    industry: state.industry,
    strengths: state.strengths,
    watchItems: state.watchItems,
    financialScore: state.financialScore,
    revenueGrowth: state.revenueGrowth,
    profitability: state.profitability,
    debtLevel: state.debtLevel,
    cashFlowQuality: state.cashFlowQuality,
    valuationView: state.valuationView,
    riskScore: state.riskScore,
    risks: state.risks,
    redFlags: state.redFlags,
  },
  null,
  2
)}

Rules:
- Recommendation must be exactly "INVEST" or "PASS".
- Confidence must be a number from 0 to 100.
- Be conservative if evidence is weak, valuation is stretched, or risks are high.

Return ONLY valid JSON:

{
  "recommendation": "",
  "confidence": 0,
  "decisionReason": "",
  "bullCase": "",
  "bearCase": "",
  "nextResearchSteps": ["", "", ""]
}

Do not add markdown.
Return only JSON.
`);

  const fallbackRecommendation =
    state.financialScore >= 7 && state.riskScore <= 6 ? "INVEST" : "PASS";

  const parsedData = parseJsonFromModel(response.content, {
    recommendation: fallbackRecommendation,
    confidence: 70,
    decisionReason:
      fallbackRecommendation === "INVEST"
        ? "Financial quality appears strong enough to compensate for the identified risks."
        : "The current risk/reward balance is not attractive enough for a fresh investment.",
    bullCase: "Strong execution could improve upside.",
    bearCase: "Risks could pressure returns.",
    nextResearchSteps: [
      "Verify latest quarterly filings",
      "Compare valuation with peers",
      "Review recent management commentary",
    ],
  });

  return {
    ...parsedData,
    recommendation:
      parsedData.recommendation === "INVEST" ? "INVEST" : "PASS",
    confidence: Math.max(0, Math.min(100, Number(parsedData.confidence) || 0)),
  };
}

module.exports = decisionAgent;
