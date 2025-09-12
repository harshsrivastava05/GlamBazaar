import { AttributeType, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// --------- Types & Interfaces ----------
interface CategoryData {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface ProductData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: number;
  brand: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  sku?: string;
  weight?: number;
  isActive: boolean;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string;
}

interface ProductImageData {
  productId: number;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface ProductVariantData {
  productId: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  weight?: number;
  isActive: boolean;
}

interface ReviewData {
  userId: string;
  productId: number;
  rating: number;
  title?: string;
  content?: string;
  isApproved: boolean;
}

interface AttributeData {
  name: string;
  type: string;
  displayName: string;
}


// --------- Helpers ----------
const randomInt = (min: number, max: number): number =>
  faker.number.int({ min, max });

const createSlug = (text: string): string =>
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// --------- Jewelry & Cosmetics Categories ----------
const jewelryCosmetics = {
  categories: [
    {
      name: "Necklaces & Pendants",
      description: "Beautiful necklaces and pendant jewelry for every occasion"
    },
    {
      name: "Earrings",
      description: "Stunning earrings from studs to statement pieces"
    },
    {
      name: "Bracelets & Bangles",
      description: "Elegant bracelets and bangles for your wrists"
    },
    {
      name: "Rings",
      description: "Exquisite rings for engagement, wedding, or fashion"
    },
    {
      name: "Face & Makeup",
      description: "Complete range of face makeup and beauty products"
    },
    {
      name: "Skincare",
      description: "Premium skincare products for healthy, glowing skin"
    },
    {
      name: "Hair Care",
      description: "Professional hair care products for all hair types"
    },
    {
      name: "Fragrances",
      description: "Luxury fragrances and perfumes for men and women"
    }
  ],
  jewelryProducts: [
    "Diamond Tennis Necklace", "Gold Chain Pendant", "Pearl Drop Earrings", 
    "Silver Hoop Earrings", "Rose Gold Bracelet", "Diamond Eternity Ring",
    "Sapphire Statement Necklace", "Emerald Stud Earrings", "Platinum Wedding Band",
    "Ruby Cocktail Ring", "Gold Charm Bracelet", "Diamond Solitaire Pendant",
    "Silver Link Chain", "Pearl Strand Necklace", "Gold Bangle Set",
    "Diamond Cluster Earrings", "Gemstone Tennis Bracelet", "Vintage Gold Ring"
  ],
  cosmeticProducts: [
    "Liquid Foundation", "Matte Lipstick", "Eyeshadow Palette", "Mascara",
    "Concealer Stick", "Blush Compact", "Bronzer Powder", "Highlighting Powder",
    "Eyeliner Pencil", "Lip Gloss", "Setting Spray", "Primer Base",
    "Anti-Aging Serum", "Moisturizing Cream", "Cleansing Oil", "Toner",
    "Face Mask", "Exfoliating Scrub", "Eye Cream", "Sunscreen SPF 50",
    "Shampoo", "Conditioner", "Hair Mask", "Styling Gel",
    "Eau de Parfum", "Body Mist", "Cologne", "Perfume Oil"
  ],
  brands: [
    "Tiffany & Co", "Cartier", "Pandora", "Swarovski", "Kay Jewelers",
    "L'Oréal", "Maybelline", "MAC", "Urban Decay", "NARS",
    "Clinique", "Estée Lauder", "Lancôme", "Shiseido", "Olay",
    "Chanel", "Dior", "Tom Ford", "Versace", "Calvin Klein"
  ]
};

// --------- Seeder Functions ----------
async function insertCategories(): Promise<number> {
  const categoriesData: CategoryData[] = jewelryCosmetics.categories.map((cat, index) => ({
    name: cat.name,
    slug: createSlug(cat.name),
    description: cat.description,
    sortOrder: index + 1,
    isActive: true,
  }));

  await prisma.category.createMany({
    data: categoriesData,
    skipDuplicates: true,
  });

  console.log(`Inserted ${categoriesData.length} categories`);
  return categoriesData.length;
}

async function insertAttributes(): Promise<void> {
  const attributes: AttributeData[] = [
    { name: "color", type: AttributeType.COLOR, displayName: "Color" },
    { name: "size", type: AttributeType.SIZE, displayName: "Size" }, // Corrected type
    { name: "material", type: AttributeType.MATERIAL, displayName: "Material" },
    { name: "weight", type: AttributeType.WEIGHT, displayName: "Weight" },
  ];

  for (const attr of attributes) {
    await prisma.attribute.upsert({
      where: { id: -1 }, // Use a non-existent ID to always create
      update: {},
      create: {
        name: attr.name,
        type: attr.type as AttributeType,
        displayName: attr.displayName,
      },
    });
  }

  // Get created attributes
  const colorAttr = await prisma.attribute.findFirst({ where: { name: "color" } });
  const sizeAttr = await prisma.attribute.findFirst({ where: { name: "size" } });
  const materialAttr = await prisma.attribute.findFirst({ where: { name: "material" } });

  // Insert attribute options
  const colorOptions = [
    { value: "gold", displayValue: "Gold", colorHex: "#FFD700" },
    { value: "silver", displayValue: "Silver", colorHex: "#C0C0C0" },
    { value: "rose-gold", displayValue: "Rose Gold", colorHex: "#E8B4A0" },
    { value: "platinum", displayValue: "Platinum", colorHex: "#E5E4E2" },
    { value: "red", displayValue: "Red", colorHex: "#FF0000" },
    { value: "pink", displayValue: "Pink", colorHex: "#FFC0CB" },
    { value: "nude", displayValue: "Nude", colorHex: "#F5DEB3" },
  ];

  const sizeOptions = [
    { value: "xs", displayValue: "Extra Small" },
    { value: "s", displayValue: "Small" },
    { value: "m", displayValue: "Medium" },
    { value: "l", displayValue: "Large" },
    { value: "xl", displayValue: "Extra Large" },
    { value: "5", displayValue: "Size 5" },
    { value: "6", displayValue: "Size 6" },
    { value: "7", displayValue: "Size 7" },
    { value: "8", displayValue: "Size 8" },
    { value: "9", displayValue: "Size 9" },
  ];

  const materialOptions = [
    { value: "gold", displayValue: "Gold" },
    { value: "silver", displayValue: "Silver" },
    { value: "platinum", displayValue: "Platinum" },
    { value: "diamond", displayValue: "Diamond" },
    { value: "pearl", displayValue: "Pearl" },
    { value: "organic", displayValue: "Organic" },
    { value: "synthetic", displayValue: "Synthetic" },
  ];

  if (colorAttr) {
    await prisma.attributeOption.createMany({
      data: colorOptions.map(opt => ({
        attributeId: colorAttr.id,
        ...opt
      })),
      skipDuplicates: true,
    });
  }

  if (sizeAttr) {
    await prisma.attributeOption.createMany({
      data: sizeOptions.map(opt => ({
        attributeId: sizeAttr.id,
        ...opt
      })),
      skipDuplicates: true,
    });
  }

  if (materialAttr) {
    await prisma.attributeOption.createMany({
      data: materialOptions.map(opt => ({
        attributeId: materialAttr.id,
        ...opt
      })),
      skipDuplicates: true,
    });
  }

  console.log("Inserted attributes and attribute options");
}

async function insertProducts(categoryCount: number): Promise<number> {
  const products: ProductData[] = [];
  const productCount = 50;
  
  const allProducts = [
    ...jewelryCosmetics.jewelryProducts,
    ...jewelryCosmetics.cosmeticProducts
  ];

  for (let i = 0; i < productCount; i++) {
    const productName = allProducts[i % allProducts.length] || faker.commerce.productName();
    const basePrice = randomInt(500, 15000);
    const hasSale = faker.datatype.boolean({ probability: 0.3 });
    
    products.push({
      name: productName,
      slug: createSlug(productName) + `-${i + 1}`,
      description: faker.commerce.productDescription() + " " + faker.lorem.sentences(3),
      shortDescription: faker.commerce.productAdjective() + " " + faker.commerce.productMaterial(),
      categoryId: randomInt(1, categoryCount),
      brand: faker.helpers.arrayElement(jewelryCosmetics.brands),
      basePrice,
      salePrice: hasSale ? Math.floor(basePrice * 0.8) : undefined,
      costPrice: Math.floor(basePrice * 0.6),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      weight: faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 2 }),
      isActive: true,
      featured: faker.datatype.boolean({ probability: 0.2 }),
      metaTitle: productName,
      metaDescription: faker.commerce.productDescription(),
      tags: faker.helpers.arrayElements([
        "luxury", "premium", "jewelry", "cosmetics", "beauty", 
        "fashion", "elegant", "modern", "classic", "trendy"
      ], { min: 2, max: 5 }).join(", "),
    });
  }

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  console.log(`Inserted ${productCount} products`);
  return productCount;
}

async function insertProductImages(productCount: number): Promise<void> {
  const images: ProductImageData[] = [];

  for (let productId = 1; productId <= productCount; productId++) {
    // Primary image
    images.push({
      productId,
      url: faker.image.urlLoremFlickr({ 
        width: 800, 
        height: 800, 
        category: productId <= 25 ? "jewelry" : "beauty"
      }),
      altText: `Product ${productId} main image`,
      sortOrder: 1,
      isPrimary: true,
    });

    // Additional images (1-3 per product)
    const additionalImages = randomInt(1, 3);
    for (let j = 2; j <= additionalImages + 1; j++) {
      images.push({
        productId,
        url: faker.image.urlLoremFlickr({ 
          width: 800, 
          height: 800, 
          category: productId <= 25 ? "jewelry" : "beauty"
        }),
        altText: `Product ${productId} image ${j}`,
        sortOrder: j,
        isPrimary: false,
      });
    }
  }

  await prisma.productImage.createMany({
    data: images,
    skipDuplicates: true,
  });

  console.log(`Inserted ${images.length} product images`);
}

async function insertProductVariants(productCount: number): Promise<void> {
  const variants: ProductVariantData[] = [];
  const attributes = await prisma.attribute.findMany({
    include: { options: true }
  });

  for (let productId = 1; productId <= productCount; productId++) {
    const variantCount = randomInt(1, 4);
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) continue;

    for (let v = 0; v < variantCount; v++) {
      const variantPrice = Number(product.basePrice) + randomInt(-200, 500);
      
      variants.push({
        productId,
        sku: `${product.sku}-V${v + 1}`,
        price: Math.max(variantPrice, 100),
        compareAtPrice: variantPrice + randomInt(100, 1000),
        costPrice: Math.floor(variantPrice * 0.7),
        stockQuantity: randomInt(5, 100),
        weight: faker.number.float({ min: 0.1, max: 3.0, fractionDigits: 2 }),
        isActive: true,
      });
    }
  }

  // Create variants in batches to avoid memory issues
  const batchSize = 50;
  for (let i = 0; i < variants.length; i += batchSize) {
    const batch = variants.slice(i, i + batchSize);
    await prisma.productVariant.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  // Add variant attributes
  const createdVariants = await prisma.productVariant.findMany();
  
  for (const variant of createdVariants) {
    // Randomly assign 1-3 attributes to each variant
    const numAttributes = randomInt(1, 3);
    const selectedAttributes = faker.helpers.arrayElements(attributes, numAttributes);
    
    for (const attribute of selectedAttributes) {
      if (attribute.options.length > 0) {
        const selectedOption = faker.helpers.arrayElement(attribute.options);
        
        try {
          await prisma.variantAttribute.create({
            data: {
              variantId: variant.id,
              attributeId: attribute.id,
              attributeOptionId: selectedOption.id,
            },
          });
        } catch (error) {
          // Skip if combination already exists
          continue;
        }
      }
    }
  }

  console.log(`Inserted ${variants.length} product variants with attributes`);
}

async function insertReviews(productCount: number): Promise<void> {
  const reviews: ReviewData[] = [];
  const userIds = Array.from({ length: 20 }, () => faker.string.uuid());

  for (let productId = 1; productId <= productCount; productId++) {
    const reviewCount = randomInt(2, 8);
    
    for (let i = 0; i < reviewCount; i++) {
      const rating = randomInt(1, 5);
      const titles = [
        "Excellent quality!", "Love it!", "Great purchase", "Highly recommend",
        "Perfect!", "Amazing product", "Good value", "Beautiful design",
        "Fast shipping", "Exactly as described", "Will buy again", "Satisfied"
      ];

      reviews.push({
        userId: faker.helpers.arrayElement(userIds),
        productId,
        rating,
        title: faker.helpers.arrayElement(titles),
        content: faker.lorem.sentences({ min: 1, max: 4 }),
        isApproved: faker.datatype.boolean({ probability: 0.8 }),
      });
    }
  }

  await prisma.review.createMany({
    data: reviews,
    skipDuplicates: true,
  });

  console.log(`Inserted ${reviews.length} reviews`);
}

async function updateProductStats(): Promise<void> {
  // Update average ratings and review counts for products
  const products = await prisma.product.findMany({
    include: {
      reviews: {
        where: { isApproved: true }
      }
    }
  });

  for (const product of products) {
    const approvedReviews = product.reviews;
    const reviewCount = approvedReviews.length;
    
    if (reviewCount > 0) {
      const averageRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          reviewCount,
        }
      });
    }
  }

  console.log("Updated product statistics");
}

// --------- Main Seed Function ----------
async function main(): Promise<void> {
  try {
    console.log("Starting database seeding...");

    // Clear existing data (optional - remove if you don't want to clear)
    await prisma.variantAttribute.deleteMany();
    await prisma.attributeOption.deleteMany();
    await prisma.attribute.deleteMany();
    await prisma.review.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log("Cleared existing data");

    const categoryCount = await insertCategories();
    await insertAttributes();
    const productCount = await insertProducts(categoryCount);
    await insertProductImages(productCount);
    await insertProductVariants(productCount);
    await insertReviews(productCount);
    await updateProductStats();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run Seeder
main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});