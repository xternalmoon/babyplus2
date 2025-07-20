import {
  users,
  products,
  categories,
  carts,
  cartItems,
  orders,
  orderItems,
  wishlists,
  reviews,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Cart,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Wishlist,
  type InsertWishlist,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getProducts(filters?: {
    category?: string;
    ageGroup?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;

  // Cart operations
  getCart(userId: number): Promise<Cart | undefined>;
  createCart(userId: number): Promise<Cart>;
  getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(cartId: number): Promise<void>;

  // Order operations
  getOrders(userId?: number): Promise<(Order & { items: OrderItem[] })[]>;
  getOrderById(id: number): Promise<(Order & { items: OrderItem[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Wishlist operations
  getWishlist(userId: number): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, productId: number): Promise<void>;

  // Review operations
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Analytics for admin
  getOrderStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(filters?: {
    category?: string;
    ageGroup?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [eq(products.isActive, true)];
    
    if (filters?.category) {
      const category = await db.select().from(categories).where(eq(categories.slug, filters.category)).limit(1);
      if (category.length > 0) {
        conditions.push(eq(products.categoryId, category[0].id));
      }
    }
    
    if (filters?.ageGroup) {
      conditions.push(eq(products.ageGroup, filters.ageGroup));
    }
    
    if (filters?.priceMin !== undefined) {
      conditions.push(gte(products.price, filters.priceMin.toString()));
    }
    
    if (filters?.priceMax !== undefined) {
      conditions.push(lte(products.price, filters.priceMax.toString()));
    }
    
    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`));
    }
    
    if (filters?.featured) {
      conditions.push(eq(products.isFeatured, true));
    }
    
    query = query.where(and(...conditions));
    query = query.orderBy(desc(products.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt))
      .limit(8);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));
  }

  // Cart operations
  async getCart(userId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart;
  }

  async createCart(userId: number): Promise<Cart> {
    const [cart] = await db.insert(carts).values({ userId }).returning();
    return cart;
  }

  async getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId))
      .then(rows => 
        rows.map(row => ({
          ...row.cart_items,
          product: row.products!,
        }))
      );
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart with same product, size, color
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartItem.cartId!),
          eq(cartItems.productId, cartItem.productId!),
          eq(cartItems.size, cartItem.size),
          eq(cartItems.color, cartItem.color)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updated;
    } else {
      // Create new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(cartId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  // Order operations
  async getOrders(userId?: number): Promise<(Order & { items: OrderItem[] })[]> {
    let ordersQuery = db.select().from(orders);
    
    if (userId) {
      ordersQuery = ordersQuery.where(eq(orders.userId, userId));
    }
    
    const ordersList = await ordersQuery.orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }

  async getOrderById(id: number): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
    
    return { ...order, items };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }));
      
      await tx.insert(orderItems).values(orderItemsWithOrderId);
      
      return newOrder;
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Wishlist operations
  async getWishlist(userId: number): Promise<(Wishlist & { product: Product })[]> {
    return await db
      .select()
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId))
      .then(rows => 
        rows.map(row => ({
          ...row.wishlists,
          product: row.products!,
        }))
      );
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlist] = await db.insert(wishlists).values(wishlist).returning();
    return newWishlist;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
  }

  // Review operations
  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    return await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.reviews,
          user: row.users!,
        }))
      );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Analytics
  async getOrderStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  }> {
    const [revenue] = await db
      .select({ total: sql<number>`sum(${orders.total})` })
      .from(orders);
    
    const [orderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    
    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.isActive, true));
    
    const [customerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "customer"));
    
    return {
      totalRevenue: Number(revenue.total) || 0,
      totalOrders: orderCount.count,
      totalProducts: productCount.count,
      totalCustomers: customerCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
