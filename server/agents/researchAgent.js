const model = require("../services/llmService");

async function researchAgent(company) {
  const response = await model.invoke(`
Analyze ${company}.

Return ONLY valid JSON:

{
  "summary": "",
  "industry": "",
  "strengths": ["","",""]
}

Do not add markdown.
Do not add explanation.
Return only JSON.
`);

  try {
    const parsedData = JSON.parse(response.content);

    return {
      company,
      ...parsedData
    };
  } catch (error) {
    console.error("JSON Parse Error:", error);

    return {
      company,
      summary: response.content,
      industry: "Unknown",
      strengths: []
    };
  }
}

module.exports = researchAgent;