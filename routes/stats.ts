import express, { Response } from "express";
import { connectDB } from "../config/db";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";

const router = express.Router();

// GET /api/stats — admin dashboard stats
router.get("/", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectDB();
    const [users, products, orders, revenueAgg, orderChart, categoryChart] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("products").countDocuments({ status: "active" }),
      db.collection("orders").countDocuments(),
      db.collection("orders").aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]).toArray(),
      db.collection("orders").aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]).toArray(),
      db.collection("products").aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]).toArray(),
    ]);
    res.json({
      users,
      products,
      orders,
      revenue: revenueAgg[0]?.total || 0,
      orderChart,
      categoryChart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
