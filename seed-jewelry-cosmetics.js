import mysql, { Connection } from "mysql2/promise";
import { faker } from "@faker-js/faker";

// --------- Types & Interfaces ----------
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

// --------- Review Interface ----------
interface Review {
  productId: number;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: number;
  isApproved: number;
  createdAt: Date;
  updatedAt: Date;
}

// --------- Insert Reviews ----------
async function insertReviews(conn: Connection, productCount: number): Promise<void> {
  const reviews: Review[] = [];
  for (let productId = 1; productId <= productCount; productId++) {
    const reviewCount = randomInt(3, 10); // 3-10 reviews per product
    for (let i = 0; i < reviewCount; i++) {
      reviews.push({
        productId,
        userId: faker.string.uuid(), // random user ID
        rating: randomInt(1, 5),
        title: faker.lorem.words({ min: 2, max: 5 }),
        comment: faker.lorem.sentences({ min: 1, max: 3 }),
        verifiedPurchase: faker.datatype.boolean() ? 1 : 0,
        isApproved: faker.datatype.boolean() ? 1 : 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  await conn.query(
    `INSERT INTO reviews (productId, userId, rating, title, comment, verifiedPurchase, isApproved, createdAt, updatedAt) VALUES ?`,
    [
      reviews.map((r) => [
        r.productId,
        r.userId,
        r.rating,
        r.title,
        r.comment,
        r.verifiedPurchase,
        r.isApproved,
        r.createdAt,
        r.updatedAt,
      ]),
    ]
  );

  console.log(`Inserted ${reviews.length} reviews for ${productCount} products`);
}


interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: number;
  brand: string;
  basePrice: number;
  salePrice: number | null;
  costPrice: number;
  sku: string;
  weight: number;
  isActive: number;
  featured: number;
  metaTitle: string;
  metaDescription: string;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  productId: number;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: number;
  createdAt: Date;
}

interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  stockQuantity: number;
  weight: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

// --------- DB Config ----------
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "your_database_name",
};

// --------- Helpers ----------
const randomInt = (min: number, max: number): number =>
  faker.number.int({ min, max });

// --------- Seeder Functions ----------
async function insertCategories(conn: Connection): Promise<number> {
  const categories: Category[] = [];
  const categoryCount = 6;

  for (let i = 1; i <= categoryCount; i++) {
    categories.push({
      id: i,
      name: faker.commerce.department(),
      slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
      description: faker.commerce.productDescription(),
      image: faker.image.urlLoremFlickr({ category: "fashion" }),
      sortOrder: i,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await conn.query(
    `INSERT INTO categories (id, name, slug, description, image, sortOrder, isActive, createdAt, updatedAt) VALUES ?`,
    [
      categories.map((c) => [
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image,
        c.sortOrder,
        c.isActive,
        c.createdAt,
        c.updatedAt,
      ]),
    ]
  );

  console.log(`Inserted ${categoryCount} categories`);
  return categoryCount;
}

async function insertProducts(conn: Connection, categoryCount: number): Promise<number> {
  const products: Product[] = [];
  const productCount = 40;

  for (let i = 1; i <= productCount; i++) {
    products.push({
      id: i,
      name: faker.commerce.productName(),
      slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
      description: faker.commerce.productDescription(),
      shortDescription: faker.commerce.productAdjective(),
      categoryId: randomInt(1, categoryCount),
      brand: faker.company.name(),
      basePrice: randomInt(1000, 50000),
      salePrice: faker.datatype.boolean() ? randomInt(800, 45000) : null,
      costPrice: randomInt(500, 20000),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      weight: randomInt(1, 10),
      isActive: 1,
      featured: faker.datatype.boolean() ? 1 : 0,
      metaTitle: faker.commerce.productName(),
      metaDescription: faker.commerce.productDescription(),
      tags: faker.commerce.productMaterial(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await conn.query(
    `INSERT INTO products (id, name, slug, description, shortDescription, categoryId, brand, basePrice, salePrice, costPrice, sku, weight, isActive, featured, metaTitle, metaDescription, tags, createdAt, updatedAt) VALUES ?`,
    [
      products.map((p) => [
        p.id,
        p.name,
        p.slug,
        p.description,
        p.shortDescription,
        p.categoryId,
        p.brand,
        p.basePrice,
        p.salePrice,
        p.costPrice,
        p.sku,
        p.weight,
        p.isActive,
        p.featured,
        p.metaTitle,
        p.metaDescription,
        p.tags,
        p.createdAt,
        p.updatedAt,
      ]),
    ]
  );

  console.log(`Inserted ${productCount} products`);
  return productCount;
}

async function insertProductImages(conn: Connection, productCount: number): Promise<void> {
  const images: ProductImage[] = [];

  for (let productId = 1; productId <= productCount; productId++) {
    images.push({
      productId,
      url: faker.image.urlLoremFlickr({ category: "fashion" }),
      altText: faker.commerce.productAdjective(),
      sortOrder: 1,
      isPrimary: 1,
      createdAt: new Date(),
    });
  }

  await conn.query(
    `INSERT INTO product_images (productId, url, altText, sortOrder, isPrimary, createdAt) VALUES ?`,
    [images.map((i) => [i.productId, i.url, i.altText, i.sortOrder, i.isPrimary, i.createdAt])]
  );

  console.log(`Inserted images for ${productCount} products`);
}

async function insertProductVariants(conn: Connection, productCount: number): Promise<void> {
  const variants: ProductVariant[] = [];
  let id = 1;

  for (let productId = 1; productId <= productCount; productId++) {
    const variantCount = randomInt(1, 3);
    for (let v = 0; v < variantCount; v++) {
      variants.push({
        id: id++,
        productId,
        sku: faker.string.alphanumeric(10).toUpperCase(),
        price: randomInt(1000, 50000),
        compareAtPrice: randomInt(2000, 55000),
        costPrice: randomInt(800, 25000),
        stockQuantity: randomInt(1, 50),
        weight: randomInt(1, 10),
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  await conn.query(
    `INSERT INTO product_variants (id, productId, sku, price, compareAtPrice, costPrice, stockQuantity, weight, isActive, createdAt, updatedAt) VALUES ?`,
    [
      variants.map((v) => [
        v.id,
        v.productId,
        v.sku,
        v.price,
        v.compareAtPrice,
        v.costPrice,
        v.stockQuantity,
        v.weight,
        v.isActive,
        v.createdAt,
        v.updatedAt,
      ]),
    ]
  );

  console.log(`Inserted ${variants.length} product variants`);
}

// --------- Main Seed Function ----------
async function seedDB(): Promise<void> {
  const conn = await mysql.createConnection(dbConfig);

  const categoryCount = await insertCategories(conn);
  const productCount = await insertProducts(conn, categoryCount);
  await insertProductImages(conn, productCount);
  await insertProductVariants(conn, productCount);
  await insertReviews(conn, productCount);


  console.log("Database seeded successfully!");
  await conn.end();
}

// Run Seeder
seedDB().catch((err) => console.error("Seeding failed:", err));
