import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { publicUser, signUser } from "../src/utils";
import { verifyToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, name, avatar, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const db = await connectDB();
    const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const user = {
      email: email.toLowerCase(),
      name,
      avatar: avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: "buyer",
      status: "active",
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);
    const savedUser = { ...user, _id: result.insertedId };
    res.status(201).json({ token: signUser(savedUser), user: publicUser(savedUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const user = await db.collection("users").findOne({
      email: String(req.body.email || "").toLowerCase(),
    });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked. Contact support." });
    }
    res.json({ token: signUser(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, (req: AuthRequest, res: Response) => {
  res.json(publicUser(req.user));
});

export default router;
