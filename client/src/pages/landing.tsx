import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Truck, RotateCcw } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Announcement Bar */}
      <div className="bg-baby-green text-white text-center py-2 text-sm">
        <p>Free shipping on orders over $50 • 30-day returns • Organic cotton guarantee</p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-baby-primary">Baby Plus</h1>
                <p className="text-xs text-gray-500 -mt-1">Premium Baby Clothing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = "/login"}
                className="bg-baby-accent hover:bg-blue-600 text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-baby-primary to-baby-accent text-white">
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
              <Button 
                onClick={() => window.location.href = "/login"}
                className="bg-baby-green hover:bg-green-600 text-white px-8 py-4 text-lg h-auto"
              >
                Start Shopping
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white text-black bg-white hover:bg-baby-green hover:text-white hover:border-baby-green px-8 py-4 text-lg h-auto transition-all duration-200"
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

            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-baby-green rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-baby-accent transition-colors">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-baby-primary mb-2">6-12 Months</h4>
                  <p className="text-gray-600">Crawling & sitting</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-baby-primary transition-colors">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-baby-primary mb-2">12-24 Months</h4>
                  <p className="text-gray-600">Active toddler</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-baby-secondary">
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
              <p className="text-gray-600">Free delivery on all orders over $50 with fast processing</p>
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

      {/* CTA Section */}
      <section className="py-16 bg-baby-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h3>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of happy parents who trust Baby Plus for their little ones.
          </p>
          <Button 
            onClick={() => window.location.href = "/login"}
            className="bg-baby-green hover:bg-green-600 text-white px-8 py-4 text-lg h-auto"
          >
            Sign In & Shop Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-baby-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Baby Plus</h3>
              <p className="text-gray-300 mb-4">Premium organic baby clothing designed with love for your little ones.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-300">
                <li>0-6 Months</li>
                <li>6-12 Months</li>
                <li>12-24 Months</li>
                <li>Accessories</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Contact Us</li>
                <li>Size Guide</li>
                <li>Shipping Info</li>
                <li>Returns</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Baby Plus. All rights reserved. Made with love for little ones.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
