const express = require("express");
const investmentGraph = require("../graph/investmentGraph");

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { company } = req.body;

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const result = await investmentGraph.invoke({
      company,
    });

    res.json({
      success: true,
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