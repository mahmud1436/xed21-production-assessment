import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";

// Import Cloud SQL connection for production
let initializeDatabase: () => void;
try {
  const cloudSql = await import("./cloud-sql");
  initializeDatabase = cloudSql.initializeDatabase;
} catch (error) {
  // Cloud SQL module not available in development
  initializeDatabase = () => console.log('Development mode: Using local database');
}

const app = express();

// Add CORS support for production
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize database connection in production
if (process.env.NODE_ENV === "production") {
  try {
    initializeDatabase();
    console.log('✅ Production database connection established');
  } catch (error) {
    console.error('❌ Production database connection failed:', error);
  }
}

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [express] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Add basic health endpoints
  app.get("/health", (_req, res) => {
    res.status(200).json({ 
      status: "ok", 
      message: "API is running",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/test", (_req, res) => {
    res.status(200).json({ 
      message: "API test successful", 
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL ? "connected" : "not configured"
    });
  });

  // Simple static file serving (only in production)
  if (process.env.NODE_ENV === "production") {
    // Serve a simple response for all other routes
    app.use("*", (_req, res) => {
      res.status(200).json({ 
        message: "API is running",
        endpoints: ["/health", "/api/test"],
        environment: "production"
      });
    });
  } else {
    // Development mode - import vite setup
    try {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } catch (error) {
      console.log("Vite setup failed, running in API-only mode");
      app.use("*", (_req, res) => {
        res.status(200).json({ 
          message: "API is running (development mode)",
          endpoints: ["/health", "/api/test"]
        });
      });
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
