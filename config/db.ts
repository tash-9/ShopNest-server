import { MongoClient, ObjectId, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI environment variable is required");
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("products").createIndex({ category: 1 });
  await db.collection("products").createIndex({ sellerEmail: 1 });
  await db.collection("products").createIndex({ name: "text", description: "text" });
  await db.collection("orders").createIndex({ buyerEmail: 1 });
  console.log("Connected to MongoDB");
  return db;
}

export { ObjectId };
