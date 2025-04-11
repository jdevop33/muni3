import passport from "passport";
import { Strategy as LocalStrategy, VerifyFunction } from "passport-local"; 
import { Express, Request, Response, NextFunction } from "express"; 
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
// Use .js extension for runtime module resolution
import { storage } from "./storage.js"; 
import type { User as SelectUser } from "../shared/schema.js"; // Corrected path and extension
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
  console.log(">>> [VERCEL_DEBUG] Entered setupAuth"); // DEBUG LOG 1
  
  const PgSessionStore = connectPg(session);
  
  const dbUrl = process.env.DATABASE_URL;
  const sessionSecret = process.env.SESSION_SECRET;

  console.log(`>>> [VERCEL_DEBUG] DATABASE_URL is set: ${!!dbUrl}`); // DEBUG LOG 2
  console.log(`>>> [VERCEL_DEBUG] SESSION_SECRET is set: ${!!sessionSecret}`); // DEBUG LOG 3

  if (!dbUrl) {
    console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
    // Avoid process.exit in serverless, let it crash naturally if needed
    throw new Error("DATABASE_URL is not set"); 
  }
  if (!sessionSecret) {
      console.warn("WARNING: SESSION_SECRET is not set. Using default (unsafe for production).");
      // Allow default for now, but log warning
  }

  let pool;
  try {
    pool = new Pool({
      connectionString: dbUrl
    });
    console.log(">>> [VERCEL_DEBUG] Session DB Pool created"); // DEBUG LOG 4
  } catch (poolError) {
    console.error(">>> [VERCEL_DEBUG] FATAL ERROR creating Session DB Pool:", poolError);
    throw poolError; // Crash if pool creation fails
  }
  
  const sessionSettings: session.SessionOptions = {
    store: new PgSessionStore({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: sessionSecret || "council-insight-secret", // Use default only if env var is missing
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  console.log(">>> [VERCEL_DEBUG] Session settings configured"); // DEBUG LOG 5

  try {
    app.set("trust proxy", 1); // Needed for secure cookies if behind proxy
    app.use(session(sessionSettings));
    console.log(">>> [VERCEL_DEBUG] Session middleware applied"); // DEBUG LOG 6
    app.use(passport.initialize());
    console.log(">>> [VERCEL_DEBUG] Passport initialized"); // DEBUG LOG 7
    app.use(passport.session());
    console.log(">>> [VERCEL_DEBUG] Passport session applied"); // DEBUG LOG 8
  } catch (middlewareError) {
      console.error(">>> [VERCEL_DEBUG] FATAL ERROR applying session/passport middleware:", middlewareError);
      throw middlewareError;
  }

  const localStrategyVerify: VerifyFunction = async (username, password, done) => {
     try {
        console.log(`>>> [VERCEL_DEBUG] Passport verify callback for: ${username}`); 
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`>>> [VERCEL_DEBUG] Login failed: User ${username} not found`); 
          return done(null, false, { message: "Invalid username or password" }); 
        }
        if (!user.password) {
             console.log(`>>> [VERCEL_DEBUG] Login failed: User ${username} has no password set`); 
             return done(null, false, { message: "Invalid user configuration" });
        }
        console.log(`>>> [VERCEL_DEBUG] Comparing passwords for ${username}`);
        const passwordsMatch = await comparePasswords(password, user.password);
        if (!passwordsMatch) {
           console.log(`>>> [VERCEL_DEBUG] Login failed: Invalid password for user ${username}`); 
           return done(null, false, { message: "Invalid username or password" });
        }
        console.log(`>>> [VERCEL_DEBUG] Passwords match for ${username}`); 
        return done(null, user);
      } catch (error) {
        console.error(`>>> [VERCEL_DEBUG] Error during Passport verify for ${username}:`, error); 
        return done(error instanceof Error ? error : new Error(String(error))); 
      }
  };

  passport.use(new LocalStrategy(localStrategyVerify));

  passport.serializeUser((user: Express.User, done: (err: null, id?: number) => void) => {
     console.log(`>>> [VERCEL_DEBUG] Serializing user ID: ${user.id}`);
     done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: (err: Error | null, user?: Express.User | false | null) => void) => {
    console.log(`>>> [VERCEL_DEBUG] Deserializing user ID: ${id}`);
    try {
      const user = await storage.getUser(id);
      console.log(`>>> [VERCEL_DEBUG] Deserialized user: ${user ? user.username : 'Not Found'}`);
      done(null, user || false); 
    } catch (error) {
      console.error(`>>> [VERCEL_DEBUG] Error deserializing user ID ${id}:`, error);
      done(error instanceof Error ? error : new Error(String(error)));
    }
  });

  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    // ... (registration logic remains the same)
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
           console.error(">>> [VERCEL_DEBUG] Error logging in after registration:", err);
           return next(err);
        }
        console.log(">>> [VERCEL_DEBUG] User registered and logged in successfully.");
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error(">>> [VERCEL_DEBUG] Error during registration:", error); 
      next(error);
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    console.log(">>> [VERCEL_DEBUG] POST /api/login route hit");
    passport.authenticate("local", (err: Error | null, user: Express.User | false | null, info?: { message: string }) => {
      console.log(`>>> [VERCEL_DEBUG] Passport authenticate callback. Error: ${err}, User: ${user ? user.username : user}`);
      if (err) {
        console.error(">>> [VERCEL_DEBUG] Login error during passport.authenticate:", err); 
        return next(err);
      }
      if (!user) {
        const message = info?.message || "Authentication failed: Invalid credentials or user not found.";
        console.log(`>>> [VERCEL_DEBUG] Passport auth failed: ${message}`); 
        return res.status(401).json({ error: message });
      }
      console.log(`>>> [VERCEL_DEBUG] Passport auth succeeded for user: ${user.username}. Attempting req.login...`);
      req.login(user, (loginErr: any) => { 
        if (loginErr) {
          console.error(">>> [VERCEL_DEBUG] FATAL Error during req.login:", loginErr); 
          return next(loginErr);
        }
        const userWithoutPassword: Partial<SelectUser> = { ...user };
        delete userWithoutPassword.password;
        console.log(`>>> [VERCEL_DEBUG] req.login successful. User ${user.username} fully logged in.`); 
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    const username = req.user?.username;
    console.log(`>>> [VERCEL_DEBUG] Attempting logout for user: ${username}`);
    req.logout((err: any) => { 
      if (err) {
        console.error(`>>> [VERCEL_DEBUG] Error during logout for user ${username}:`, err); 
        return next(err);
      }
      console.log(`>>> [VERCEL_DEBUG] User ${username} logged out via req.logout.`); 
      req.session.destroy((destroyErr: any) => { 
         if (destroyErr) {
            console.error(`>>> [VERCEL_DEBUG] Error destroying session for user ${username}:`, destroyErr);
         } else {
             console.log(`>>> [VERCEL_DEBUG] Session destroyed successfully for user ${username}.`);
         }
         res.clearCookie('connect.sid'); 
         res.status(200).json({ message: "Logout successful"});
      }); 
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    console.log(`>>> [VERCEL_DEBUG] GET /api/user hit. Authenticated: ${req.isAuthenticated()}, User: ${req.user?.username}`);
    if (!req.isAuthenticated()) {
       return res.status(401).json({ error: "Not authenticated" });
    }
    const userWithoutPassword: Partial<SelectUser> = req.user ? { ...req.user } : {}; 
    delete userWithoutPassword.password;
    res.json(userWithoutPassword);
  });

  app.get("/api/admin", roleCheck(['admin']), (req: Request, res: Response) => {
    console.log(`>>> [VERCEL_DEBUG] GET /api/admin hit by user: ${req.user?.username}`);
    res.json({ message: "Admin access granted", user: req.user });
  });

  console.log(">>> [VERCEL_DEBUG] setupAuth finished applying routes/middleware"); // DEBUG LOG 9
}

export function roleCheck(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`>>> [VERCEL_DEBUG] Role check for path: ${req.path}, User: ${req.user?.username}, Role: ${req.user?.role}`);
    if (!req.isAuthenticated()) {
      console.log(">>> [VERCEL_DEBUG] Role check failed: Not authenticated");
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userRole = req.user?.role ?? '';
    
    if (!allowedRoles.includes(userRole)) {
      console.log(`>>> [VERCEL_DEBUG] Role check failed: User role '${userRole}' not in allowed roles [${allowedRoles.join(', ')}]`);
      return res.status(403).json({ error: "Not authorized" });
    }
    
    console.log(">>> [VERCEL_DEBUG] Role check passed.");
    next();
  };
}