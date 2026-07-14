import express, { Response } from "express";
import { connectDB } from "../config/db";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import { oid, pageOptions } from "../src/utils";

const router = express.Router();

// POST /api/orders (authenticated)
router.post("/", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.status === "blocked") {
      return res.status(403).json({ message: "Blocked users cannot place orders" });
    }
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ message: "Items and shipping address are required" });
    }
    const db = await connectDB();
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const order = {
      items,
      shippingAddress,
      paymentMethod: paymentMethod || "card",
      buyerEmail: req.user.email,
      buyerName: req.user.name,
      buyerId: req.user._id.toString(),
      total,
      status: "pending",
      createdAt: new Date(),
    };
    const result = await db.collection("orders").insertOne(order);
    res.status(201).json({ ...order, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// GET /api/orders/mine (authenticated)
router.get("/mine", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectDB();
    const { page, limit, skip } = pageOptions(req);
    const filter = { buyerEmail: req.user.email };
    const [items, total] = await Promise.all([
      db.collection("orders").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("orders").countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// GET /api/orders (admin only)
router.get("/", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectDB();
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, any> = {};
    if (req.query.status) filter.status = req.query.status;
    const [items, total] = await Promise.all([
      db.collection("orders").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("orders").countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// PATCH /api/orders/:id/status (admin only)
router.patch("/:id/status", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }
    const db = await connectDB();
    await db.collection("orders").updateOne({ _id: oid(req.params.id) }, { $set: { status: req.body.status } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;
