import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import backendApp from "./backend/src/app";

dotenv.config();

async function startServer() {
  const BACKEND_PORT = Number(process.env.BACKEND_PORT || 5000);
  const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 3000);

  // Start the Postgres/Prisma API backend on port 5000
  try {
    const apiServer = backendApp.listen(BACKEND_PORT, "0.0.0.0", () => {
      console.log(`Backend API running on http://localhost:${BACKEND_PORT}`);
    });
    apiServer.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Backend port ${BACKEND_PORT} is already in use, reusing existing backend server.`);
      } else {
        console.error("Backend server error:", err);
      }
    });
  } catch (err) {
    console.log(`Could not bind backend port ${BACKEND_PORT}:`, err);
  }

  // Create frontend server (port 3000)
  const app = express();
  app.use(express.json());

  // Forward /api requests to backendApp while leaving all page routes to Vite
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return (backendApp as any)(req, res, next);
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const frontendServer = app.listen(FRONTEND_PORT, "0.0.0.0", () => {
    console.log(`Frontend Application running on http://localhost:${FRONTEND_PORT}`);
  });

  frontendServer.on("error", (err: any) => {
    console.error("Frontend server error:", err);
  });
}

startServer();
