import express, { Request, Response } from "express";
import { connectDB } from "../config/db";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import { oid, pageOptions } from "../src/utils";

const router = express.Router();

// GET /api/products (public) - with search, filter, sort, pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, any> = { status: "active" };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice as string);
    }
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating as string) };
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search as string, $options: "i" } },
        { shortDescription: { $regex: req.query.search as string, $options: "i" } },
        { tags: { $in: [(req.query.search as string).toLowerCase()] } },
      ];
    }

    let sortField: Record<string, 1 | -1> = { createdAt: -1 };
    if (req.query.sort === "price_asc") sortField = { price: 1 };
    else if (req.query.sort === "price_desc") sortField = { price: -1 };
    else if (req.query.sort === "rating") sortField = { rating: -1 };
    else if (req.query.sort === "newest") sortField = { createdAt: -1 };
    else if (req.query.sort === "popular") sortField = { reviewCount: -1 };

    const [items, total] = await Promise.all([
      db.collection("products").find(filter).sort(sortField).skip(skip).limit(limit).toArray(),
      db.collection("products").countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/products/:id (public)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const item = await db.collection("products").findOne({ _id: oid(req.params.id) });
    if (!item) return res.status(404).json({ message: "Product not found" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// POST /api/products (authenticated)
router.post("/", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.status === "blocked") {
      return res.status(403).json({ message: "Blocked users cannot add products" });
    }
    const required = ["name", "shortDescription", "description", "price", "category", "brand"];
    const missing = required.filter((k) => !req.body[k]);
    if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });

    const db = await connectDB();
    const doc = {
      name: req.body.name,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      price: parseFloat(req.body.price),
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : parseFloat(req.body.price),
      category: req.body.category,
      brand: req.body.brand,
      images: req.body.images || [],
      tags: req.body.tags || [],
      specifications: req.body.specifications || {},
      rating: 0,
      reviewCount: 0,
      stock: parseInt(req.body.stock || "0"),
      sellerEmail: req.user.email,
      sellerName: req.user.name,
      sellerId: req.user._id.toString(),
      status: "active",
      createdAt: new Date(),
    };

    const result = await db.collection("products").insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PATCH /api/products/:id (owner or admin)
router.patch("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectDB();
    const product = await db.collection("products").findOne({ _id: oid(req.params.id) });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const canEdit = req.user.role === "admin" || product.sellerEmail === req.user.email;
    if (!canEdit) return res.status(403).json({ message: "Forbidden" });

    const fields = ["name", "shortDescription", "description", "price", "originalPrice", "category", "brand", "images", "tags", "specifications", "stock"];
    const update: Record<string, any> = {};
    fields.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    await db.collection("products").updateOne({ _id: product._id }, { $set: update });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id (owner or admin)
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectDB();
    const product = await db.collection("products").findOne({ _id: oid(req.params.id) });
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.user.role !== "admin" && product.sellerEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await db.collection("products").deleteOne({ _id: product._id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// GET /api/products/seller/mine (authenticated)
router.get("/seller/mine", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectDB();
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, any> = { sellerEmail: req.user.email };
    const [items, total] = await Promise.all([
      db.collection("products").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("products").countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your products" });
  }
});

export default router;
