import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";
import { insertProductSchema, insertCategorySchema, insertCartItemSchema, insertOrderSchema, insertWishlistSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Note: Auth routes are handled in auth.ts

  // Public routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const {
        category,
        ageGroup,
        priceMin,
        priceMax,
        search,
        featured,
        limit = "24",
        offset = "0"
      } = req.query;

      const filters = {
        category: category as string,
        ageGroup: ageGroup as string,
        priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
        priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
        search: search as string,
        featured: featured === "true",
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Protected customer routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      let cart = await storage.getCart(userId);
      
      if (!cart) {
        cart = await storage.createCart(userId);
      }
      
      const items = await storage.getCartItems(cart.id);
      res.json({ cart, items });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart/add", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const cartItemData = insertCartItemSchema.parse(req.body);
      
      let cart = await storage.getCart(userId);
      if (!cart) {
        cart = await storage.createCart(userId);
      }
      
      const cartItem = await storage.addToCart({
        ...cartItemData,
        cartId: cart.id,
      });
      
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/items/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/items/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(400).json({ message: "Failed to remove item from cart" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const orderData = insertOrderSchema.parse(req.body);
      const { items } = req.body;
      
      const order = await storage.createOrder(
        { ...orderData, userId },
        items
      );
      
      // Clear cart after successful order
      const cart = await storage.getCart(userId);
      if (cart) {
        await storage.clearCart(cart.id);
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const wishlist = await storage.getWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const wishlistData = insertWishlistSchema.parse(req.body);
      
      const wishlistItem = await storage.addToWishlist({
        ...wishlistData,
        userId,
      });
      
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(400).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(400).json({ message: "Failed to remove from wishlist" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const reviewData = insertReviewSchema.parse(req.body);
      
      const review = await storage.createReview({
        ...reviewData,
        userId,
      });
      
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  // Admin routes
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(403).json({ message: "Admin access required" });
    }
  };

  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/admin/orders", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.post("/api/admin/products", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = req.body;
      
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/admin/categories", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
