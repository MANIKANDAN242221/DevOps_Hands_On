const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const { v4: uuidv4 } = require("uuid");

const app     = express();
const PORT    = process.env.PORT    || 4000;
const ENV     = process.env.NODE_ENV || "development";
const VERSION = process.env.APP_VERSION || "1.0.0";

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// ── In-memory store ────────────────────────────────────────────────────────
let items        = [];
let requestCount = 0;
const startTime  = Date.now();

app.use((req, res, next) => { requestCount++; next(); });

// ── Health / readiness ─────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status:      "ok",
    version:     VERSION,
    environment: ENV,
    uptime:      (Date.now() - startTime) / 1000,
    timestamp:   new Date().toISOString(),
  });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready" });
});

// ── Metrics ────────────────────────────────────────────────────────────────
app.get("/api/metrics", (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    totalRequests: requestCount,
    itemCount:     items.length,
    memoryMB:      Math.round(mem.heapUsed / 1024 / 1024),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment:   ENV,
    version:       VERSION,
  });
});

// ── Items CRUD ─────────────────────────────────────────────────────────────
app.get("/api/items", (req, res) => {
  const { search } = req.query;
  const result = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;
  res.json({ items: result, total: result.length });
});

app.get("/api/items/:id", (req, res) => {
  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

app.post("/api/items", (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required and must be a non-empty string" });
  }
  const item = {
    id:        uuidv4(),
    name:      name.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(item);
  res.status(201).json(item);
});

app.put("/api/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Item not found" });
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  items[index] = { ...items[index], name: name.trim(), updatedAt: new Date().toISOString() };
  res.json(items[index]);
});

app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Item not found" });
  items.splice(index, 1);
  res.json({ message: "Item deleted" });
});

// ── 404 + error handler ────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[${ENV}] Backend running on :${PORT} — v${VERSION}`);
});

module.exports = app;