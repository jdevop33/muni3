import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes"; // Adjusted path
import { log } from "../server/vite"; // Adjusted path

// ADDED: Early log to confirm server startup attempt
console.log('>>> [Vercel] Starting api/index.ts execution...');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware (optional but helpful)
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
      let logLine = `${req.method} ${req.originalUrl} ${res.statusCode} in ${duration}ms`; // Use originalUrl
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine); // Use standard console.log for Vercel
    }
  });

  next();
});

// Register API routes
// Note: registerRoutes might need adjustments if it returns an http.Server
// Vercel expects the Express app instance itself.
// We assume registerRoutes now modifies the 'app' instance directly.
console.log('>>> [Vercel] Attempting to register routes...');
registerRoutes(app); // Modified to directly apply routes to app
console.log('>>> [Vercel] Routes registered successfully.');

// Generic error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error('>>> [Vercel] Unhandled error:', err);
  res.status(status).json({ message });
});

// Export the Express app for Vercel
export default app;
