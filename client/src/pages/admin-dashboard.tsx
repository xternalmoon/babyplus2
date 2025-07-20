import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  AlertCircle,
  Palette,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { AdminStats, OrderWithItems } from "@/types";
import type { Product, InsertProduct } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

// Enhanced product schema with customization options
const enhancedProductSchema = insertProductSchema.extend({
  colors: z.array(z.string()).min(1, "At least one color is required"),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  referenceImages: z.array(z.string()).optional(),
});

type EnhancedProductForm = z.infer<typeof enhancedProductSchema>;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product form with validation
  const form = useForm<EnhancedProductForm>({
    resolver: zodResolver(enhancedProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: 1,
      stock: 0,
      sku: "",
      colors: [],
      sizes: [],
      ageGroup: "",
      isActive: true,
      isFeatured: false,
      imageUrl: "",
      referenceImages: [],
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: EnhancedProductForm) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create product");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      form.reset();
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EnhancedProductForm }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update product");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      form.reset();
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: EnhancedProductForm) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  // Pre-populate form when editing
  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: editingProduct.price.toString(),
        categoryId: editingProduct.categoryId,
        stock: editingProduct.stock,
        sku: editingProduct.sku,
        colors: editingProduct.colors || [],
        sizes: editingProduct.sizes || [],
        ageGroup: editingProduct.ageGroup,
        isActive: editingProduct.isActive,
        isFeatured: editingProduct.isFeatured,
        imageUrl: editingProduct.imageUrl || "",
        referenceImages: editingProduct.referenceImages || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: "",
        categoryId: 1,
        stock: 0,
        sku: "",
        colors: [],
        sizes: [],
        ageGroup: "",
        isActive: true,
        isFeatured: false,
        imageUrl: "",
        referenceImages: [],
      });
    }
  }, [editingProduct, form]);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders"],
    retry: false,
  });

  const { data: products, isLoading: productsLoading, error: productsError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }

    const errors = [statsError, ordersError, productsError].filter(Boolean);
    errors.forEach(error => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    });
  }, [user, statsError, ordersError, productsError, toast]);

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
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
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

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

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-baby-primary mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-baby-secondary">
      {/* Admin Header */}
      <div className="bg-baby-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-300">Baby Plus Store Management</p>
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
              className="bg-baby-accent hover:bg-blue-600 text-black"
              style={{ color: 'black' }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-baby-green rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                  <p className="text-2xl font-bold text-baby-primary">
                    ৳{statsLoading ? "..." : stats?.totalRevenue.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-baby-accent rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                  <p className="text-2xl font-bold text-baby-primary">
                    {statsLoading ? "..." : stats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Products</h3>
                  <p className="text-2xl font-bold text-baby-primary">
                    {statsLoading ? "..." : stats?.totalProducts || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Customers</h3>
                  <p className="text-2xl font-bold text-baby-primary">
                    {statsLoading ? "..." : stats?.totalCustomers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products" className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-baby-primary">Product Management</h3>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-baby-accent hover:bg-blue-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingProduct ? "Update product information" : "Create a new product for your store"}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter product name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Product description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="ageGroup"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Age Group</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select age group" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="0-6M">0-6 Months</SelectItem>
                                      <SelectItem value="6-12M">6-12 Months</SelectItem>
                                      <SelectItem value="12-24M">12-24 Months</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock Quantity</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU (Product Code)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. ORG-001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Main Product Image URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/image.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="colors"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Available Colors</FormLabel>
                                  <Select onValueChange={(value) => {
                                    if (!field.value.includes(value)) {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select colors" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="White">White</SelectItem>
                                      <SelectItem value="Pink">Pink</SelectItem>
                                      <SelectItem value="Blue">Blue</SelectItem>
                                      <SelectItem value="Yellow">Yellow</SelectItem>
                                      <SelectItem value="Green">Green</SelectItem>
                                      <SelectItem value="Purple">Purple</SelectItem>
                                      <SelectItem value="Orange">Orange</SelectItem>
                                      <SelectItem value="Red">Red</SelectItem>
                                      <SelectItem value="Gray">Gray</SelectItem>
                                      <SelectItem value="Beige">Beige</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {field.value.map((color, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="cursor-pointer"
                                        onClick={() => field.onChange(field.value.filter((_, i) => i !== index))}
                                      >
                                        {color} ×
                                      </Badge>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="sizes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Available Sizes</FormLabel>
                                  <Select onValueChange={(value) => {
                                    if (!field.value.includes(value)) {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select sizes" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Newborn">Newborn</SelectItem>
                                      <SelectItem value="0-3M">0-3 Months</SelectItem>
                                      <SelectItem value="3-6M">3-6 Months</SelectItem>
                                      <SelectItem value="6-9M">6-9 Months</SelectItem>
                                      <SelectItem value="9-12M">9-12 Months</SelectItem>
                                      <SelectItem value="12-18M">12-18 Months</SelectItem>
                                      <SelectItem value="18-24M">18-24 Months</SelectItem>
                                      <SelectItem value="2T">2T</SelectItem>
                                      <SelectItem value="3T">3T</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {field.value.map((size, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="cursor-pointer"
                                        onClick={() => field.onChange(field.value.filter((_, i) => i !== index))}
                                      >
                                        {size} ×
                                      </Badge>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex items-center space-x-4">
                            <FormField
                              control={form.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel>Product is Active</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="isFeatured"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel>Featured Product</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        </form>
                      </Form>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => {
                          setIsProductDialogOpen(false);
                          setEditingProduct(null);
                        }}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-baby-accent hover:bg-blue-600 text-white"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          onClick={form.handleSubmit(onSubmit)}
                        >
                          {createProductMutation.isPending || updateProductMutation.isPending 
                            ? "Publishing..." 
                            : editingProduct 
                              ? "Update Product" 
                              : "Publish Product"
                          }
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Age Group</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-baby-primary">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.sku}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.ageGroup.replace("-", "-").replace("months", " Months")}</TableCell>
                          <TableCell>৳{product.price}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge className={product.isActive ? "bg-baby-green text-white" : "bg-gray-500 text-white"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsProductDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-baby-primary">Order Management</h3>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <p className="font-medium text-baby-primary">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{order.items.length} items</p>
                          </TableCell>
                          <TableCell>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>${order.total}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(status) =>
                                updateOrderStatusMutation.mutate({ orderId: order.id, status })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                                    {formatStatus(order.status)}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-baby-primary">Shipping Address</h4>
                                      <p className="text-sm text-gray-600">
                                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                        {order.shippingAddress.street}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-baby-primary">Order Summary</h4>
                                      <div className="text-sm text-gray-600">
                                        <p>Subtotal: ${order.subtotal}</p>
                                        <p>Shipping: ${order.shipping}</p>
                                        <p>Tax: ${order.tax}</p>
                                        <p className="font-medium">Total: ${order.total}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-baby-primary mb-2">Items</h4>
                                    <div className="space-y-2">
                                      {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                          <div>
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-sm text-gray-600">
                                              {item.size} • {item.color} • Qty: {item.quantity}
                                            </p>
                                          </div>
                                          <p className="font-medium">${item.total}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-baby-primary">Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">This Month</span>
                          <span className="text-2xl font-bold text-baby-primary">
                            ${stats?.totalRevenue.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Orders This Month</span>
                          <span className="text-2xl font-bold text-baby-primary">
                            {stats?.totalOrders || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Average Order Value</span>
                          <span className="text-2xl font-bold text-baby-primary">
                            ${stats && stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-baby-primary">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-baby-accent hover:bg-blue-600 text-white">
                        Export Sales Report
                      </Button>
                      <Button className="w-full bg-baby-green hover:bg-green-600 text-white">
                        Manage Inventory
                      </Button>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Customer Analytics
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
