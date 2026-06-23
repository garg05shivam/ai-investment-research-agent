const { StateGraph, START, END } = require("@langchain/langgraph");

const researchAgent = require("../agents/researchAgent");
const financeAgent = require("../agents/financeAgent");
const riskAgent = require("../agents/riskAgent");
const decisionAgent = require("../agents/decisionAgent");

async function researchNode(state) {
  const research = await researchAgent(state.company);

  return {
    ...state,
    ...research,
  };
}

async function financeNode(state) {
  const finance = await financeAgent(state);

  return {
    ...state,
    ...finance,
  };
}

async function riskNode(state) {
  const risk = await riskAgent(state);

  return {
    ...state,
    ...risk,
  };
}

async function decisionNode(state) {
  const decision = await decisionAgent(state);

  return {
    ...state,
    ...decision,
  };
}

const graph = new StateGraph({
  channels: {
    company: {},
    sources: {},
    webContext: {},
    summary: {},
    industry: {},
    businessModel: {},
    strengths: {},
    watchItems: {},
    financialScore: {},
    revenueGrowth: {},
    profitability: {},
    debtLevel: {},
    cashFlowQuality: {},
    valuationView: {},
    financialNotes: {},
    riskScore: {},
    risks: {},
    riskSummary: {},
    redFlags: {},
    recommendation: {},
    confidence: {},
    decisionReason: {},
    bullCase: {},
    bearCase: {},
    nextResearchSteps: {},
  },
});

graph.addNode("research", researchNode);
graph.addNode("finance", financeNode);
graph.addNode("risk", riskNode);
graph.addNode("decision", decisionNode);

graph.addEdge(START, "research");
graph.addEdge("research", "finance");
graph.addEdge("finance", "risk");
graph.addEdge("risk", "decision");
graph.addEdge("decision", END);

const investmentGraph = graph.compile();

module.exports = investmentGraph;
