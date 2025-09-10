import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Jewelry specific data
const JEWELRY_CATEGORIES = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Beautiful necklaces for every occasion',
    subcategories: [
      { name: 'Gold Necklaces', slug: 'gold-necklaces' },
      { name: 'Silver Necklaces', slug: 'silver-necklaces' },
      { name: 'Diamond Necklaces', slug: 'diamond-necklaces' },
      { name: 'Pearl Necklaces', slug: 'pearl-necklaces' },
    ]
  },
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Stunning rings for special moments',
    subcategories: [
      { name: 'Engagement Rings', slug: 'engagement-rings' },
      { name: 'Wedding Rings', slug: 'wedding-rings' },
      { name: 'Fashion Rings', slug: 'fashion-rings' },
      { name: 'Statement Rings', slug: 'statement-rings' },
    ]
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Elegant earrings to complete your look',
    subcategories: [
      { name: 'Stud Earrings', slug: 'stud-earrings' },
      { name: 'Drop Earrings', slug: 'drop-earrings' },
      { name: 'Hoop Earrings', slug: 'hoop-earrings' },
      { name: 'Chandelier Earrings', slug: 'chandelier-earrings' },
    ]
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Stylish bracelets for everyday wear',
    subcategories: [
      { name: 'Tennis Bracelets', slug: 'tennis-bracelets' },
      { name: 'Charm Bracelets', slug: 'charm-bracelets' },
      { name: 'Cuff Bracelets', slug: 'cuff-bracelets' },
      { name: 'Chain Bracelets', slug: 'chain-bracelets' },
    ]
  }
];

// Cosmetics specific data
const COSMETICS_CATEGORIES = [
  {
    name: 'Face Makeup',
    slug: 'face-makeup',
    description: 'Foundation, concealer, and face products',
    subcategories: [
      { name: 'Foundation', slug: 'foundation' },
      { name: 'Concealer', slug: 'concealer' },
      { name: 'Blush', slug: 'blush' },
      { name: 'Highlighter', slug: 'highlighter' },
    ]
  },
  {
    name: 'Eye Makeup',
    slug: 'eye-makeup',
    description: 'Eyeshadow, mascara, and eye cosmetics',
    subcategories: [
      { name: 'Eyeshadow', slug: 'eyeshadow' },
      { name: 'Mascara', slug: 'mascara' },
      { name: 'Eyeliner', slug: 'eyeliner' },
      { name: 'Eyebrow Products', slug: 'eyebrow-products' },
    ]
  },
  {
    name: 'Lip Makeup',
    slug: 'lip-makeup',
    description: 'Lipstick, lip gloss, and lip care',
    subcategories: [
      { name: 'Lipstick', slug: 'lipstick' },
      { name: 'Lip Gloss', slug: 'lip-gloss' },
      { name: 'Lip Liner', slug: 'lip-liner' },
      { name: 'Lip Balm', slug: 'lip-balm' },
    ]
  },
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Cleansers, moisturizers, and skincare essentials',
    subcategories: [
      { name: 'Cleanser', slug: 'cleanser' },
      { name: 'Moisturizer', slug: 'moisturizer' },
      { name: 'Serum', slug: 'serum' },
      { name: 'Sunscreen', slug: 'sunscreen' },
    ]
  }
];

const JEWELRY_BRANDS = [
  'Tiffany & Co', 'Cartier', 'Bulgari', 'Van Cleef & Arpels', 'Harry Winston',
  'Graff', 'Chopard', 'Boucheron', 'Mikimoto', 'David Yurman',
  'Pandora', 'Swarovski', 'Alex and Ani', 'Kate Spade', 'Michael Kors'
];

const COSMETICS_BRANDS = [
  'MAC', 'Urban Decay', 'Too Faced', 'NARS', 'Charlotte Tilbury',
  'Fenty Beauty', 'Rare Beauty', 'Glossier', 'Drunk Elephant', 'The Ordinary',
  'Clinique', 'Estée Lauder', 'Lancôme', 'Dior', 'Chanel',
  'Maybelline', 'L\'Oréal', 'Revlon', 'CoverGirl', 'Neutrogena'
];

// Jewelry materials and attributes
const JEWELRY_MATERIALS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold', 'Stainless Steel'];
const JEWELRY_STONES = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Pearl', 'Amethyst', 'Topaz', 'Garnet'];
const RING_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

// Cosmetics shades and types
const FOUNDATION_SHADES = [
  'Fair Light', 'Light', 'Light Medium', 'Medium', 'Medium Dark', 'Dark', 'Deep'
];
const LIPSTICK_SHADES = [
  'Ruby Red', 'Coral Pink', 'Berry', 'Nude', 'Mauve', 'Cherry', 'Rose', 'Plum'
];
const EYESHADOW_SHADES = [
  'Neutral Brown', 'Smoky Gray', 'Golden Bronze', 'Rose Gold', 'Purple', 'Blue', 'Green'
];

function generateJewelryProduct(categoryId, subcategoryName) {
  const isNecklace = subcategoryName.includes('Necklace');
  const isRing = subcategoryName.includes('Ring');
  const isEarring = subcategoryName.includes('Earring');
  const isBracelet = subcategoryName.includes('Bracelet');

  let productName;
  const material = faker.helpers.arrayElement(JEWELRY_MATERIALS);
  const stone = faker.helpers.arrayElement(JEWELRY_STONES);

  if (isNecklace) {
    productName = `${material} ${stone} Necklace`;
  } else if (isRing) {
    productName = `${material} ${stone} Ring`;
  } else if (isEarring) {
    productName = `${material} ${stone} Earrings`;
  } else if (isBracelet) {
    productName = `${material} ${stone} Bracelet`;
  } else {
    productName = `${material} ${stone} Jewelry`;
  }

  const basePrice = faker.number.int({ min: 50, max: 5000 });
  const salePrice = faker.datatype.boolean(0.3) ? basePrice * 0.8 : null;

  return {
    name: productName,
    slug: faker.helpers.slugify(productName).toLowerCase(),
    description: faker.commerce.productDescription(),
    shortDescription: faker.lorem.sentence(),
    categoryId,
    brand: faker.helpers.arrayElement(JEWELRY_BRANDS),
    basePrice: basePrice,
    salePrice: salePrice,
    featured: faker.datatype.boolean(0.2),
    isActive: true,
    tags: `${material.toLowerCase()}, ${stone.toLowerCase()}, jewelry`,
    averageRating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
    reviewCount: faker.number.int({ min: 0, max: 500 })
  };
}

function generateCosmeticsProduct(categoryId, subcategoryName) {
  let productName;
  const brand = faker.helpers.arrayElement(COSMETICS_BRANDS);

  if (subcategoryName === 'Foundation') {
    const shade = faker.helpers.arrayElement(FOUNDATION_SHADES);
    productName = `${brand} ${shade} Foundation`;
  } else if (subcategoryName === 'Lipstick') {
    const shade = faker.helpers.arrayElement(LIPSTICK_SHADES);
    productName = `${brand} ${shade} Lipstick`;
  } else if (subcategoryName === 'Eyeshadow') {
    const shade = faker.helpers.arrayElement(EYESHADOW_SHADES);
    productName = `${brand} ${shade} Eyeshadow Palette`;
  } else if (subcategoryName === 'Mascara') {
    productName = `${brand} Volumizing Mascara`;
  } else {
    productName = `${brand} ${subcategoryName}`;
  }

  const basePrice = faker.number.int({ min: 10, max: 200 });
  const salePrice = faker.datatype.boolean(0.4) ? basePrice * 0.85 : null;

  return {
    name: productName,
    slug: faker.helpers.slugify(productName).toLowerCase(),
    description: faker.commerce.productDescription(),
    shortDescription: faker.lorem.sentence(),
    categoryId,
    brand,
    basePrice: basePrice,
    salePrice: salePrice,
    featured: faker.datatype.boolean(0.15),
    isActive: true,
    tags: `${subcategoryName.toLowerCase()}, cosmetics, makeup`,
    averageRating: faker.number.float({ min: 3.0, max: 5, precision: 0.1 }),
    reviewCount: faker.number.int({ min: 0, max: 1000 })
  };
}

function generateProductImages(productId, count = 3) {
  const images = [];
  for (let i = 0; i < count; i++) {
    images.push({
      productId,
      url: faker.image.url(),
      altText: `Product image ${i + 1}`,
      sortOrder: i,
      isPrimary: i === 0
    });
  }
  return images;
}

function generateJewelryVariants(productId, productName) {
  const variants = [];
  const isRing = productName.includes('Ring');
  
  if (isRing) {
    // Generate size variants for rings
    const sizes = faker.helpers.arrayElements(RING_SIZES, { min: 3, max: 6 });
    sizes.forEach((size, index) => {
      variants.push({
        productId,
        sku: `${faker.string.alphanumeric(3).toUpperCase()}-${size}`,
        price: faker.number.int({ min: 50, max: 2000 }),
        compareAtPrice: faker.datatype.boolean(0.3) ? faker.number.int({ min: 2100, max: 2500 }) : null,
        stockQuantity: faker.number.int({ min: 0, max: 50 }),
        isActive: true
      });
    });
  } else {
    // Generate material variants for other jewelry
    const materials = faker.helpers.arrayElements(JEWELRY_MATERIALS, { min: 2, max: 4 });
    materials.forEach((material, index) => {
      variants.push({
        productId,
        sku: `${faker.string.alphanumeric(3).toUpperCase()}-${material.replace(/\s+/g, '').toUpperCase()}`,
        price: faker.number.int({ min: 50, max: 3000 }),
        compareAtPrice: faker.datatype.boolean(0.3) ? faker.number.int({ min: 3100, max: 3500 }) : null,
        stockQuantity: faker.number.int({ min: 0, max: 30 }),
        isActive: true
      });
    });
  }
  
  return variants;
}

function generateCosmeticsVariants(productId, productName) {
  const variants = [];
  
  if (productName.includes('Foundation')) {
    const shades = faker.helpers.arrayElements(FOUNDATION_SHADES, { min: 4, max: 7 });
    shades.forEach((shade, index) => {
      variants.push({
        productId,
        sku: `${faker.string.alphanumeric(3).toUpperCase()}-${shade.replace(/\s+/g, '').toUpperCase()}`,
        price: faker.number.int({ min: 20, max: 80 }),
        compareAtPrice: faker.datatype.boolean(0.2) ? faker.number.int({ min: 85, max: 100 }) : null,
        stockQuantity: faker.number.int({ min: 0, max: 100 }),
        isActive: true
      });
    });
  } else if (productName.includes('Lipstick')) {
    const shades = faker.helpers.arrayElements(LIPSTICK_SHADES, { min: 3, max: 6 });
    shades.forEach((shade, index) => {
      variants.push({
        productId,
        sku: `${faker.string.alphanumeric(3).toUpperCase()}-${shade.replace(/\s+/g, '').toUpperCase()}`,
        price: faker.number.int({ min: 15, max: 50 }),
        compareAtPrice: faker.datatype.boolean(0.2) ? faker.number.int({ min: 55, max: 70 }) : null,
        stockQuantity: faker.number.int({ min: 0, max: 80 }),
        isActive: true
      });
    });
  } else {
    // Single variant for other products
    variants.push({
      productId,
      sku: faker.string.alphanumeric(6).toUpperCase(),
      price: faker.number.int({ min: 10, max: 150 }),
      compareAtPrice: faker.datatype.boolean(0.2) ? faker.number.int({ min: 155, max: 200 }) : null,
      stockQuantity: faker.number.int({ min: 0, max: 100 }),
      isActive: true
    });
  }
  
  return variants;
}

function generateReviews(productId, userId, count = 5) {
  const reviews = [];
  for (let i = 0; i < count; i++) {
    reviews.push({
      userId,
      productId,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.sentence(4),
      content: faker.lorem.paragraph(),
      isApproved: faker.datatype.boolean(0.8)
    });
  }
  return reviews;
}

async function createAttributes() {
  console.log('Creating attributes...');
  
  // Check if attributes already exist
  const existingMaterialAttr = await prisma.attribute.findFirst({
    where: { name: 'material' }
  });
  
  const existingSizeAttr = await prisma.attribute.findFirst({
    where: { name: 'size' }
  });
  
  const existingShadeAttr = await prisma.attribute.findFirst({
    where: { name: 'shade' }
  });

  let materialAttr, sizeAttr, shadeAttr;

  // Create material attribute if it doesn't exist
  if (!existingMaterialAttr) {
    materialAttr = await prisma.attribute.create({
      data: {
        name: 'material',
        type: 'OTHER',
        displayName: 'Material'
      }
    });
  } else {
    materialAttr = existingMaterialAttr;
    console.log('ℹ️  Using existing material attribute');
  }

  // Create size attribute if it doesn't exist
  if (!existingSizeAttr) {
    sizeAttr = await prisma.attribute.create({
      data: {
        name: 'size',
        type: 'SIZE',
        displayName: 'Size'
      }
    });
  } else {
    sizeAttr = existingSizeAttr;
    console.log('ℹ️  Using existing size attribute');
  }

  // Create shade attribute if it doesn't exist
  if (!existingShadeAttr) {
    shadeAttr = await prisma.attribute.create({
      data: {
        name: 'shade',
        type: 'COLOR',
        displayName: 'Shade'
      }
    });
  } else {
    shadeAttr = existingShadeAttr;
    console.log('ℹ️  Using existing shade attribute');
  }

  // Create attribute options only if they don't exist
  const existingMaterialOptions = await prisma.attributeOption.findMany({
    where: { attributeId: materialAttr.id }
  });

  if (existingMaterialOptions.length === 0) {
    for (const material of JEWELRY_MATERIALS) {
      await prisma.attributeOption.create({
        data: {
          attributeId: materialAttr.id,
          value: material.toLowerCase().replace(/\s+/g, '_'),
          displayValue: material
        }
      });
    }
  }

  const existingSizeOptions = await prisma.attributeOption.findMany({
    where: { attributeId: sizeAttr.id }
  });

  if (existingSizeOptions.length === 0) {
    for (const size of RING_SIZES) {
      await prisma.attributeOption.create({
        data: {
          attributeId: sizeAttr.id,
          value: size,
          displayValue: `Size ${size}`
        }
      });
    }
  }

  const existingShadeOptions = await prisma.attributeOption.findMany({
    where: { attributeId: shadeAttr.id }
  });

  if (existingShadeOptions.length === 0) {
    const allShades = [...FOUNDATION_SHADES, ...LIPSTICK_SHADES, ...EYESHADOW_SHADES];
    for (const shade of allShades) {
      await prisma.attributeOption.create({
        data: {
          attributeId: shadeAttr.id,
          value: shade.toLowerCase().replace(/\s+/g, '_'),
          displayValue: shade,
          colorHex: faker.internet.color()
        }
      });
    }
  }

  return { materialAttr, sizeAttr, shadeAttr };
}

async function main() {
  try {
    console.log('🌱 Starting database seeding for Jewelry and Cosmetics...');
    
    // Check if database is properly migrated
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    
    // Test if tables exist by trying to count users
    try {
      await prisma.user.count();
      console.log('✅ Database tables found, proceeding with seeding...');
    } catch (error) {
      console.error('❌ Database tables not found. Please run migrations first:');
      console.error('   npx prisma migrate dev --name init');
      console.error('   or');
      console.error('   npx prisma db push');
      process.exit(1);
    }

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: 'test@example.com',
        role: 'USER'
      }
    });

    // Create attributes first
    const attributes = await createAttributes();

    // Create jewelry main categories and subcategories
    console.log('Creating jewelry categories...');
    const jewelryCategories = [];
    
    for (const categoryData of JEWELRY_CATEGORIES) {
      const mainCategory = await prisma.category.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          isActive: true
        }
      });

      jewelryCategories.push(mainCategory);

      // Create subcategories
      for (const subcat of categoryData.subcategories) {
        const subcategory = await prisma.category.create({
          data: {
            name: subcat.name,
            slug: subcat.slug,
            parentId: mainCategory.id,
            isActive: true
          }
        });

        // Generate products for each subcategory
        console.log(`Creating jewelry products for ${subcat.name}...`);
        const productCount = faker.number.int({ min: 5, max: 15 });
        
        for (let i = 0; i < productCount; i++) {
          const productData = generateJewelryProduct(subcategory.id, subcat.name);
          
          const product = await prisma.product.create({
            data: productData
          });

          // Create product images
          const images = generateProductImages(product.id);
          await prisma.productImage.createMany({
            data: images
          });

          // Create variants
          const variants = generateJewelryVariants(product.id, product.name);
          for (const variantData of variants) {
            await prisma.productVariant.create({
              data: variantData
            });
          }

          // Create reviews
          const reviews = generateReviews(product.id, testUser.id, faker.number.int({ min: 2, max: 8 }));
          await prisma.review.createMany({
            data: reviews
          });
        }
      }
    }

    // Create cosmetics main categories and subcategories
    console.log('Creating cosmetics categories...');
    const cosmeticsCategories = [];
    
    for (const categoryData of COSMETICS_CATEGORIES) {
      const mainCategory = await prisma.category.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          isActive: true
        }
      });

      cosmeticsCategories.push(mainCategory);

      // Create subcategories
      for (const subcat of categoryData.subcategories) {
        const subcategory = await prisma.category.create({
          data: {
            name: subcat.name,
            slug: subcat.slug,
            parentId: mainCategory.id,
            isActive: true
          }
        });

        // Generate products for each subcategory
        console.log(`Creating cosmetics products for ${subcat.name}...`);
        const productCount = faker.number.int({ min: 8, max: 20 });
        
        for (let i = 0; i < productCount; i++) {
          const productData = generateCosmeticsProduct(subcategory.id, subcat.name);
          
          const product = await prisma.product.create({
            data: productData
          });

          // Create product images
          const images = generateProductImages(product.id);
          await prisma.productImage.createMany({
            data: images
          });

          // Create variants
          const variants = generateCosmeticsVariants(product.id, product.name);
          for (const variantData of variants) {
            await prisma.productVariant.create({
              data: variantData
            });
          }

          // Create reviews
          const reviews = generateReviews(product.id, testUser.id, faker.number.int({ min: 3, max: 12 }));
          await prisma.review.createMany({
            data: reviews
          });
        }
      }
    }

    // Create some sample addresses for the test user
    console.log('Creating sample addresses...');
    await prisma.address.createMany({
      data: [
        {
          userId: testUser.id,
          type: 'HOME',
          fullName: faker.person.fullName(),
          phone: faker.phone.number(),
          addressLine1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: 'India',
          isDefault: true
        },
        {
          userId: testUser.id,
          type: 'OFFICE',
          fullName: faker.person.fullName(),
          phone: faker.phone.number(),
          addressLine1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: 'India',
          isDefault: false
        }
      ]
    });

    // Create some coupons
    console.log('Creating sample coupons...');
    await prisma.coupon.createMany({
      data: [
        {
          code: 'JEWELRY10',
          description: '10% off on all jewelry items',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minimumOrderAmount: 100,
          maximumDiscountAmount: 500,
          usageLimit: 100,
          startsAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true
        },
        {
          code: 'BEAUTY20',
          description: '₹20 off on cosmetics',
          discountType: 'FIXED_AMOUNT',
          discountValue: 20,
          minimumOrderAmount: 50,
          usageLimit: 200,
          startsAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          isActive: true
        }
      ]
    });

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`- Created ${JEWELRY_CATEGORIES.length} jewelry main categories`);
    console.log(`- Created ${COSMETICS_CATEGORIES.length} cosmetics main categories`);
    console.log(`- Generated products with variants, images, and reviews`);
    console.log(`- Created sample user, addresses, and coupons`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seeding function
main();