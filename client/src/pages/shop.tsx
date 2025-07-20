import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/product-card";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Shop() {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    search: "",
    ageGroup: [] as string[],
    category: [] as string[],
    priceRange: "",
    sizes: [] as string[],
    sortBy: "featured",
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ageGroup = urlParams.get("ageGroup");
    if (ageGroup) {
      setFilters(prev => ({ ...prev, ageGroup: [ageGroup] }));
    }
  }, [location]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append("search", filters.search);
    if (filters.ageGroup.length > 0) params.append("ageGroup", filters.ageGroup[0]);
    if (filters.sortBy !== "featured") params.append("sort", filters.sortBy);
    
    params.append("limit", itemsPerPage.toString());
    params.append("offset", ((currentPage - 1) * itemsPerPage).toString());
    
    return params.toString();
  };

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products", buildQueryParams()],
    queryFn: async () => {
      const response = await fetch(`/api/products?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const handleFilterChange = (type: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSizeToggle = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      ageGroup: [],
      category: [],
      priceRange: "",
      sizes: [],
      sortBy: "featured",
    });
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-baby-primary mb-4">Error Loading Products</h2>
          <p className="text-gray-600">There was an error loading the products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-baby-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-baby-primary mb-2">Baby Clothing Collection</h1>
          <p className="text-gray-600">Discover our complete range of premium organic baby clothing</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-baby-primary">Filters</h3>
                  <Button variant="ghost" onClick={resetFilters} className="text-sm">
                    Clear All
                  </Button>
                </div>
                
                {/* Age Group Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-baby-primary mb-3">Age Group</h4>
                  <div className="space-y-2">
                    {["0-6-months", "6-12-months", "12-24-months"].map((age) => (
                      <div key={age} className="flex items-center space-x-2">
                        <Checkbox
                          id={age}
                          checked={filters.ageGroup.includes(age)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange("ageGroup", [...filters.ageGroup, age]);
                            } else {
                              handleFilterChange("ageGroup", filters.ageGroup.filter(a => a !== age));
                            }
                          }}
                        />
                        <Label htmlFor={age} className="text-gray-700">
                          {age.replace("-", "-").replace("months", " Months")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-baby-primary mb-3">Category</h4>
                  <div className="space-y-2">
                    {["Onesies", "Sleepers", "Outerwear", "Accessories"].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={filters.category.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange("category", [...filters.category, category]);
                            } else {
                              handleFilterChange("category", filters.category.filter(c => c !== category));
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-gray-700">{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-baby-primary mb-3">Price Range</h4>
                  <RadioGroup value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0-25" id="price1" />
                      <Label htmlFor="price1" className="text-gray-700">$0 - $25</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="25-50" id="price2" />
                      <Label htmlFor="price2" className="text-gray-700">$25 - $50</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="50-plus" id="price3" />
                      <Label htmlFor="price3" className="text-gray-700">$50+</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Size Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-baby-primary mb-3">Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {["NB", "3M", "6M", "9M", "12M", "18M"].map((size) => (
                      <Button
                        key={size}
                        variant={filters.sizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSizeToggle(size)}
                        className={filters.sizes.includes(size) ? "bg-baby-accent text-white" : ""}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Search baby products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Showing {products?.length || 0} products
                </span>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Best Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(9)].map((_, index) => (
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
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-baby-primary mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                <Button onClick={resetFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {products && products.length > 0 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="px-3 py-2 bg-baby-accent text-white rounded-lg">
                  {currentPage}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!products || products.length < itemsPerPage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
