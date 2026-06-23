const express = require("express");
const cors = require("cors");

const researchRoutes = require("./routes/researchRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", researchRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "running"
  });
});

module.exports = app;