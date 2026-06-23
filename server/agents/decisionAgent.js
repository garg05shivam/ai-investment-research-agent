async function decisionAgent(financialScore, riskScore) {
  let recommendation = "PASS";
  let reason = "";

  if (financialScore >= 7 && riskScore <= 7) {
    recommendation = "INVEST";
    reason =
      "Strong financial performance with acceptable risk profile.";
  } else {
    reason =
      "Financial performance does not sufficiently outweigh investment risks.";
  }

  return {
    recommendation,
    confidence: 80,
    decisionReason: reason
  };
}

module.exports = decisionAgent;