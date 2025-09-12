"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var faker_1 = require("@faker-js/faker");
var prisma = new client_1.PrismaClient();
// --------- Helpers ----------
var randomInt = function (min, max) {
    return faker_1.faker.number.int({ min: min, max: max });
};
var createSlug = function (text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};
// --------- Jewelry & Cosmetics Categories ----------
var jewelryCosmetics = {
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
function insertCategories() {
    return __awaiter(this, void 0, void 0, function () {
        var categoriesData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    categoriesData = jewelryCosmetics.categories.map(function (cat, index) { return ({
                        name: cat.name,
                        slug: createSlug(cat.name),
                        description: cat.description,
                        sortOrder: index + 1,
                        isActive: true,
                    }); });
                    return [4 /*yield*/, prisma.category.createMany({
                            data: categoriesData,
                            skipDuplicates: true,
                        })];
                case 1:
                    _a.sent();
                    console.log("Inserted ".concat(categoriesData.length, " categories"));
                    return [2 /*return*/, categoriesData.length];
            }
        });
    });
}
function insertAttributes() {
    return __awaiter(this, void 0, void 0, function () {
        var attributes, _i, attributes_1, attr, colorAttr, sizeAttr, materialAttr, colorOptions, sizeOptions, materialOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attributes = [
                        { name: "color", type: client_1.AttributeType.COLOR, displayName: "Color" },
                        { name: "size", type: client_1.AttributeType.SIZE, displayName: "Size" }, // Corrected type
                        { name: "material", type: client_1.AttributeType.MATERIAL, displayName: "Material" },
                        { name: "weight", type: client_1.AttributeType.WEIGHT, displayName: "Weight" },
                    ];
                    _i = 0, attributes_1 = attributes;
                    _a.label = 1;
                case 1:
                    if (!(_i < attributes_1.length)) return [3 /*break*/, 4];
                    attr = attributes_1[_i];
                    return [4 /*yield*/, prisma.attribute.upsert({
                            where: { id: -1 }, // Use a non-existent ID to always create
                            update: {},
                            create: {
                                name: attr.name,
                                type: attr.type,
                                displayName: attr.displayName,
                            },
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, prisma.attribute.findFirst({ where: { name: "color" } })];
                case 5:
                    colorAttr = _a.sent();
                    return [4 /*yield*/, prisma.attribute.findFirst({ where: { name: "size" } })];
                case 6:
                    sizeAttr = _a.sent();
                    return [4 /*yield*/, prisma.attribute.findFirst({ where: { name: "material" } })];
                case 7:
                    materialAttr = _a.sent();
                    colorOptions = [
                        { value: "gold", displayValue: "Gold", colorHex: "#FFD700" },
                        { value: "silver", displayValue: "Silver", colorHex: "#C0C0C0" },
                        { value: "rose-gold", displayValue: "Rose Gold", colorHex: "#E8B4A0" },
                        { value: "platinum", displayValue: "Platinum", colorHex: "#E5E4E2" },
                        { value: "red", displayValue: "Red", colorHex: "#FF0000" },
                        { value: "pink", displayValue: "Pink", colorHex: "#FFC0CB" },
                        { value: "nude", displayValue: "Nude", colorHex: "#F5DEB3" },
                    ];
                    sizeOptions = [
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
                    materialOptions = [
                        { value: "gold", displayValue: "Gold" },
                        { value: "silver", displayValue: "Silver" },
                        { value: "platinum", displayValue: "Platinum" },
                        { value: "diamond", displayValue: "Diamond" },
                        { value: "pearl", displayValue: "Pearl" },
                        { value: "organic", displayValue: "Organic" },
                        { value: "synthetic", displayValue: "Synthetic" },
                    ];
                    if (!colorAttr) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.attributeOption.createMany({
                            data: colorOptions.map(function (opt) { return (__assign({ attributeId: colorAttr.id }, opt)); }),
                            skipDuplicates: true,
                        })];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    if (!sizeAttr) return [3 /*break*/, 11];
                    return [4 /*yield*/, prisma.attributeOption.createMany({
                            data: sizeOptions.map(function (opt) { return (__assign({ attributeId: sizeAttr.id }, opt)); }),
                            skipDuplicates: true,
                        })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    if (!materialAttr) return [3 /*break*/, 13];
                    return [4 /*yield*/, prisma.attributeOption.createMany({
                            data: materialOptions.map(function (opt) { return (__assign({ attributeId: materialAttr.id }, opt)); }),
                            skipDuplicates: true,
                        })];
                case 12:
                    _a.sent();
                    _a.label = 13;
                case 13:
                    console.log("Inserted attributes and attribute options");
                    return [2 /*return*/];
            }
        });
    });
}
function insertProducts(categoryCount) {
    return __awaiter(this, void 0, void 0, function () {
        var products, productCount, allProducts, i, productName, basePrice, hasSale;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    products = [];
                    productCount = 50;
                    allProducts = __spreadArray(__spreadArray([], jewelryCosmetics.jewelryProducts, true), jewelryCosmetics.cosmeticProducts, true);
                    for (i = 0; i < productCount; i++) {
                        productName = allProducts[i % allProducts.length] || faker_1.faker.commerce.productName();
                        basePrice = randomInt(500, 15000);
                        hasSale = faker_1.faker.datatype.boolean({ probability: 0.3 });
                        products.push({
                            name: productName,
                            slug: createSlug(productName) + "-".concat(i + 1),
                            description: faker_1.faker.commerce.productDescription() + " " + faker_1.faker.lorem.sentences(3),
                            shortDescription: faker_1.faker.commerce.productAdjective() + " " + faker_1.faker.commerce.productMaterial(),
                            categoryId: randomInt(1, categoryCount),
                            brand: faker_1.faker.helpers.arrayElement(jewelryCosmetics.brands),
                            basePrice: basePrice,
                            salePrice: hasSale ? Math.floor(basePrice * 0.8) : undefined,
                            costPrice: Math.floor(basePrice * 0.6),
                            sku: faker_1.faker.string.alphanumeric(8).toUpperCase(),
                            weight: faker_1.faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 2 }),
                            isActive: true,
                            featured: faker_1.faker.datatype.boolean({ probability: 0.2 }),
                            metaTitle: productName,
                            metaDescription: faker_1.faker.commerce.productDescription(),
                            tags: faker_1.faker.helpers.arrayElements([
                                "luxury", "premium", "jewelry", "cosmetics", "beauty",
                                "fashion", "elegant", "modern", "classic", "trendy"
                            ], { min: 2, max: 5 }).join(", "),
                        });
                    }
                    return [4 /*yield*/, prisma.product.createMany({
                            data: products,
                            skipDuplicates: true,
                        })];
                case 1:
                    _a.sent();
                    console.log("Inserted ".concat(productCount, " products"));
                    return [2 /*return*/, productCount];
            }
        });
    });
}
function insertProductImages(productCount) {
    return __awaiter(this, void 0, void 0, function () {
        var images, productId, additionalImages, j;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    images = [];
                    for (productId = 1; productId <= productCount; productId++) {
                        // Primary image
                        images.push({
                            productId: productId,
                            url: faker_1.faker.image.urlLoremFlickr({
                                width: 800,
                                height: 800,
                                category: productId <= 25 ? "jewelry" : "beauty"
                            }),
                            altText: "Product ".concat(productId, " main image"),
                            sortOrder: 1,
                            isPrimary: true,
                        });
                        additionalImages = randomInt(1, 3);
                        for (j = 2; j <= additionalImages + 1; j++) {
                            images.push({
                                productId: productId,
                                url: faker_1.faker.image.urlLoremFlickr({
                                    width: 800,
                                    height: 800,
                                    category: productId <= 25 ? "jewelry" : "beauty"
                                }),
                                altText: "Product ".concat(productId, " image ").concat(j),
                                sortOrder: j,
                                isPrimary: false,
                            });
                        }
                    }
                    return [4 /*yield*/, prisma.productImage.createMany({
                            data: images,
                            skipDuplicates: true,
                        })];
                case 1:
                    _a.sent();
                    console.log("Inserted ".concat(images.length, " product images"));
                    return [2 /*return*/];
            }
        });
    });
}
function insertProductVariants(productCount) {
    return __awaiter(this, void 0, void 0, function () {
        var variants, attributes, productId, variantCount, product, v, variantPrice, batchSize, i, batch, createdVariants, _i, createdVariants_1, variant, numAttributes, selectedAttributes, _a, selectedAttributes_1, attribute, selectedOption, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    variants = [];
                    return [4 /*yield*/, prisma.attribute.findMany({
                            include: { options: true }
                        })];
                case 1:
                    attributes = _b.sent();
                    productId = 1;
                    _b.label = 2;
                case 2:
                    if (!(productId <= productCount)) return [3 /*break*/, 5];
                    variantCount = randomInt(1, 4);
                    return [4 /*yield*/, prisma.product.findUnique({
                            where: { id: productId }
                        })];
                case 3:
                    product = _b.sent();
                    if (!product)
                        return [3 /*break*/, 4];
                    for (v = 0; v < variantCount; v++) {
                        variantPrice = Number(product.basePrice) + randomInt(-200, 500);
                        variants.push({
                            productId: productId,
                            sku: "".concat(product.sku, "-V").concat(v + 1),
                            price: Math.max(variantPrice, 100),
                            compareAtPrice: variantPrice + randomInt(100, 1000),
                            costPrice: Math.floor(variantPrice * 0.7),
                            stockQuantity: randomInt(5, 100),
                            weight: faker_1.faker.number.float({ min: 0.1, max: 3.0, fractionDigits: 2 }),
                            isActive: true,
                        });
                    }
                    _b.label = 4;
                case 4:
                    productId++;
                    return [3 /*break*/, 2];
                case 5:
                    batchSize = 50;
                    i = 0;
                    _b.label = 6;
                case 6:
                    if (!(i < variants.length)) return [3 /*break*/, 9];
                    batch = variants.slice(i, i + batchSize);
                    return [4 /*yield*/, prisma.productVariant.createMany({
                            data: batch,
                            skipDuplicates: true,
                        })];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    i += batchSize;
                    return [3 /*break*/, 6];
                case 9: return [4 /*yield*/, prisma.productVariant.findMany()];
                case 10:
                    createdVariants = _b.sent();
                    _i = 0, createdVariants_1 = createdVariants;
                    _b.label = 11;
                case 11:
                    if (!(_i < createdVariants_1.length)) return [3 /*break*/, 18];
                    variant = createdVariants_1[_i];
                    numAttributes = randomInt(1, 3);
                    selectedAttributes = faker_1.faker.helpers.arrayElements(attributes, numAttributes);
                    _a = 0, selectedAttributes_1 = selectedAttributes;
                    _b.label = 12;
                case 12:
                    if (!(_a < selectedAttributes_1.length)) return [3 /*break*/, 17];
                    attribute = selectedAttributes_1[_a];
                    if (!(attribute.options.length > 0)) return [3 /*break*/, 16];
                    selectedOption = faker_1.faker.helpers.arrayElement(attribute.options);
                    _b.label = 13;
                case 13:
                    _b.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, prisma.variantAttribute.create({
                            data: {
                                variantId: variant.id,
                                attributeId: attribute.id,
                                attributeOptionId: selectedOption.id,
                            },
                        })];
                case 14:
                    _b.sent();
                    return [3 /*break*/, 16];
                case 15:
                    error_1 = _b.sent();
                    // Skip if combination already exists
                    return [3 /*break*/, 16];
                case 16:
                    _a++;
                    return [3 /*break*/, 12];
                case 17:
                    _i++;
                    return [3 /*break*/, 11];
                case 18:
                    console.log("Inserted ".concat(variants.length, " product variants with attributes"));
                    return [2 /*return*/];
            }
        });
    });
}
function insertReviews(productCount) {
    return __awaiter(this, void 0, void 0, function () {
        var reviews, userIds, productId, reviewCount, i, rating, titles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reviews = [];
                    userIds = Array.from({ length: 20 }, function () { return faker_1.faker.string.uuid(); });
                    for (productId = 1; productId <= productCount; productId++) {
                        reviewCount = randomInt(2, 8);
                        for (i = 0; i < reviewCount; i++) {
                            rating = randomInt(1, 5);
                            titles = [
                                "Excellent quality!", "Love it!", "Great purchase", "Highly recommend",
                                "Perfect!", "Amazing product", "Good value", "Beautiful design",
                                "Fast shipping", "Exactly as described", "Will buy again", "Satisfied"
                            ];
                            reviews.push({
                                userId: faker_1.faker.helpers.arrayElement(userIds),
                                productId: productId,
                                rating: rating,
                                title: faker_1.faker.helpers.arrayElement(titles),
                                content: faker_1.faker.lorem.sentences({ min: 1, max: 4 }),
                                isApproved: faker_1.faker.datatype.boolean({ probability: 0.8 }),
                            });
                        }
                    }
                    return [4 /*yield*/, prisma.review.createMany({
                            data: reviews,
                            skipDuplicates: true,
                        })];
                case 1:
                    _a.sent();
                    console.log("Inserted ".concat(reviews.length, " reviews"));
                    return [2 /*return*/];
            }
        });
    });
}
function updateProductStats() {
    return __awaiter(this, void 0, void 0, function () {
        var products, _i, products_1, product, approvedReviews, reviewCount, averageRating;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.product.findMany({
                        include: {
                            reviews: {
                                where: { isApproved: true }
                            }
                        }
                    })];
                case 1:
                    products = _a.sent();
                    _i = 0, products_1 = products;
                    _a.label = 2;
                case 2:
                    if (!(_i < products_1.length)) return [3 /*break*/, 5];
                    product = products_1[_i];
                    approvedReviews = product.reviews;
                    reviewCount = approvedReviews.length;
                    if (!(reviewCount > 0)) return [3 /*break*/, 4];
                    averageRating = approvedReviews.reduce(function (sum, review) { return sum + review.rating; }, 0) / reviewCount;
                    return [4 /*yield*/, prisma.product.update({
                            where: { id: product.id },
                            data: {
                                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                                reviewCount: reviewCount,
                            }
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Updated product statistics");
                    return [2 /*return*/];
            }
        });
    });
}
// --------- Main Seed Function ----------
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var categoryCount, productCount, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 16, 17, 19]);
                    console.log("Starting database seeding...");
                    // Clear existing data (optional - remove if you don't want to clear)
                    return [4 /*yield*/, prisma.variantAttribute.deleteMany()];
                case 1:
                    // Clear existing data (optional - remove if you don't want to clear)
                    _a.sent();
                    return [4 /*yield*/, prisma.attributeOption.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.attribute.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.review.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.productVariant.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.productImage.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.deleteMany()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.category.deleteMany()];
                case 8:
                    _a.sent();
                    console.log("Cleared existing data");
                    return [4 /*yield*/, insertCategories()];
                case 9:
                    categoryCount = _a.sent();
                    return [4 /*yield*/, insertAttributes()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, insertProducts(categoryCount)];
                case 11:
                    productCount = _a.sent();
                    return [4 /*yield*/, insertProductImages(productCount)];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, insertProductVariants(productCount)];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, insertReviews(productCount)];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, updateProductStats()];
                case 15:
                    _a.sent();
                    console.log("Database seeded successfully!");
                    return [3 /*break*/, 19];
                case 16:
                    error_2 = _a.sent();
                    console.error("Seeding failed:", error_2);
                    throw error_2;
                case 17: return [4 /*yield*/, prisma.$disconnect()];
                case 18:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 19: return [2 /*return*/];
            }
        });
    });
}
// Run Seeder
main().catch(function (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
});
