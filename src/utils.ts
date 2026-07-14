import jwt from "jsonwebtoken";
import { ObjectId } from "../config/db";
import { Request } from "express";

export const categories = [
  "Electronics", "Fashion", "Home & Garden", "Sports", "Books",
  "Beauty", "Toys", "Automotive", "Food & Grocery", "Health"
];

export function signUser(user: any): string {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

export function publicUser(user: any): any {
  const { passwordHash, ...safe } = user;
  return safe;
}

export function oid(id: string): ObjectId {
  if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
  return new ObjectId(id);
}

export function pageOptions(req: Request): { page: number; limit: number; skip: number } {
  const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) || "12", 10), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}
