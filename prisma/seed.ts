import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KrishiHat database...");

  const hash = (pw: string) => bcrypt.hashSync(pw, 12);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@krishihat.com" },
    update: {},
    create: {
      email: "superadmin@krishihat.com",
      passwordHash: hash("SuperAdmin@123"),
      role: Role.super_admin,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: { fullName: "Super Admin", phone: "01700000000" },
      },
    },
  });

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@krishihat.com" },
    update: {},
    create: {
      email: "admin@krishihat.com",
      passwordHash: hash("Admin@123"),
      role: Role.admin,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: { fullName: "Platform Admin", phone: "01700000001" },
      },
    },
  });

  // Moderator
  await prisma.user.upsert({
    where: { email: "moderator@krishihat.com" },
    update: {},
    create: {
      email: "moderator@krishihat.com",
      passwordHash: hash("Moderator@123"),
      role: Role.moderator,
      status: UserStatus.active,
      emailVerified: true,
      profile: {
        create: { fullName: "Platform Moderator", phone: "01700000002" },
      },
    },
  });

  // Seller
  const seller = await prisma.user.upsert({
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
          fullName: "Demo Seller",
          phone: "01711111111",
          district: "Dhaka",
        },
      },
      sellerProfile: {
        create: {
          shopName: "কৃষি ভান্ডার",
          shopDescription: "Fresh vegetables and farming tools",
          isVerified: true,
        },
      },
    },
  });

  // Buyer
  await prisma.user.upsert({
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
          fullName: "Demo Buyer",
          phone: "01722222222",
          district: "Chittagong",
        },
      },
    },
  });

  // Categories
  const vegetables = await prisma.category.upsert({
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

  const farmingTools = await prisma.category.upsert({
    where: { slug: "farming-tools" },
    update: {},
    create: {
      name: "Farming Tools & Equipment",
      nameBn: "কৃষি যন্ত্রপাতি",
      slug: "farming-tools",
      auctionAllowed: true, // auctions allowed for this category
      sortOrder: 2,
    },
  });

  const grains = await prisma.category.upsert({
    where: { slug: "grains" },
    update: {},
    create: {
      name: "Grains & Rice",
      nameBn: "ধান ও চাল",
      slug: "grains",
      auctionAllowed: false,
      sortOrder: 3,
    },
  });

  // Subcategories
  await prisma.subcategory.upsert({
    where: { slug: "leafy-vegetables" },
    update: {},
    create: {
      categoryId: vegetables.id,
      name: "Leafy Vegetables",
      nameBn: "পাতা সবজি",
      slug: "leafy-vegetables",
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: "hand-tools" },
    update: {},
    create: {
      categoryId: farmingTools.id,
      name: "Hand Tools",
      nameBn: "হাতিয়ার",
      slug: "hand-tools",
    },
  });

  // Market prices
  await prisma.marketPrice.createMany({
    data: [
      {
        categoryId: vegetables.id,
        productName: "Tomato",
        minPrice: 30,
        maxPrice: 50,
        unit: "kg",
        market: "Karwan Bazar, Dhaka",
      },
      {
        categoryId: vegetables.id,
        productName: "Potato",
        minPrice: 25,
        maxPrice: 35,
        unit: "kg",
        market: "Karwan Bazar, Dhaka",
      },
      {
        categoryId: grains.id,
        productName: "Miniket Rice",
        minPrice: 60,
        maxPrice: 75,
        unit: "kg",
        market: "Badamtoli, Chittagong",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete.");
  console.log("Demo accounts:");
  console.log("  superadmin@krishihat.com / SuperAdmin@123");
  console.log("  admin@krishihat.com      / Admin@123");
  console.log("  moderator@krishihat.com  / Moderator@123");
  console.log("  seller@krishihat.com     / Seller@123");
  console.log("  buyer@krishihat.com      / Buyer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());