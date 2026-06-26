const express = require("express");
const investmentGraph = require("../graph/investmentGraph");

const router = express.Router();
const analysisCache = new Map();
const CACHE_TTL_MS = Number(process.env.ANALYSIS_CACHE_TTL_MS) || 15 * 60 * 1000;

function getCacheKey(company) {
  return company.toLowerCase();
}

function getCachedAnalysis(company) {
  const cached = analysisCache.get(getCacheKey(company));

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    analysisCache.delete(getCacheKey(company));
    return null;
  }

  return cached.data;
}

function setCachedAnalysis(company, data) {
  analysisCache.set(getCacheKey(company), {
    createdAt: Date.now(),
    data,
  });
}

router.post("/analyze", async (req, res) => {
  try {
    const { company } = req.body;

    const trimmedCompany = typeof company === "string" ? company.trim() : "";

    if (!trimmedCompany) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const cachedResult = getCachedAnalysis(trimmedCompany);

    if (cachedResult) {
      return res.json({
        success: true,
        cached: true,
        data: cachedResult,
      });
    }

    const result = await investmentGraph.invoke({
      company: trimmedCompany,
    });

    setCachedAnalysis(trimmedCompany, result);

    res.json({
      success: true,
      cached: false,
      data: result,
    });

  } catch (error) {
    console.error("Analysis Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
