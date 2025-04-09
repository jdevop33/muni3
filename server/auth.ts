import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express"; // Import Request, Response, NextFunction
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import pg from 'pg';
const { Pool } = pg;

// Define passport callback type more accurately if possible (using VerifyFunction from passport-local)
import { VerifyFunction } from "passport-local";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Export this function so storage.ts can use it
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    // Handle case where the stored password format is incorrect
    console.error("Invalid stored password format.");
    return false;
  }
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    // Important: Use timingSafeEqual to prevent timing attacks
    if (suppliedBuf.length !== hashedBuf.length) {
      // Ensure buffers are the same length for timingSafeEqual
      return false; // Or hash a dummy value as before if preferred, but returning false is simpler
    }
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false; // Treat comparison errors as mismatch
  }
}

// Define the type for the passport 'done' callback
type PassportDoneCallback = (error: Error | null, user?: Express.User | false | null, options?: { message: string }) => void;

export function setupAuth(app: Express) {
  const PgSessionStore = connectPg(session);
  
  // Create a pg Pool from DATABASE_URL or connection params
  // Handle potential missing DATABASE_URL more gracefully
  if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1); // Exit if DB URL is missing
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  const sessionSettings: session.SessionOptions = {
    store: new PgSessionStore({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || "council-insight-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  // Needed if the app is behind a proxy (like Vercel)
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Explicitly type the LocalStrategy callback parameters
  passport.use(
    new LocalStrategy(async (username: string, password: string, done: PassportDoneCallback) => {
      try {
        console.log(`Attempting login for username: ${username}`); // Added logging
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`Login failed: User ${username} not found`); // Added logging
          return done(null, false, { message: "Invalid username or password" });
        }
        // Ensure user.password is not null or undefined before comparing
        if (!user.password) {
             console.log(`Login failed: User ${username} has no password set`); // Added logging
             return done(null, false, { message: "Invalid user configuration" });
        }
        const passwordsMatch = await comparePasswords(password, user.password);
        if (!passwordsMatch) {
           console.log(`Login failed: Invalid password for user ${username}`); // Added logging
           return done(null, false, { message: "Invalid username or password" });
        }
        console.log(`Login successful for user: ${username}`); // Added logging
        return done(null, user);
      } catch (error) {
        console.error(`Error during authentication for ${username}:`, error); // Added logging
        // Ensure error is cast to Error type for the callback
        return done(error instanceof Error ? error : new Error(String(error))); 
      }
    }),
  );

  // Add types for serializeUser and deserializeUser
  passport.serializeUser((user: Express.User, done: (err: null, id?: number) => void) => {
     done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: (err: Error | null, user?: Express.User | false | null) => void) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Update last login time logic - check if it needs adjustment
      // Consider updating only if lastLogin is significantly older than current time
       if (!user.lastLogin || new Date().getTime() - new Date(user.lastLogin).getTime() > 5 * 60 * 1000) { 
         // Perform the update asynchronously without blocking the login
         storage.updateUser(user.id, { lastLogin: new Date() }).catch(console.error);
       }
      done(null, user);
    } catch (error) {
       // Ensure error is cast to Error type
      done(error instanceof Error ? error : new Error(String(error)));
    }
  });

  // Add types for route handlers
  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Basic validation (consider using a library like zod)
      if (!req.body.username || !req.body.password) {
          return res.status(400).json({ error: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create the user with hashed password
      const user = await storage.createUser({
        ...req.body, // Spread other potential fields like email, fullName
        password: await hashPassword(req.body.password),
        role: req.body.role || 'user' // Default role if not provided
      });

      // Remove password from returned user object
      const userWithoutPassword: Partial<SelectUser> = { ...user };
      delete userWithoutPassword.password;

      // Log in the new user immediately
      req.login(user, (err: any) => { // Add type for err
        if (err) {
           console.error("Error logging in after registration:", err);
           return next(err);
        }
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Error during registration:", error); // Added logging
      next(error);
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
     // Explicitly type the passport.authenticate callback parameters
    passport.authenticate("local", (err: Error | null, user: Express.User | false | null, info?: { message: string }) => {
      if (err) {
        console.error("Login error during passport.authenticate:", err); // Added logging
        return next(err);
      }
      if (!user) {
        // Use info.message if available, provide a generic message otherwise
        const message = info?.message || "Authentication failed: Invalid credentials or user not found.";
        console.log(`Login failed (passport.authenticate): ${message}`); // Added logging
        return res.status(401).json({ error: message });
      }
      req.login(user, (loginErr: any) => { // Add type for loginErr
        if (loginErr) {
          console.error("Login error during req.login:", loginErr); // Added logging
          return next(loginErr);
        }
        // Remove password from returned user object before sending
        const userWithoutPassword: Partial<SelectUser> = { ...user };
        delete userWithoutPassword.password;
        console.log(`User ${user.username} successfully logged in.`); // Added logging
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    const username = req.user?.username;
    req.logout((err: any) => { // Add type for err
      if (err) {
        console.error(`Error during logout for user ${username}:`, err); // Added logging
        return next(err);
      }
      console.log(`User ${username} logged out.`); // Added logging
      req.session.destroy((destroyErr: any) => { // Add type for destroyErr
         if (destroyErr) {
            console.error(`Error destroying session for user ${username}:`, destroyErr);
            // Still attempt to clear cookie and send response even if session destroy fails
         }         
         res.clearCookie('connect.sid'); // Adjust cookie name if needed based on session config
         res.status(200).json({ message: "Logout successful"});
      }); 
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
       return res.status(401).json({ error: "Not authenticated" });
    }
    // Remove password from returned user object
    // Ensure req.user exists before spreading
    const userWithoutPassword: Partial<SelectUser> = req.user ? { ...req.user } : {}; 
    delete userWithoutPassword.password;
    res.json(userWithoutPassword);
  });

  // Role-based middleware for protected routes
  app.get("/api/admin", roleCheck(["admin"]), (req: Request, res: Response) => {
    // Ensure req.user exists before accessing properties
    res.json({ message: "Admin access granted", user: req.user });
  });
}

// Role-based authorization middleware
export function roleCheck(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Use optional chaining and provide a default empty string if role is missing
    const userRole = req.user?.role ?? '';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    next();
  };
}