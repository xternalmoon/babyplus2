import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CartItem from "@/components/cart-item";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CartItemWithProduct } from "@/types";
import { useState, useEffect } from "react";

interface CartData {
  cart: {
    id: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  items: CartItemWithProduct[];
}

export default function Cart() {
  const [promoCode, setPromoCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading, error } = useQuery<CartData>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      // This would normally call an API endpoint to validate and apply promo code
      // For now, we'll just show a message
      throw new Error("Promo code functionality not implemented yet");
    },
    onError: () => {
      toast({
        title: "Invalid Code",
        description: "This promo code is not valid or has expired.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="h-6 bg-gray-200 rounded mb-6"></div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border-b border-gray-200">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="h-6 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-baby-primary mb-4">Error Loading Cart</h2>
          <p className="text-gray-600">There was an error loading your cart. Please try again later.</p>
        </div>
      </div>
    );
  }

  const items = cartData?.items || [];
  const isEmpty = items.length === 0;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Enter Code",
        description: "Please enter a promo code.",
        variant: "destructive",
      });
      return;
    }
    applyPromoMutation.mutate(promoCode);
  };

  if (isEmpty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-baby-primary mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link href="/shop">
            <Button className="bg-baby-accent hover:bg-blue-600 text-white px-8 py-3 text-lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-baby-secondary">
      {/* Page Header */}
      <div className="bg-baby-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-baby-primary mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-baby-primary mb-6">
                  Cart Items ({items.length})
                </h3>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id}>
                      <CartItem item={item} />
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-baby-primary mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-baby-green" : ""}`}>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-baby-primary">Total</span>
                    <span className="text-lg font-bold text-baby-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-baby-primary mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={applyPromoMutation.isPending}
                      className="border-baby-accent text-baby-accent hover:bg-baby-accent hover:text-white"
                    >
                      Apply
                    </Button>
                  </div>
                  {subtotal < 50 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Link href="/checkout">
                    <Button className="w-full bg-baby-accent hover:bg-blue-600 text-white py-3 font-semibold">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  
                  <Link href="/shop">
                    <Button variant="outline" className="w-full border-baby-primary text-baby-primary hover:bg-baby-primary hover:text-white">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
