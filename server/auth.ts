import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { NextFunction, Request, Response } from "express";
import pg from 'pg';
const { Pool } = pg;

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PgSessionStore = connectPg(session);
  
  // Create a pg Pool from DATABASE_URL or connection params
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

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Update last login time
      if (user.lastLogin === null) {
        // Only update on first login after server restart to avoid excessive DB updates
        const updatedUser = { ...user, lastLogin: new Date() };
        // We don't await this to avoid slowing down the auth process
        storage.updateUser(user.id, updatedUser).catch(console.error);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create the user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Remove password from returned user object
      const userWithoutPassword: any = { ...user };
      if (userWithoutPassword.password) {
        delete userWithoutPassword.password;
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        // Remove password from returned user object
        const userWithoutPassword: any = { ...user };
        if (userWithoutPassword.password) {
          delete userWithoutPassword.password;
        }
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    // Remove password from returned user object
    const userWithoutPassword: any = { ...req.user };
    if (userWithoutPassword.password) {
      delete userWithoutPassword.password;
    }
    res.json(userWithoutPassword);
  });

  // Role-based middleware for protected routes
  app.get("/api/admin", roleCheck(["admin"]), (req, res) => {
    res.json({ message: "Admin access granted", user: req.user });
  });
}

// Role-based authorization middleware
export function roleCheck(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userRole = req.user!.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    next();
  };
}