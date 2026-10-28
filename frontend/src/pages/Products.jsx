import React, { useState, useEffect } from 'react';
import { Search, Star, ShoppingBag } from 'lucide-react';
import { fetchProducts } from '../services/api';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';

export const Products = ({ setActivePage, setSelectedProduct }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts();
      setProducts(res.products || []);
    } catch (e) {
      console.error('Error fetching products catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Audio', 'Electronics', 'Wearables', 'Appliances'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product) => {
    if (setSelectedProduct) setSelectedProduct(product);
    if (setActivePage) setActivePage('product-details');
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
              Monitored Product Catalog
            </h1>
            <p className="text-xs text-zinc-500">
              Select any product to inspect real-time review sentiment distributions, aspect mining, and scraper logs.
            </p>
          </div>

          {/* Search & Tabs Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-zinc-200 text-xs text-zinc-900"
              />
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList>
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Product Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Card key={idx} className="overflow-hidden flex flex-col justify-between h-[340px] border-zinc-200/80 bg-white">
                <Skeleton className="h-44 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.product_id}
                onClick={() => handleProductClick(product)}
                className="overflow-hidden group cursor-pointer border-zinc-200/80 bg-white hover:border-zinc-900 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image Banner */}
                <div className="h-44 w-full relative overflow-hidden bg-zinc-100">
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-125"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-zinc-900 border border-zinc-200 shadow-sm">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-zinc-950 font-bold text-xs flex items-center gap-1 border border-zinc-200 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
                    {product.average_rating}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono">ID: {product.product_id}</span>
                    <h3 className="text-sm font-bold text-zinc-950 group-hover:text-black transition-colors">
                      {product.product_name}
                    </h3>
                    <p className="text-xs text-zinc-600 line-clamp-2 mt-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
                    <span className="text-zinc-500 font-mono text-[11px]">{product.total_reviews} Scraped Reviews</span>
                    <span className="text-zinc-950 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </TooltipProvider>
  );
};
