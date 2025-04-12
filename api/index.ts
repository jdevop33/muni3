import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
// Use .js extension for runtime module resolution
import { registerRoutes } from "./routes.js"; 
// Removed Vite import and related logic

console.log('>>> [Vercel] Starting api/index.ts execution...');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Register API routes
console.log('>>> [Vercel] Attempting to register routes...');
registerRoutes(app); 
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
