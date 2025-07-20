import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShieldCheck, CreditCard, Truck, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CartItemWithProduct, Address } from "@/types";

const checkoutSchema = z.object({
  // Shipping Address
  shippingFirstName: z.string().min(1, "First name is required"),
  shippingLastName: z.string().min(1, "Last name is required"),
  shippingStreet: z.string().min(1, "Street Address / Village / Area is required"),
  shippingDistrict: z.string().min(1, "District is required"),
  shippingThana: z.string().min(1, "Thana / Upazila is required"),
  shippingPostCode: z.string().min(4, "Post Code must be at least 4 characters"),
  shippingDivision: z.string().min(1, "Division is required"),
  shippingLandmark: z.string().optional(),
  shippingInstructions: z.string().optional(),
  shippingPhone: z.string().min(1, "Phone number is required"),
  
  // Billing Address
  sameAsShipping: z.boolean().default(true),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingStreet: z.string().optional(),
  billingDistrict: z.string().optional(),
  billingThana: z.string().optional(),
  billingPostCode: z.string().optional(),
  billingDivision: z.string().optional(),
  billingLandmark: z.string().optional(),
  billingInstructions: z.string().optional(),
  billingPhone: z.string().optional(),
  
  // Payment
  paymentMethod: z.enum(["cash_on_delivery", "bkash"]),
  bkashNumber: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CartData {
  cart: {
    id: number;
    userId: string;
  };
  items: CartItemWithProduct[];
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading, error } = useQuery<CartData>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      sameAsShipping: true,
      paymentMethod: "cash_on_delivery",
      shippingDivision: "Dhaka",
      billingDivision: "Dhaka",
    },
  });

  const sameAsShipping = form.watch("sameAsShipping");
  const paymentMethod = form.watch("paymentMethod");

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

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const items = cartData?.items || [];
      const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const shipping = subtotal >= 5000 ? 0 : 500; // Free shipping over ৳5000, otherwise ৳500
      const total = subtotal + shipping; // No tax

      const shippingAddress: Address = {
        firstName: data.shippingFirstName,
        lastName: data.shippingLastName,
        street: data.shippingStreet,
        city: data.shippingDistrict,
        state: data.shippingDivision,
        zipCode: data.shippingPostCode,
        country: "Bangladesh",
        phone: data.shippingPhone,
        thana: data.shippingThana,
        landmark: data.shippingLandmark,
        instructions: data.shippingInstructions,
      };

      const billingAddress: Address = data.sameAsShipping ? shippingAddress : {
        firstName: data.billingFirstName || "",
        lastName: data.billingLastName || "",
        street: data.billingStreet || "",
        city: data.billingDistrict || "",
        state: data.billingDivision || "",
        zipCode: data.billingPostCode || "",
        country: "Bangladesh",
        phone: data.billingPhone,
        thana: data.billingThana,
        landmark: data.billingLandmark,
        instructions: data.billingInstructions,
      };

      const orderData = {
        orderNumber: `BP-${Date.now()}`,
        status: "pending",
        subtotal: subtotal.toString(),
        tax: "0",
        shipping: shipping.toString(),
        total: total.toString(),
        shippingAddress,
        billingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending",
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
          total: (parseFloat(item.price) * item.quantity).toString(),
        })),
      };

      await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your order. You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation("/profile");
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
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="h-6 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
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
          <h2 className="text-2xl font-bold text-baby-primary mb-4">Error Loading Checkout</h2>
          <p className="text-gray-600">There was an error loading the checkout page.</p>
        </div>
      </div>
    );
  }

  const items = cartData?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-baby-secondary">
      {/* Page Header */}
      <div className="bg-baby-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-baby-primary mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-baby-primary">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="shippingStreet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address / Village / Area</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="House/Road number, Village or Area name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingDistrict"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Dhaka, Chittagong" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingThana"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thana / Upazila</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Thana/Upazila" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dhanmondi">Dhanmondi</SelectItem>
                                <SelectItem value="gulshan">Gulshan</SelectItem>
                                <SelectItem value="uttara">Uttara</SelectItem>
                                <SelectItem value="banani">Banani</SelectItem>
                                <SelectItem value="mirpur">Mirpur</SelectItem>
                                <SelectItem value="mohammadpur">Mohammadpur</SelectItem>
                                <SelectItem value="tejgaon">Tejgaon</SelectItem>
                                <SelectItem value="wari">Wari</SelectItem>
                                <SelectItem value="old-dhaka">Old Dhaka</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingPostCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 1000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingDivision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Division</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Division" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dhaka">Dhaka</SelectItem>
                                <SelectItem value="chittagong">Chittagong</SelectItem>
                                <SelectItem value="rajshahi">Rajshahi</SelectItem>
                                <SelectItem value="khulna">Khulna</SelectItem>
                                <SelectItem value="barisal">Barisal</SelectItem>
                                <SelectItem value="sylhet">Sylhet</SelectItem>
                                <SelectItem value="rangpur">Rangpur</SelectItem>
                                <SelectItem value="mymensingh">Mymensingh</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingLandmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landmark (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Near City Hospital, Behind main mosque" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Call before delivery, Ring doorbell twice" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="01XXXXXXXXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-baby-primary">Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="sameAsShipping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Same as shipping address</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {!sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="billingFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billingLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="billingStreet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="billingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billingState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billingZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-baby-primary">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 gap-4"
                          >
                            <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4">
                              <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                              <Label htmlFor="cash_on_delivery" className="flex-1">Cash on Delivery</Label>
                              <div className="w-16 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center">COD</div>
                            </div>
                            <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4">
                              <RadioGroupItem value="bkash" id="bkash" />
                              <Label htmlFor="bkash" className="flex-1">bKash</Label>
                              <div className="w-16 h-5 bg-pink-600 rounded text-white text-xs flex items-center justify-center">bKash</div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {paymentMethod === "bkash" && (
                    <div className="mt-6 space-y-4">
                      <FormField
                        control={form.control}
                        name="bkashNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>bKash Account Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="01XXXXXXXXX" type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          You will receive a payment request on your bKash number after placing the order. 
                          Please complete the payment to confirm your order.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash_on_delivery" && (
                    <div className="mt-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Pay in cash when your order is delivered. No advance payment required.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-baby-primary">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.product.imageUrl || "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-baby-primary truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.size} • {item.color} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">৳{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className={`font-medium ${shipping === 0 ? "text-baby-green" : ""}`}>
                        {shipping === 0 ? "Free" : `৳${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-baby-primary">Total</span>
                      <span className="text-lg font-bold text-baby-primary">৳{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-baby-accent hover:bg-blue-600 text-white py-3 font-semibold"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-600">
                      Your payment information is secure and encrypted
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
