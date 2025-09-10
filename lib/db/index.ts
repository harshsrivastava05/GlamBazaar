// Export the database client
export { prisma } from "./client";

// Export product services
export { getProducts, getProductBySlug } from "./product.service";

// Export category services
export { getCategories, getCategoryBySlug } from "./category.service";

// Export user services
export { createUser, getUserByEmail } from "./user.service";

// Export cart services
export {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartItemCount,
  isProductInCart,
} from "./cart.service";

// Export order services
export { createOrder, getOrdersByUser } from "./order.service";
