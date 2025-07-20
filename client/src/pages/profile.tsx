import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Heart, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { OrderWithItems, WishlistWithProduct } from "@/types";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRequestingAdmin, setIsRequestingAdmin] = useState(false);

  const requestAdminMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/request-admin', {
      method: 'POST',
    }),
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsRequestingAdmin(false);
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request admin access",
        variant: "destructive",
      });
      setIsRequestingAdmin(false);
    },
  });

  const handleRequestAdmin = () => {
    setIsRequestingAdmin(true);
    requestAdminMutation.mutate();
  };

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    retry: false,
  });

  const { data: wishlist, isLoading: wishlistLoading, error: wishlistError } = useQuery<WishlistWithProduct[]>({
    queryKey: ["/api/wishlist"],
    retry: false,
  });

  useEffect(() => {
    if (ordersError && isUnauthorizedError(ordersError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [ordersError, toast]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-baby-green";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-baby-primary mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-baby-secondary">
      {/* Page Header */}
      <div className="bg-baby-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-baby-accent rounded-full flex items-center justify-center text-2xl font-bold">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </h1>
                <p className="text-gray-300">Baby Plus Customer</p>
              </div>
            </div>
            <Button 
              onClick={async () => {
                const response = await fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include"
                });
                if (response.ok) {
                  window.location.href = "/";
                }
              }}
              variant="outline"
              className="border-white text-black hover:bg-white hover:text-baby-primary"
              style={{ color: 'black' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-baby-primary">Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-baby-primary">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {formatStatus(order.status)}
                            </Badge>
                            <p className="text-lg font-bold text-baby-primary mt-1">
                              ৳{order.total}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-baby-primary truncate">
                                  {item.productName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.size} • {item.color} • Qty: {item.quantity}
                                </p>
                                <p className="text-sm font-medium">৳{item.total}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <p>Shipping to: {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {order.status === "delivered" && (
                              <Button variant="outline" size="sm">
                                Reorder
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-baby-primary mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                    <Button className="bg-baby-accent hover:bg-blue-600 text-white">
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-baby-primary">My Wishlist</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlistLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : wishlist && wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} className="bg-baby-secondary rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="relative mb-4">
                          <img
                            src={item.product.imageUrl || "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                            alt={item.product.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
                          >
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                          </Button>
                        </div>
                        <h3 className="font-semibold text-baby-primary mb-2">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-baby-primary">৳{item.product.price}</span>
                            {item.product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">৳{item.product.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center text-yellow-400">
                            <span className="text-sm text-gray-600">★ {item.product.rating}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4 bg-baby-accent hover:bg-blue-600 text-white">
                          Add to Cart
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-baby-primary mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-600 mb-6">Save items you love for later by adding them to your wishlist.</p>
                    <Button className="bg-baby-accent hover:bg-blue-600 text-white">
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-baby-primary">
                    <User className="w-5 h-5 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-baby-primary">{user.email || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <p className="text-baby-primary">{user.firstName || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <p className="text-baby-primary">{user.lastName || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Type</label>
                    <Badge variant="outline" className="text-baby-primary">
                      {user.role === "admin" ? "Administrator" : "Customer"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-baby-primary">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full border-baby-accent text-baby-accent hover:bg-baby-accent hover:text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    {user.role !== "admin" && (
                      <Button 
                        onClick={handleRequestAdmin}
                        disabled={isRequestingAdmin || requestAdminMutation.isPending}
                        variant="outline" 
                        className="w-full text-black border-gray-300 hover:bg-baby-green hover:text-white hover:border-baby-green transition-all duration-200"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {isRequestingAdmin || requestAdminMutation.isPending ? "Processing..." : "Request Admin Access"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-baby-primary">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-baby-secondary rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-baby-primary">{orders?.length || 0}</p>
                    </div>
                    <Package className="w-8 h-8 text-baby-accent" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-baby-secondary rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Wishlist Items</p>
                      <p className="text-2xl font-bold text-baby-primary">{wishlist?.length || 0}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-baby-secondary rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-baby-primary">
                        ৳{orders?.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <span className="text-2xl">💰</span>
                  </div>
                  
                  <Button 
                    onClick={() => window.location.href = "/api/logout"}
                    variant="outline" 
                    className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
