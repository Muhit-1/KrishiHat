import { PrismaClient, Role, UserStatus, ProductStatus, ProductCondition, ProductListingType, AuctionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hashSync(pw, 12);

async function main() {
  console.log("🌱 Seeding KrishiHat database with realistic demo data...\n");

  // ── Users ──────────────────────────────────────────────────────────────
  console.log("Creating users...");

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@krishihat.com" },
    update: {},
    create: {
      email: "superadmin@krishihat.com",
      passwordHash: hash("SuperAdmin@123"),
      role: Role.super_admin,
      status: UserStatus.active,
      emailVerified: true,
      profile: { create: { fullName: "Super Admin", phone: "01700000000", district: "Dhaka" } },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@krishihat.com" },
    update: {},
    create: {
      email: "admin@krishihat.com",
      passwordHash: hash("Admin@123"),
      role: Role.admin,
      status: UserStatus.active,
      emailVerified: true,
      profile: { create: { fullName: "Platform Admin", phone: "01700000001", district: "Dhaka" } },
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: "moderator@krishihat.com" },
    update: {},
    create: {
      email: "moderator@krishihat.com",
      passwordHash: hash("Moderator@123"),
      role: Role.moderator,
      status: UserStatus.active,
      emailVerified: true,
      profile: { create: { fullName: "Platform Moderator", phone: "01700000002", district: "Chittagong" } },
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: "seller@krishihat.com" },
    update: {},
    create: {
      email: "seller@krishihat.com",
      passwordHash: hash("Seller@123"),
      role: Role.seller,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: {
          fullName: "Rahim Uddin",
          phone: "01711111111",
          district: "Rajshahi",
          division: "Rajshahi",
          upazila: "Paba",
          address: "Village: Shyampur, PO: Rajshahi Sadar",
        },
      },
      sellerProfile: {
        create: {
          shopName: "কৃষি ভান্ডার",
          shopDescription: "Fresh organic vegetables and farming tools from Rajshahi",
          isVerified: true,
          verifiedAt: new Date(),
          rating: 4.7,
          totalSales: 152,
        },
      },
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "seller2@krishihat.com" },
    update: {},
    create: {
      email: "seller2@krishihat.com",
      passwordHash: hash("Seller@123"),
      role: Role.seller,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: {
          fullName: "Karim Ahmed",
          phone: "01722222222",
          district: "Dinajpur",
          division: "Rangpur",
          upazila: "Sadar",
        },
      },
      sellerProfile: {
        create: {
          shopName: "ধান ও চাল ভান্ডার",
          shopDescription: "Premium quality rice and grains from Dinajpur. We supply Miniket, Najirshail and more.",
          isVerified: true,
          verifiedAt: new Date(),
          rating: 4.5,
          totalSales: 89,
        },
      },
    },
  });

  const seller3 = await prisma.user.upsert({
    where: { email: "seller3@krishihat.com" },
    update: {},
    create: {
      email: "seller3@krishihat.com",
      passwordHash: hash("Seller@123"),
      role: Role.seller,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: {
          fullName: "Fatema Begum",
          phone: "01733333333",
          district: "Bogura",
          division: "Rajshahi",
          upazila: "Shibganj",
        },
      },
      sellerProfile: {
        create: {
          shopName: "মৌসুমী কৃষি",
          shopDescription: "Seasonal fruits, vegetables and farming equipment from Bogura",
          isVerified: true,
          verifiedAt: new Date(),
          rating: 4.3,
          totalSales: 67,
        },
      },
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: "buyer@krishihat.com" },
    update: {},
    create: {
      email: "buyer@krishihat.com",
      passwordHash: hash("Buyer@123"),
      role: Role.buyer,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: {
          fullName: "Aisha Khatun",
          phone: "01744444444",
          district: "Dhaka",
          division: "Dhaka",
          upazila: "Mirpur",
          address: "House 12, Road 5, Block D, Mirpur-10, Dhaka",
        },
      },
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: "buyer2@krishihat.com" },
    update: {},
    create: {
      email: "buyer2@krishihat.com",
      passwordHash: hash("Buyer@123"),
      role: Role.buyer,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: {
          fullName: "Shakil Hossain",
          phone: "01755555555",
          district: "Chittagong",
          division: "Chittagong",
          upazila: "Pahartali",
        },
      },
    },
  });

  console.log("✅ Users created");

  // ── Categories ─────────────────────────────────────────────────────────
  console.log("Creating categories...");

  const catVeg = await prisma.category.upsert({
    where: { slug: "vegetables" },
    update: {},
    create: {
      name: "Vegetables",
      nameBn: "সবজি",
      slug: "vegetables",
      auctionAllowed: false,
      sortOrder: 1,
    },
  });

  const catRice = await prisma.category.upsert({
    where: { slug: "rice-grains" },
    update: {},
    create: {
      name: "Rice & Grains",
      nameBn: "ধান ও চাল",
      slug: "rice-grains",
      auctionAllowed: false,
      sortOrder: 2,
    },
  });

  const catFruits = await prisma.category.upsert({
    where: { slug: "fruits" },
    update: {},
    create: {
      name: "Fruits",
      nameBn: "ফলমূল",
      slug: "fruits",
      auctionAllowed: false,
      sortOrder: 3,
    },
  });

  const catFishMeat = await prisma.category.upsert({
    where: { slug: "fish-meat" },
    update: {},
    create: {
      name: "Fish & Meat",
      nameBn: "মাছ ও মাংস",
      slug: "fish-meat",
      auctionAllowed: false,
      sortOrder: 4,
    },
  });

  const catSpices = await prisma.category.upsert({
    where: { slug: "spices" },
    update: {},
    create: {
      name: "Spices & Herbs",
      nameBn: "মশলা ও ভেষজ",
      slug: "spices",
      auctionAllowed: false,
      sortOrder: 5,
    },
  });

  const catTools = await prisma.category.upsert({
    where: { slug: "farming-tools" },
    update: {},
    create: {
      name: "Farming Tools & Equipment",
      nameBn: "কৃষি যন্ত্রপাতি ও সরঞ্জাম",
      slug: "farming-tools",
      auctionAllowed: true,
      sortOrder: 6,
    },
  });

  const catSeeds = await prisma.category.upsert({
    where: { slug: "seeds-fertilizers" },
    update: {},
    create: {
      name: "Seeds & Fertilizers",
      nameBn: "বীজ ও সার",
      slug: "seeds-fertilizers",
      auctionAllowed: false,
      sortOrder: 7,
    },
  });

  const catDairy = await prisma.category.upsert({
    where: { slug: "dairy-eggs" },
    update: {},
    create: {
      name: "Dairy & Eggs",
      nameBn: "দুগ্ধজাত ও ডিম",
      slug: "dairy-eggs",
      auctionAllowed: false,
      sortOrder: 8,
    },
  });

  // Subcategories
  const subLeafy = await prisma.subcategory.upsert({
    where: { slug: "leafy-vegetables" },
    update: {},
    create: {
      categoryId: catVeg.id,
      name: "Leafy Vegetables",
      nameBn: "শাকসবজি",
      slug: "leafy-vegetables",
    },
  });

  const subRootVeg = await prisma.subcategory.upsert({
    where: { slug: "root-vegetables" },
    update: {},
    create: {
      categoryId: catVeg.id,
      name: "Root Vegetables",
      nameBn: "মূল সবজি",
      slug: "root-vegetables",
    },
  });

  const subHandTools = await prisma.subcategory.upsert({
    where: { slug: "hand-tools" },
    update: {},
    create: {
      categoryId: catTools.id,
      name: "Hand Tools",
      nameBn: "হাতিয়ার",
      slug: "hand-tools",
    },
  });

  const subMachinery = await prisma.subcategory.upsert({
    where: { slug: "machinery" },
    update: {},
    create: {
      categoryId: catTools.id,
      name: "Machinery",
      nameBn: "যন্ত্রপাতি",
      slug: "machinery",
    },
  });

  console.log("✅ Categories and subcategories created");

  // ── Products ────────────────────────────────────────────────────────────
  console.log("Creating products...");

  const products = [
    // Vegetables — seller1
    {
      sellerId: seller1.id,
      categoryId: catVeg.id,
      subcategoryId: subLeafy.id,
      title: "Fresh Spinach",
      titleBn: "তাজা পালং শাক",
      slug: "fresh-spinach-seller1",
      description: "Organically grown fresh spinach from Rajshahi. Harvested daily, delivered within 24 hours.",
      descriptionBn: "রাজশাহীতে জৈব পদ্ধতিতে চাষ করা তাজা পালং শাক। প্রতিদিন তোলা হয়, ২৪ ঘণ্টার মধ্যে সরবরাহ করা হয়।",
      price: 35,
      stock: 200,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    {
      sellerId: seller1.id,
      categoryId: catVeg.id,
      subcategoryId: subRootVeg.id,
      title: "Red Potato (Lal Alu)",
      titleBn: "লাল আলু",
      slug: "red-potato-seller1",
      description: "High quality red potatoes from Rajshahi farms. Perfect for curries and boiling.",
      descriptionBn: "রাজশাহীর উচ্চমানের লাল আলু। তরকারি এবং সিদ্ধের জন্য উপযুক্ত।",
      price: 28,
      stock: 500,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    {
      sellerId: seller1.id,
      categoryId: catVeg.id,
      subcategoryId: subRootVeg.id,
      title: "Fresh Tomato",
      titleBn: "তাজা টমেটো",
      slug: "fresh-tomato-seller1",
      description: "Bright red tomatoes grown without pesticides. Sweet and tangy flavor.",
      descriptionBn: "কীটনাশকমুক্ত উজ্জ্বল লাল টমেটো। মিষ্টি এবং টক স্বাদ।",
      price: 45,
      stock: 300,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    {
      sellerId: seller1.id,
      categoryId: catVeg.id,
      subcategoryId: subLeafy.id,
      title: "Bottle Gourd (Lau)",
      titleBn: "লাউ",
      slug: "bottle-gourd-seller1",
      description: "Fresh tender bottle gourd. Rich in water content, great for summer cooking.",
      descriptionBn: "তাজা কচি লাউ। গরমের রান্নার জন্য চমৎকার।",
      price: 30,
      stock: 150,
      unit: "piece",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    // Rice — seller2
    {
      sellerId: seller2.id,
      categoryId: catRice.id,
      title: "Miniket Rice (Premium)",
      titleBn: "মিনিকেট চাল (প্রিমিয়াম)",
      slug: "miniket-rice-premium-seller2",
      description: "Premium quality Miniket rice from Dinajpur. Long grain, fragrant, excellent for daily cooking.",
      descriptionBn: "দিনাজপুরের উচ্চমানের মিনিকেট চাল। লম্বা দানা, সুগন্ধি, দৈনন্দিন রান্নার জন্য উৎকৃষ্ট।",
      price: 72,
      stock: 1000,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    {
      sellerId: seller2.id,
      categoryId: catRice.id,
      title: "Najirshail Rice",
      titleBn: "নাজিরশাইল চাল",
      slug: "najirshail-rice-seller2",
      description: "Finest Najirshail rice, known for its aroma and soft texture after cooking.",
      descriptionBn: "সেরা নাজিরশাইল চাল, রান্নার পর এর সুগন্ধ ও নরম জমিনের জন্য বিখ্যাত।",
      price: 85,
      stock: 800,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    {
      sellerId: seller2.id,
      categoryId: catRice.id,
      title: "Wheat Flour (Atta)",
      titleBn: "গমের আটা",
      slug: "wheat-flour-seller2",
      description: "Stone-ground whole wheat flour. Rich in fiber, ideal for roti and bread.",
      descriptionBn: "পাথর-পেষা গোটা গমের আটা। আঁশে সমৃদ্ধ, রুটি ও পাউরুটির জন্য আদর্শ।",
      price: 55,
      stock: 600,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    // Fruits — seller3
    {
      sellerId: seller3.id,
      categoryId: catFruits.id,
      title: "Himsagar Mango",
      titleBn: "হিমসাগর আম",
      slug: "himsagar-mango-seller3",
      description: "King of mangoes — Himsagar from Rajshahi. Sweet, juicy, and aromatic. Available in season.",
      descriptionBn: "আমের রাজা — রাজশাহীর হিমসাগর আম। মিষ্টি, রসালো এবং সুগন্ধি। মৌসুমে পাওয়া যায়।",
      price: 120,
      stock: 200,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    {
      sellerId: seller3.id,
      categoryId: catFruits.id,
      title: "Guava (Peyara)",
      titleBn: "পেয়ারা",
      slug: "guava-peyara-seller3",
      description: "Fresh white guavas from Bogura. Crispy, sweet and high in Vitamin C.",
      descriptionBn: "বগুড়ার তাজা সাদা পেয়ারা। মুচমুচে, মিষ্টি এবং ভিটামিন সি সমৃদ্ধ।",
      price: 60,
      stock: 180,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    // Spices — seller1
    {
      sellerId: seller1.id,
      categoryId: catSpices.id,
      title: "Turmeric Powder (Holud)",
      titleBn: "হলুদ গুঁড়া",
      slug: "turmeric-powder-seller1",
      description: "Pure organic turmeric powder. No additives or artificial color. Essential spice for Bengali cooking.",
      descriptionBn: "বিশুদ্ধ জৈব হলুদ গুঁড়া। কোনো সংযোজন বা কৃত্রিম রং নেই। বাংলাদেশী রান্নার অপরিহার্য মশলা।",
      price: 150,
      stock: 100,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    {
      sellerId: seller1.id,
      categoryId: catSpices.id,
      title: "Red Chili Powder (Morich Gura)",
      titleBn: "মরিচের গুঁড়া",
      slug: "red-chili-powder-seller1",
      description: "Hot and fragrant red chili powder. Sun-dried and stone-ground for maximum flavor.",
      descriptionBn: "ঝাল ও সুগন্ধি লাল মরিচের গুঁড়া। সর্বোচ্চ স্বাদের জন্য রোদে শুকানো ও পাথরে বাটা।",
      price: 180,
      stock: 80,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    // Seeds — seller3
    {
      sellerId: seller3.id,
      categoryId: catSeeds.id,
      title: "Hybrid Tomato Seeds",
      titleBn: "হাইব্রিড টমেটো বীজ",
      slug: "hybrid-tomato-seeds-seller3",
      description: "High-yield hybrid tomato seeds. Suitable for all seasons in Bangladesh. 90%+ germination rate.",
      descriptionBn: "উচ্চ-ফলনশীল হাইব্রিড টমেটো বীজ। বাংলাদেশে সব মৌসুমের জন্য উপযুক্ত। ৯০%+ অঙ্কুরোদগম হার।",
      price: 250,
      stock: 50,
      unit: "piece",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    // Dairy — seller2
    {
      sellerId: seller2.id,
      categoryId: catDairy.id,
      title: "Fresh Cow Milk",
      titleBn: "তাজা গরুর দুধ",
      slug: "fresh-cow-milk-seller2",
      description: "Pure fresh cow milk from our farm in Dinajpur. Collected daily in the morning.",
      descriptionBn: "দিনাজপুরের আমাদের খামার থেকে বিশুদ্ধ তাজা গরুর দুধ। প্রতিদিন সকালে সংগ্রহ করা হয়।",
      price: 80,
      stock: 100,
      unit: "liter",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.active,
    },
    // Farming Tools (auction eligible) — seller3
    {
      sellerId: seller3.id,
      categoryId: catTools.id,
      subcategoryId: subHandTools.id,
      title: "Used Hand Plow Set",
      titleBn: "পুরানো হাত লাঙল সেট",
      slug: "used-hand-plow-set-seller3",
      description: "Used but well-maintained hand plow set. Includes iron blade, wooden handle and rope. Good for small plots.",
      descriptionBn: "ব্যবহৃত কিন্তু ভালোভাবে রক্ষণাবেক্ষণ করা হাত লাঙল সেট। লোহার ফলা, কাঠের হাতল এবং দড়ি সহ। ছোট জমির জন্য উপযুক্ত।",
      price: 800,
      stock: 1,
      unit: "piece",
      condition: ProductCondition.used,
      listingType: ProductListingType.auction,
      status: ProductStatus.active,
    },
    {
      sellerId: seller1.id,
      categoryId: catTools.id,
      subcategoryId: subMachinery.id,
      title: "Water Pump (Used)",
      titleBn: "ওয়াটার পাম্প (পুরানো)",
      slug: "water-pump-used-seller1",
      description: "Working 1.5 HP water pump. Used for 2 seasons. Perfect for irrigation. Minor surface rust only.",
      descriptionBn: "কার্যকর ১.৫ HP ওয়াটার পাম্প। ২ মৌসুম ব্যবহার করা হয়েছে। সেচের জন্য চমৎকার।",
      price: 3500,
      stock: 1,
      unit: "piece",
      condition: ProductCondition.used,
      listingType: ProductListingType.auction,
      status: ProductStatus.active,
    },
    // Draft product (for admin approve/reject demo)
    {
      sellerId: seller2.id,
      categoryId: catVeg.id,
      subcategoryId: subRootVeg.id,
      title: "Onion (Peyaj)",
      titleBn: "পেঁয়াজ",
      slug: "onion-peyaj-seller2",
      description: "Fresh red onions from Pabna. Strong aroma, great for cooking.",
      descriptionBn: "পাবনার তাজা লাল পেঁয়াজ। তীব্র সুগন্ধ, রান্নার জন্য চমৎকার।",
      price: 55,
      stock: 400,
      unit: "kg",
      condition: ProductCondition.new,
      listingType: ProductListingType.fixed,
      status: ProductStatus.draft,
    },
  ];

  const createdProducts: Record<string, string> = {};

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      const created = await prisma.product.create({ data: p });
      createdProducts[p.slug] = created.id;
      console.log(`  ✓ Product: ${p.title}`);
    } else {
      createdProducts[p.slug] = existing.id;
      console.log(`  → Product already exists: ${p.title}`);
    }
  }

  console.log("✅ Products created");

  // ── Auction ─────────────────────────────────────────────────────────────
  console.log("Creating auction...");

  const auctionProductId = createdProducts["used-hand-plow-set-seller3"];
  if (auctionProductId) {
    const existingAuction = await prisma.auction.findFirst({
      where: { productId: auctionProductId },
    });

    if (!existingAuction) {
      const now = new Date();
      const endTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

      await prisma.auction.create({
        data: {
          productId: auctionProductId,
          sellerId: seller3.id,
          startPrice: 500,
          currentPrice: 650,
          minIncrement: 50,
          startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // started 2h ago
          endTime,
          status: AuctionStatus.active,
          bids: {
            create: [
              {
                bidderId: buyer1.id,
                amount: 600,
                createdAt: new Date(now.getTime() - 90 * 60 * 1000),
              },
              {
                bidderId: buyer2.id,
                amount: 650,
                createdAt: new Date(now.getTime() - 30 * 60 * 1000),
              },
            ],
          },
        },
      });
      console.log("  ✓ Auction created for: Used Hand Plow Set");
    } else {
      console.log("  → Auction already exists");
    }
  }

  console.log("✅ Auction created");

  // ── Market Prices ────────────────────────────────────────────────────────
  console.log("Creating market prices...");

  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const marketPrices = [
    // Vegetables
    { categoryId: catVeg.id, productName: "Tomato", minPrice: 30, maxPrice: 50, unit: "kg", market: "Karwan Bazar, Dhaka" },
    { categoryId: catVeg.id, productName: "Potato (Alu)", minPrice: 25, maxPrice: 35, unit: "kg", market: "Karwan Bazar, Dhaka" },
    { categoryId: catVeg.id, productName: "Spinach (Palaang Shak)", minPrice: 20, maxPrice: 35, unit: "kg", market: "Kawran Bazar, Dhaka" },
    { categoryId: catVeg.id, productName: "Bottle Gourd (Lau)", minPrice: 25, maxPrice: 40, unit: "piece", market: "Moghbazar, Dhaka" },
    { categoryId: catVeg.id, productName: "Onion (Peyaj)", minPrice: 50, maxPrice: 70, unit: "kg", market: "Karwan Bazar, Dhaka" },
    { categoryId: catVeg.id, productName: "Green Chili (Kacha Morich)", minPrice: 80, maxPrice: 150, unit: "kg", market: "Badamtoli, Chittagong" },
    { categoryId: catVeg.id, productName: "Eggplant (Begun)", minPrice: 30, maxPrice: 45, unit: "kg", market: "Shyambazar, Dhaka" },
    // Rice
    { categoryId: catRice.id, productName: "Miniket Rice", minPrice: 68, maxPrice: 75, unit: "kg", market: "Badamtoli, Chittagong" },
    { categoryId: catRice.id, productName: "Najirshail Rice", minPrice: 80, maxPrice: 90, unit: "kg", market: "Moghbazar, Dhaka" },
    { categoryId: catRice.id, productName: "Paijam Rice (BRRI-28)", minPrice: 52, maxPrice: 60, unit: "kg", market: "Karwan Bazar, Dhaka" },
    { categoryId: catRice.id, productName: "Wheat (Gom)", minPrice: 35, maxPrice: 42, unit: "kg", market: "Badamtoli, Chittagong" },
    // Fruits
    { categoryId: catFruits.id, productName: "Banana (Kola)", minPrice: 50, maxPrice: 80, unit: "dozen", market: "Karwan Bazar, Dhaka" },
    { categoryId: catFruits.id, productName: "Guava (Peyara)", minPrice: 55, maxPrice: 70, unit: "kg", market: "Moghbazar, Dhaka" },
    { categoryId: catFruits.id, productName: "Papaya (Pepe)", minPrice: 30, maxPrice: 50, unit: "kg", market: "Shyambazar, Dhaka" },
    // Spices
    { categoryId: catSpices.id, productName: "Turmeric (Holud)", minPrice: 130, maxPrice: 160, unit: "kg", market: "Karwan Bazar, Dhaka" },
    { categoryId: catSpices.id, productName: "Coriander (Dhone)", minPrice: 90, maxPrice: 130, unit: "kg", market: "Moghbazar, Dhaka" },
    { categoryId: catSpices.id, productName: "Ginger (Ada)", minPrice: 80, maxPrice: 120, unit: "kg", market: "Badamtoli, Chittagong" },
    { categoryId: catSpices.id, productName: "Garlic (Roshun)", minPrice: 120, maxPrice: 180, unit: "kg", market: "Karwan Bazar, Dhaka" },
    // Fish
    { categoryId: catFishMeat.id, productName: "Hilsa Fish (Ilish)", minPrice: 800, maxPrice: 1500, unit: "kg", market: "Badamtoli, Chittagong" },
    { categoryId: catFishMeat.id, productName: "Catfish (Shinghi)", minPrice: 350, maxPrice: 500, unit: "kg", market: "Karwan Bazar, Dhaka" },
    // Dairy
    { categoryId: catDairy.id, productName: "Cow Milk", minPrice: 70, maxPrice: 90, unit: "liter", market: "Moghbazar, Dhaka" },
    { categoryId: catDairy.id, productName: "Deshi Egg (Murgi Dim)", minPrice: 10, maxPrice: 14, unit: "piece", market: "Karwan Bazar, Dhaka" },
  ];

  let priceCount = 0;
  for (const mp of marketPrices) {
    const existing = await prisma.marketPrice.findFirst({
      where: { productName: mp.productName, market: mp.market },
    });
    if (!existing) {
      await prisma.marketPrice.create({
        data: { ...mp, recordedAt: today },
      });
      priceCount++;
    }
  }

  console.log(`✅ Market prices created: ${priceCount} records`);

  // ── Cart for buyer1 ──────────────────────────────────────────────────────
  console.log("Creating demo cart...");

  const existingCart = await prisma.cart.findUnique({ where: { buyerId: buyer1.id } });
  if (!existingCart && createdProducts["fresh-tomato-seller1"] && createdProducts["miniket-rice-premium-seller2"]) {
    await prisma.cart.create({
      data: {
        buyerId: buyer1.id,
        items: {
          create: [
            { productId: createdProducts["fresh-tomato-seller1"], quantity: 2 },
            { productId: createdProducts["miniket-rice-premium-seller2"], quantity: 5 },
          ],
        },
      },
    });
    console.log("  ✓ Cart created for buyer@krishihat.com");
  }

  console.log("✅ Demo data complete!\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  DEMO ACCOUNTS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Super Admin : superadmin@krishihat.com / SuperAdmin@123");
  console.log("  Admin       : admin@krishihat.com      / Admin@123");
  console.log("  Moderator   : moderator@krishihat.com  / Moderator@123");
  console.log("  Seller 1    : seller@krishihat.com     / Seller@123  (Rahim — কৃষি ভান্ডার)");
  console.log("  Seller 2    : seller2@krishihat.com    / Seller@123  (Karim — ধান ও চাল ভান্ডার)");
  console.log("  Seller 3    : seller3@krishihat.com    / Seller@123  (Fatema — মৌসুমী কৃষি)");
  console.log("  Buyer 1     : buyer@krishihat.com      / Buyer@123   (Aisha — has items in cart)");
  console.log("  Buyer 2     : buyer2@krishihat.com     / Buyer@123   (Shakil)");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  CATEGORIES: 8 categories, 4 subcategories");
  console.log("  PRODUCTS  : 16 active + 1 draft = 17 total products");
  console.log("  AUCTION   : 1 live auction with 2 bids");
  console.log("  PRICES    : 22 market price records");
  console.log("  CART      : buyer1 has 2 items in cart");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());