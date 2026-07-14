import express, { Response } from "express";
import { connectDB } from "../config/db";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import { oid, pageOptions, publicUser } from "../src/utils";

const router = express.Router();

// GET /api/users (admin only)
router.get("/", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectDB();
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, any> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role) filter.role = req.query.role;
    const [items, total] = await Promise.all([
      db.collection("users").find(filter).project({ passwordHash: 0 }).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray(),
      db.collection("users").countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// PATCH /api/users/profile (own profile)
router.patch("/profile", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ["name", "avatar", "phone", "address"];
    const update: Record<string, any> = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) update[key] = req.body[key]; });
    const db = await connectDB();
    await db.collection("users").updateOne({ _id: req.user._id }, { $set: update });
    const user = await db.collection("users").findOne({ _id: req.user._id });
    res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

// PATCH /api/users/:id/status (admin only)
router.patch("/:id/status", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const db = await connectDB();
    await db.collection("users").updateOne({ _id: oid(req.params.id) }, { $set: { status } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
});

// PATCH /api/users/:id/role (admin only)
router.patch("/:id/role", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }
    const db = await connectDB();
    await db.collection("users").updateOne({ _id: oid(req.params.id) }, { $set: { role } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Role update failed" });
  }
});

export default router;
