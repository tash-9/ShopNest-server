import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";

const sampleProducts = [
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    shortDescription: "Industry-leading noise cancellation with 30-hour battery life",
    description: "Experience the next level of sound with the Sony WH-1000XM5. Featuring industry-leading noise cancellation powered by two processors and eight microphones, these headphones deliver crystal-clear audio. With up to 30 hours of battery life, multipoint connection, and exceptional call quality, they're perfect for work and play.",
    price: 349.99,
    originalPrice: 399.99,
    category: "Electronics",
    brand: "Sony",
    rating: 4.8,
    reviewCount: 2847,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600"
    ],
    tags: ["headphones", "wireless", "noise-cancelling", "sony"],
    specifications: { "Battery Life": "30 hours", "Connectivity": "Bluetooth 5.2", "Weight": "250g", "Driver Size": "30mm", "Frequency": "4Hz–40,000Hz" }
  },
  {
    name: "Apple MacBook Air M3",
    shortDescription: "Supercharged by M3 chip, incredibly thin and light",
    description: "MacBook Air with M3 chip is the world's best consumer laptop. Supercharged by the next-generation M3 chip, it features a stunning Liquid Retina display, up to 18 hours of battery life, and a fanless design that's remarkably thin. Available in four beautiful colors.",
    price: 1099.99,
    originalPrice: 1199.99,
    category: "Electronics",
    brand: "Apple",
    rating: 4.9,
    reviewCount: 5631,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
      "https://images.unsplash.com/photo-1611186871525-5cd6ece5c54e?w=600"
    ],
    tags: ["laptop", "apple", "macbook", "m3"],
    specifications: { "Processor": "Apple M3", "RAM": "8GB", "Storage": "256GB SSD", "Display": "13.6-inch Liquid Retina", "Battery": "Up to 18 hours" }
  },
  {
    name: "Nike Air Max 270",
    shortDescription: "Lifestyle shoe with Max Air unit for all-day comfort",
    description: "The Nike Air Max 270 delivers visible cushioning under every step with its large Air unit in the heel. The mesh upper provides breathability while the foam midsole adds lightweight cushioning. Perfect for everyday wear with a modern, eye-catching design.",
    price: 149.99,
    originalPrice: 170.00,
    category: "Fashion",
    brand: "Nike",
    rating: 4.6,
    reviewCount: 3892,
    stock: 78,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"
    ],
    tags: ["shoes", "nike", "running", "air max"],
    specifications: { "Material": "Mesh & Synthetic", "Sole": "Rubber", "Closure": "Lace-up", "Style": "Air Max 270", "Origin": "Vietnam" }
  },
  {
    name: "Instant Pot Duo 7-in-1",
    shortDescription: "Pressure cooker, slow cooker, rice cooker, steamer and more",
    description: "The Instant Pot Duo is a 7-in-1 multi-functional electric pressure cooker. It replaces 7 kitchen appliances — pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. Cook meals up to 70% faster using up to 70% less energy.",
    price: 89.99,
    originalPrice: 119.99,
    category: "Home & Garden",
    brand: "Instant Pot",
    rating: 4.7,
    reviewCount: 7218,
    stock: 95,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600"
    ],
    tags: ["kitchen", "cooking", "pressure cooker", "appliance"],
    specifications: { "Capacity": "6 Quart", "Power": "1000W", "Functions": "7-in-1", "Programs": "13 Smart Programs", "Material": "Stainless Steel" }
  },
  {
    name: "Levi's 501 Original Jeans",
    shortDescription: "The original straight-fit jean since 1873",
    description: "The Levi's 501 original jeans are the most iconic jeans in the world. Featuring the iconic straight fit and button fly, these jeans are made from durable denim that gets better with every wash. A timeless wardrobe staple for men and women.",
    price: 69.50,
    originalPrice: 89.50,
    category: "Fashion",
    brand: "Levi's",
    rating: 4.5,
    reviewCount: 4521,
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600"
    ],
    tags: ["jeans", "denim", "levis", "fashion"],
    specifications: { "Fit": "Straight", "Rise": "Regular", "Closure": "Button Fly", "Material": "100% Cotton", "Care": "Machine Wash" }
  },
  {
    name: "Dyson V15 Detect Cordless Vacuum",
    shortDescription: "Laser-powered cleaning with 60 minutes of powerful suction",
    description: "The Dyson V15 Detect uses laser technology to reveal microscopic dust on hard floors. Powerful suction of up to 240 AW with 60 minutes of fade-free battery life. The intelligent LCD screen shows hidden dust count in real-time, scientifically proving a deep clean.",
    price: 699.99,
    originalPrice: 749.99,
    category: "Home & Garden",
    brand: "Dyson",
    rating: 4.8,
    reviewCount: 1892,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600"
    ],
    tags: ["vacuum", "dyson", "cordless", "cleaning"],
    specifications: { "Suction": "240 AW", "Battery": "60 minutes", "Bin Volume": "0.77L", "Weight": "3.1kg", "Filtration": "HEPA" }
  },
  {
    name: "Samsung 55\" QLED 4K Smart TV",
    shortDescription: "Quantum Dot technology for brilliant colors and smart features",
    description: "The Samsung 55-inch QLED 4K Smart TV features Quantum Dot technology to produce a billion shades of brilliant color. With 4K resolution, HDR support, and the Tizen smart platform, enjoy an immersive viewing experience. Built-in voice assistants and a sleek bezel-less design.",
    price: 799.99,
    originalPrice: 999.99,
    category: "Electronics",
    brand: "Samsung",
    rating: 4.7,
    reviewCount: 3147,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600",
      "https://images.unsplash.com/photo-1571415060716-baff5f717ab3?w=600"
    ],
    tags: ["tv", "samsung", "4k", "qled", "smart tv"],
    specifications: { "Screen Size": "55 inches", "Resolution": "4K UHD", "Technology": "QLED", "Refresh Rate": "120Hz", "Smart Platform": "Tizen" }
  },
  {
    name: "Yoga Mat Premium Non-Slip",
    shortDescription: "Eco-friendly TPE mat with alignment lines and carrying strap",
    description: "Our premium yoga mat is made from eco-friendly TPE material that's free of harmful chemicals. The double-sided non-slip texture provides exceptional grip in any position. Includes alignment guide lines, ideal thickness of 6mm for joint support, and a convenient carrying strap.",
    price: 45.99,
    originalPrice: 59.99,
    category: "Sports",
    brand: "YogaFlow",
    rating: 4.6,
    reviewCount: 2341,
    stock: 200,
    images: [
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600"
    ],
    tags: ["yoga", "mat", "fitness", "exercise"],
    specifications: { "Material": "Eco TPE", "Thickness": "6mm", "Dimensions": "183 x 61cm", "Weight": "1.5kg", "Features": "Non-slip, Alignment lines" }
  },
  {
    name: "The Alchemist by Paulo Coelho",
    shortDescription: "A magical story about following your dreams",
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. A story about following our dreams and listening to our hearts, The Alchemist has sold over 150 million copies worldwide.",
    price: 14.99,
    originalPrice: 18.99,
    category: "Books",
    brand: "HarperOne",
    rating: 4.9,
    reviewCount: 12847,
    stock: 500,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600"
    ],
    tags: ["books", "fiction", "bestseller", "coelho"],
    specifications: { "Pages": "208", "Language": "English", "Publisher": "HarperOne", "Format": "Paperback", "ISBN": "978-0062315007" }
  },
  {
    name: "Ordinary Niacinamide 10% + Zinc 1%",
    shortDescription: "High-strength vitamin and mineral blemish formula",
    description: "This water-based serum combines 10% niacinamide with 1% zinc PCA to visibly reduce blemishes and improve skin texture. Niacinamide helps minimize pores, brighten skin tone, and reduce signs of aging. Suitable for all skin types, especially oily and acne-prone skin.",
    price: 12.99,
    originalPrice: 15.99,
    category: "Beauty",
    brand: "The Ordinary",
    rating: 4.7,
    reviewCount: 8932,
    stock: 250,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600"
    ],
    tags: ["skincare", "serum", "niacinamide", "beauty"],
    specifications: { "Volume": "30ml", "Key Ingredient": "10% Niacinamide", "Skin Type": "All types", "Vegan": "Yes", "Cruelty-Free": "Yes" }
  },
  {
    name: "LEGO Technic Land Rover Defender",
    shortDescription: "1:8 scale replica with 2573 pieces",
    description: "Build the iconic Land Rover Defender 90 in 1:8 scale with 2,573 pieces. Features include a 6-cylinder engine with moving pistons, all-wheel drive with differential locking, and realistic recreation of the Defender's exterior features. Includes the exclusive Land Rover key fob.",
    price: 199.99,
    originalPrice: 239.99,
    category: "Toys",
    brand: "LEGO",
    rating: 4.9,
    reviewCount: 3421,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600",
      "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600"
    ],
    tags: ["lego", "technic", "land rover", "building"],
    specifications: { "Pieces": "2573", "Scale": "1:8", "Age": "18+", "Dimensions": "42 x 22 x 17cm", "Set Number": "42110" }
  },
  {
    name: "Hydro Flask 32oz Wide Mouth",
    shortDescription: "Keeps drinks cold 24hrs and hot 12hrs with TempShield insulation",
    description: "The Hydro Flask 32oz Wide Mouth bottle features TempShield double-wall vacuum insulation that keeps drinks cold for 24 hours and hot for 12 hours. Made from professional-grade 18/8 stainless steel, it's BPA-free and dishwasher safe. Compatible with all Wide Mouth lids and accessories.",
    price: 49.95,
    originalPrice: 59.95,
    category: "Sports",
    brand: "Hydro Flask",
    rating: 4.8,
    reviewCount: 6721,
    stock: 180,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
    ],
    tags: ["water bottle", "hydro flask", "insulated", "outdoors"],
    specifications: { "Capacity": "32oz / 946ml", "Material": "18/8 Stainless Steel", "Insulation": "TempShield", "Cold": "24 hours", "Hot": "12 hours" }
  }
];

export async function seedDB(): Promise<void> {
  const db = await connectDB();

  // Seed admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@shopnest.test";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin12345";
  const existing = await db.collection("users").findOne({ email: adminEmail });
  if (existing) {
    await db.collection("users").updateOne(
      { email: adminEmail },
      { $set: { role: "admin", status: "active" } }
    );
    console.log(`Admin role enforced for ${adminEmail}`);
  } else {
    await db.collection("users").insertOne({
      email: adminEmail,
      name: "ShopNest Admin",
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=Admin`,
      role: "admin",
      status: "active",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      createdAt: new Date(),
    });
    console.log(`Admin created: ${adminEmail}`);
  }

  // Seed demo user
  const demoEmail = process.env.DEMO_EMAIL || "demo@shopnest.test";
  const demoPassword = process.env.DEMO_PASSWORD || "Demo12345";
  const demoExists = await db.collection("users").findOne({ email: demoEmail });
  if (!demoExists) {
    await db.collection("users").insertOne({
      email: demoEmail,
      name: "Demo User",
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=Demo`,
      role: "buyer",
      status: "active",
      passwordHash: await bcrypt.hash(demoPassword, 10),
      createdAt: new Date(),
    });
    console.log(`Demo user created: ${demoEmail}`);
  }

  // Seed products if empty
  const productCount = await db.collection("products").countDocuments();
  if (productCount === 0) {
    const adminUser = await db.collection("users").findOne({ email: adminEmail });
    const products = sampleProducts.map(p => ({
      ...p,
      sellerEmail: adminEmail,
      sellerName: "ShopNest Admin",
      sellerId: adminUser!._id.toString(),
      status: "active",
      createdAt: new Date(),
    }));
    await db.collection("products").insertMany(products);
    console.log(`Seeded ${products.length} products`);
  }

  console.log("Seed complete.");
}
