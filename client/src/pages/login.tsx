import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginData } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (user) => {
      toast({
        title: "Success",
        description: "Welcome back!",
      });
      queryClient.setQueryData(["/api/auth/user"], user);
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to login",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-baby-primary/10 to-baby-accent/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="text-center mb-4">
            <Link href="/">
              <h1 className="text-3xl font-bold text-baby-primary">Baby Plus</h1>
              <p className="text-sm text-gray-500">Premium Baby Clothing</p>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-baby-primary hover:bg-baby-primary/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-gray-600 text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="text-baby-accent hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}