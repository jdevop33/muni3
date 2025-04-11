import passport from "passport";
import { Strategy as LocalStrategy, VerifyFunction } from "passport-local"; 
import { Express, Request, Response, NextFunction } from "express"; 
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
// Use .js extension for runtime module resolution
import { storage } from "./storage.js"; 
import { User as SelectUser } from "../shared/schema.js"; // Corrected path and extension
import connectPg from "connect-pg-simple";
import { db } from "./db.js"; // Use .js extension
import pg from 'pg';
const { Pool } = pg;

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    console.error("Invalid stored password format.");
    return false;
  }
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    if (suppliedBuf.length !== hashedBuf.length) {
      return false; 
    }
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false; 
  }
}

type DoneCallback = (error: Error | null, user?: Express.User | false | null, options?: { message: string }) => void;

export function setupAuth(app: Express) {
  const PgSessionStore = connectPg(session);
  
  if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1); 
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

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  const localStrategyVerify: VerifyFunction = async (username, password, done) => {
     try {
        console.log(`Attempting login for username: ${username}`); 
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`Login failed: User ${username} not found`); 
          return done(null, false, { message: "Invalid username or password" }); 
        }
        if (!user.password) {
             console.log(`Login failed: User ${username} has no password set`); 
             return done(null, false, { message: "Invalid user configuration" });
        }
        const passwordsMatch = await comparePasswords(password, user.password);
        if (!passwordsMatch) {
           console.log(`Login failed: Invalid password for user ${username}`); 
           return done(null, false, { message: "Invalid username or password" });
        }
        console.log(`Login successful for user: ${username}`); 
        return done(null, user);
      } catch (error) {
        console.error(`Error during authentication for ${username}:`, error); 
        return done(error instanceof Error ? error : new Error(String(error))); 
      }
  };

  passport.use(new LocalStrategy(localStrategyVerify));

  passport.serializeUser((user: Express.User, done: (err: null, id?: number) => void) => {
     done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: (err: Error | null, user?: Express.User | false | null) => void) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false); 
    } catch (error) {
      done(error instanceof Error ? error : new Error(String(error)));
    }
  });

  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body.username || !req.body.password) {
          return res.status(400).json({ error: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body, 
        password: await hashPassword(req.body.password), 
        role: req.body.role || 'user' 
      });

      const userWithoutPassword: Partial<SelectUser> = { ...user };
      delete userWithoutPassword.password;

      req.login(user, (err: any) => { 
        if (err) {
           console.error("Error logging in after registration:", err);
           return next(err);
        }
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Error during registration:", error); 
      next(error);
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false | null, info?: { message: string }) => {
      if (err) {
        console.error("Login error during passport.authenticate:", err); 
        return next(err);
      }
      if (!user) {
        const message = info?.message || "Authentication failed: Invalid credentials or user not found.";
        console.log(`Login failed (passport.authenticate): ${message}`); 
        return res.status(401).json({ error: message });
      }
      req.login(user, (loginErr: any) => { 
        if (loginErr) {
          console.error("Login error during req.login:", loginErr); 
          return next(loginErr);
        }
        const userWithoutPassword: Partial<SelectUser> = { ...user };
        delete userWithoutPassword.password;
        console.log(`User ${user.username} successfully logged in.`); 
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    const username = req.user?.username;
    req.logout((err: any) => { 
      if (err) {
        console.error(`Error during logout for user ${username}:`, err); 
        return next(err);
      }
      console.log(`User ${username} logged out.`); 
      req.session.destroy((destroyErr: any) => { 
         if (destroyErr) {
            console.error(`Error destroying session for user ${username}:`, destroyErr);
         }         
         res.clearCookie('connect.sid'); 
         res.status(200).json({ message: "Logout successful"});
      }); 
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
       return res.status(401).json({ error: "Not authenticated" });
    }
    const userWithoutPassword: Partial<SelectUser> = req.user ? { ...req.user } : {}; 
    delete userWithoutPassword.password;
    res.json(userWithoutPassword);
  });

  app.get("/api/admin", roleCheck(['admin']), (req: Request, res: Response) => {
    res.json({ message: "Admin access granted", user: req.user });
  });
}

export function roleCheck(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userRole = req.user?.role ?? '';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    next();
  };
}