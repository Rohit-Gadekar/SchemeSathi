import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Modular routers (imported with .js suffix for ES resolution compatibility)
import schemesRouter from "./server/routes/schemes.js";
import ocrRouter from "./server/routes/ocr.js";
import chatRouter from "./server/routes/chat.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Universal body parsers and core structures
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Log basic requests for support diagnostic trail
app.use((req, res, next) => {
  console.log(`[SchemeSathi Request] ${req.method} on: ${req.path}`);
  next();
});

// Register production-grade backend API routers
app.use("/api", schemesRouter);
app.use("/api/ocr", ocrRouter);
app.use("/api", chatRouter);

// Service Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "SchemeSathi Core Module"
  });
});

// Serve frontend assets and boot server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Dev Server] Mounting Vite developer engine...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Production Server] Serving distribution assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SchemeSathi Server] Booted successfully and running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start SchemeSathi server:", err);
});
