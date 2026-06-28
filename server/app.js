const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const researchRoutes = require("./routes/researchRoutes");

const app = express();
const clientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(
  cors({
    origin: clientOrigins.length > 0 ? clientOrigins : true,
  })
);
app.use(express.json({ limit: "10kb" }));

app.use("/api", researchRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "running",
    uptime: Math.floor(process.uptime()),
  });
});

const clientDistPath = path.resolve(__dirname, "../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api/") &&
      req.path !== "/health" &&
      req.accepts("html")
    ) {
      return res.sendFile(clientIndexPath);
    }

    return next();
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
