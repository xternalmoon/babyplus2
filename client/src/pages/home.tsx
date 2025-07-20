import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/product-card";
import { Heart, Shield, Truck, RotateCcw, Zap } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Home() {
  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white" style={{ backgroundColor: '#142e15' }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Gentle Care for<br />
              <span className="text-baby-green">Growing Dreams</span>
            </h2>
            <p className="text-xl sm:text-2xl mb-8 text-gray-100">
              Premium organic baby clothing designed for comfort, style, and your little one's delicate skin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button className="bg-baby-green hover:bg-green-600 text-white px-8 py-4 text-lg h-auto">
                  Shop Collection
                </Button>
              </Link>
              <Button 
                variant="outline"
                className="border-2 border-white text-black bg-white hover:bg-baby-green hover:text-white px-8 py-4 text-lg h-auto"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-baby-primary mb-4">Shop by Age</h3>
            <p className="text-gray-600 text-lg">Find the perfect fit for every milestone</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/shop?ageGroup=0-6-months">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-baby-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-baby-green transition-colors">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-baby-primary mb-2">0-6 Months</h4>
                    <p className="text-gray-600">Newborn essentials</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shop?ageGroup=6-12-months">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-baby-green rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-baby-accent transition-colors">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-baby-primary mb-2">6-12 Months</h4>
                    <p className="text-gray-600">Crawling & sitting</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shop?ageGroup=12-24-months">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-baby-primary transition-colors">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-baby-primary mb-2">12-24 Months</h4>
                    <p className="text-gray-600">Active toddler</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-baby-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-baby-primary mb-4">Featured Products</h3>
            <p className="text-gray-600 text-lg">Handpicked favorites loved by parents worldwide</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button className="bg-baby-primary hover:bg-gray-800 text-white px-8 py-3 text-lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-baby-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-baby-primary mb-2">100% Organic</h4>
              <p className="text-gray-600">Certified organic cotton safe for baby's delicate skin</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-baby-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-baby-primary mb-2">Free Shipping</h4>
              <p className="text-gray-600">Free delivery on all orders over ৳5000 with fast processing</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-baby-primary mb-2">30-Day Returns</h4>
              <p className="text-gray-600">Easy returns and exchanges within 30 days of purchase</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
