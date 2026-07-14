import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { connectDB, ObjectId } from "../config/db";

export interface AuthRequest extends Request {
  user?: any;
}

export async function verifyToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ message: "Authentication token missing" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const db = await connectDB();
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user?.role)) {
      res.status(403).json({ message: "Forbidden: insufficient permissions" });
      return;
    }
    next();
  };
}
