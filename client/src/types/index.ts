export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  thana?: string;
  landmark?: string;
  instructions?: string;
}

export interface CartItemWithProduct {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  size: string;
  color: string;
  price: string;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    stock: number;
  };
}

export interface OrderWithItems {
  id: number;
  userId: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    quantity: number;
    size: string;
    color: string;
    price: string;
    total: string;
    createdAt: Date;
  }[];
}

export interface WishlistWithProduct {
  id: number;
  userId: string;
  productId: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    originalPrice?: string;
    imageUrl: string;
    rating: string;
    reviewCount: number;
  };
}

export interface ReviewWithUser {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}
