import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, type SignupData } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Signup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "customer",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      return await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: (user) => {
      toast({
        title: "Success",
        description: "Account created successfully! Welcome to Baby Plus!",
      });
      queryClient.setQueryData(["/api/auth/user"], user);
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupData) => {
    signupMutation.mutate(data);
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
          <CardTitle className="text-2xl text-center">Create account</CardTitle>
          <CardDescription className="text-center">
            Join us and start shopping for your little one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                        placeholder="Create a password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
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
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-baby-accent hover:underline font-medium">
              Sign in
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