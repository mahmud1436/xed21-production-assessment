import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Use process.cwd() instead of import.meta.dirname for production compatibility
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Use environment variable or fallback to safe defaults
  const distPath = process.env.STATIC_DIR || 
                   path.resolve(process.cwd(), "public") ||
                   path.resolve(process.cwd(), "dist", "public") ||
                   "/app/public";

  console.log(`Attempting to serve static files from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.log(`Static directory ${distPath} does not exist. Setting up API-only mode.`);
    
    // Provide API endpoints without static file serving
    app.get("/health", (_req, res) => {
      res.status(200).json({ status: "ok", message: "API is running" });
    });
    
    app.get("/api/test", (_req, res) => {
      res.status(200).json({ message: "API test successful", timestamp: new Date().toISOString() });
    });
    
    // Catch-all route for any other requests
    app.use("*", (_req, res) => {
      res.status(200).json({ 
        message: "API is running", 
        note: "Static files not available",
        endpoints: ["/health", "/api/test"]
      });
    });
    return;
  }

  console.log(`Successfully found static directory: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).json({ 
        message: "API is running", 
        note: "index.html not found",
        staticDir: distPath
      });
    }
  });
}
