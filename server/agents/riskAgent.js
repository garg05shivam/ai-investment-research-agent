async function riskAgent(company) {
  return {
    riskScore: 6,
    risks: [
      "Market competition",
      "Economic uncertainty",
      "Regulatory challenges"
    ]
  };
}

module.exports = riskAgent;