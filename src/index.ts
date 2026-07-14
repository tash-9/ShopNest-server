import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "../config/db";
import authRoutes from "../routes/auth";
import userRoutes from "../routes/users";
import productRoutes from "../routes/products";
import orderRoutes from "../routes/orders";
import statsRoutes from "../routes/stats";
import { seedDB } from "./seed";

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Health check
app.get("/", async (_req, res) => {
  try {
    await connectDB();
    res.json({ name: "ShopNest API", status: "healthy", version: "1.0.0", timestamp: new Date().toISOString(), database: "connected" });
  } catch {
    res.json({ name: "ShopNest API", status: "healthy", version: "1.0.0", timestamp: new Date().toISOString(), database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

connectDB()
  .then(async () => {
    await seedDB();
    app.listen(port, () => console.log(`ShopNest API running on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
