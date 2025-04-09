import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// ADDED: Early log to confirm server startup attempt
console.log('>>> [Vercel] Starting server/index.ts execution...');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  // ADDED: Log before registering routes
  console.log('>>> [Vercel] Attempting to register routes...');
  const server = await registerRoutes(app);
  // ADDED: Log after registering routes
  console.log('>>> [Vercel] Routes registered successfully.');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // ADDED: Log the error
    console.error('>>> [Vercel] Unhandled error:', err);
    res.status(status).json({ message });
    // Removing `throw err;` as it might stop the Vercel function prematurely
    // Vercel handles logging the crash anyway
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log('>>> [Vercel] Setting up Vite (Development)... This should NOT run in Vercel deployment.');
    await setupVite(app, server);
  } else {
    console.log('>>> [Vercel] Serving static assets (Production mode)...');
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    // Use console.log for Vercel compatibility
    console.log(`>>> [Vercel] Server listening on port ${port}`);
    // The `log` function from vite might not be available/work as expected in Vercel
    // log(`serving on port ${port}`); 
  });
})().catch(err => {
  // ADDED: Catch errors during async setup
  console.error('>>> [Vercel] FATAL ERROR during server startup:', err);
  process.exit(1); // Ensure Vercel knows the startup failed
});
