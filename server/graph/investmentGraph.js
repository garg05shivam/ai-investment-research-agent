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

async function analysisNode(state) {
  const [finance, risk] = await Promise.all([
    financeAgent(state),
    riskAgent(state),
  ]);

  return {
    ...state,
    ...finance,
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
graph.addNode("analysis", analysisNode);
graph.addNode("decision", decisionNode);

graph.addEdge(START, "research");
graph.addEdge("research", "analysis");
graph.addEdge("analysis", "decision");
graph.addEdge("decision", END);

const investmentGraph = graph.compile();

module.exports = investmentGraph;
