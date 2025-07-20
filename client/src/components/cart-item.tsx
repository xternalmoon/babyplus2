import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CartItemWithProduct } from "@/types";

interface CartItemProps {
  item: CartItemWithProduct;
}

export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      await apiRequest("PATCH", `/api/cart/items/${item.id}`, {
        quantity: newQuantity,
      });
    },
    onSuccess: () => {
      toast({
        title: "Cart Updated",
        description: "Item quantity has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      // Revert quantity on error
      setQuantity(item.quantity);
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart/items/${item.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${item.product.stock} items available in stock.`,
        variant: "destructive",
      });
      return;
    }
    
    setQuantity(newQuantity);
    updateQuantityMutation.mutate(newQuantity);
  };

  const handleDirectQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    handleQuantityChange(newQuantity);
  };

  const itemTotal = parseFloat(item.price) * quantity;

  return (
    <div className="flex items-center space-x-4 py-4">
      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0">
        <img
          src={item.product.imageUrl || "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
          alt={item.product.name}
          className="w-full h-full object-cover rounded-lg border border-gray-200"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-baby-primary truncate">{item.product.name}</h4>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="outline" className="text-xs">
            Size: {item.size}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Color: {item.color}
          </Badge>
        </div>
        <p className="text-baby-accent font-medium mt-1">৳{item.price}</p>
        
        {/* Stock Warning */}
        {item.product.stock <= 5 && (
          <p className="text-orange-500 text-xs mt-1">
            Only {item.product.stock} left in stock!
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || updateQuantityMutation.isPending}
            className="h-8 w-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <Input
            type="number"
            min="1"
            max={item.product.stock}
            value={quantity}
            onChange={(e) => handleDirectQuantityChange(e.target.value)}
            disabled={updateQuantityMutation.isPending}
            className="w-16 h-8 text-center border-0 focus:ring-0"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= item.product.stock || updateQuantityMutation.isPending}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Item Total */}
      <div className="text-right min-w-0">
        <p className="font-semibold text-baby-primary">৳{itemTotal.toFixed(2)}</p>
        {quantity > 1 && (
          <p className="text-xs text-gray-500">৳{item.price} each</p>
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeItemMutation.mutate()}
        disabled={removeItemMutation.isPending}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
