const express = require("express");
const investmentGraph = require("../graph/investmentGraph");

const router = express.Router();
const analysisCache = new Map();
const CACHE_TTL_MS = Number(process.env.ANALYSIS_CACHE_TTL_MS) || 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = Number(process.env.ANALYSIS_CACHE_MAX_ENTRIES) || 100;
const COMPANY_MAX_LENGTH = 120;

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
  if (analysisCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = analysisCache.keys().next().value;
    analysisCache.delete(oldestKey);
  }

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

    if (trimmedCompany.length > COMPANY_MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Company name must be ${COMPANY_MAX_LENGTH} characters or fewer`,
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

    return res.json({
      success: true,
      cached: false,
      data: result,
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    const isTimeout =
      error?.name === "TimeoutError" ||
      /timed?\s*out|timeout|aborted/i.test(error?.message || "");

    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: isTimeout
        ? "The AI provider took too long to respond. Please try again."
        : process.env.NODE_ENV === "production"
          ? "Analysis failed. Please try again."
          : error.message,
    });
  }
});

module.exports = router;
