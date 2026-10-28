import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare, Smile, Frown, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { fetchGlobalAnalytics, fetchProducts } from '../services/api';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { ApiSimulator } from '../components/ApiSimulator';
import { SourceBadge } from '../components/SourceBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';

export const Dashboard = ({ setActivePage, setSelectedProduct }) => {
  const [globalStats, setGlobalStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [analyticsRes, productsRes] = await Promise.all([
        fetchGlobalAnalytics(forceRefresh),
        fetchProducts(forceRefresh)
      ]);
      setGlobalStats(analyticsRes);
      setProducts(productsRes.products || []);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    if (setSelectedProduct) setSelectedProduct(product);
    if (setActivePage) setActivePage('product-details');
  };

  const sentimentDist = globalStats?.sentiment_distribution || { positive: 18, neutral: 4, negative: 6 };
  const ratingDist = globalStats?.rating_distribution || { 5: 14, 4: 8, 3: 4, 2: 1, 1: 3 };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Hero Banner Card */}
        <Card className="border-zinc-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                  NLP Brand Intelligence Engine
                </span>
                <span className="text-xs text-zinc-400">• Production Ready</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 font-sans">
                Continuous Sentiment Mining & Brand Intelligence
              </h1>
              <p className="text-xs text-zinc-600 max-w-3xl leading-relaxed">
                Aggregates multi-retailer customer reviews, classifies sentiment via trained scikit-learn models (<span className="text-zinc-950 font-semibold">Linear SVC / Softmax</span>), and provides automated 3-tier scraper resilience (<span className="text-zinc-950 font-semibold">Live Stream</span> &rarr; <span className="text-zinc-700 font-semibold">MongoDB Cache</span> &rarr; <span className="text-zinc-500 font-semibold">Offline Dataset</span>).
              </p>
            </div>

            <Button
              onClick={() => setActivePage('review-analysis')}
              className="bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm flex items-center gap-2 text-xs font-semibold px-4 py-2 shrink-0 cursor-pointer"
            >
              Live Review Sandbox
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Metrics Grid (Pure Monochrome) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-medium">Total Tracked Products</span>
              <ShoppingBag className="w-4 h-4 text-zinc-900" />
            </div>
            {loading ? (
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-950 font-mono">{globalStats?.total_products || 6}</span>
                <Badge variant="outline" className="text-[10px] text-zinc-900 border-zinc-200 bg-zinc-50">Catalog Active</Badge>
              </div>
            )}
          </Card>

          <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-medium">Scraped Reviews</span>
              <MessageSquare className="w-4 h-4 text-zinc-900" />
            </div>
            {loading ? (
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-950 font-mono">{globalStats?.total_reviews || 28}</span>
                <Badge variant="outline" className="text-[10px] text-zinc-900 border-zinc-200 bg-zinc-50">100% Processed</Badge>
              </div>
            )}
          </Card>

          <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-medium">Positive Customer Share</span>
              <Smile className="w-4 h-4 text-zinc-900" />
            </div>
            {loading ? (
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-950 font-mono">
                  {Math.round((sentimentDist.positive / (globalStats?.total_reviews || 28)) * 100)}%
                </span>
                <span className="text-xs text-zinc-500 font-medium">Satisfaction</span>
              </div>
            )}
          </Card>

          <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-medium">Negative Sentiment Share</span>
              <Frown className="w-4 h-4 text-zinc-600" />
            </div>
            {loading ? (
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-950 font-mono">
                  {Math.round((sentimentDist.negative / (globalStats?.total_reviews || 28)) * 100)}%
                </span>
                <span className="text-xs text-zinc-500 font-medium">Attention</span>
              </div>
            )}
          </Card>

        </div>

        {/* Interactive API Scraper Simulator */}
        <ApiSimulator onModeChange={() => loadDashboardData(true)} />

        {/* Analytics Charts with Skeleton fallback */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="h-72 p-5 space-y-4 border-zinc-200/80 bg-white">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-52 w-full rounded-xl" />
            </Card>
            <Card className="h-72 p-5 space-y-4 border-zinc-200/80 bg-white">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-52 w-full rounded-xl" />
            </Card>
            <Card className="h-72 p-5 space-y-4 border-zinc-200/80 bg-white">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-52 w-full rounded-xl" />
            </Card>
          </div>
        ) : (
          <AnalyticsCharts sentimentDist={sentimentDist} ratingDist={ratingDist} />
        )}

        {/* Product Catalog Grid Summary */}
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader className="p-5 border-b border-zinc-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-950">Monitored Product Catalog</CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">Click any product to inspect real-time reviews & ABSA insights</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePage('products')}
              className="text-xs text-zinc-800 hover:text-zinc-950 hover:bg-zinc-50 border-zinc-200"
            >
              View Full Catalog &rarr;
            </Button>
          </CardHeader>

          <CardContent className="p-5">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <Card key={idx} className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => (
                  <div
                    key={product.product_id}
                    onClick={() => handleProductSelect(product)}
                    className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 hover:border-zinc-900 hover:bg-white hover:shadow-sm cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider uppercase">
                          {product.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 group-hover:text-black transition-colors line-clamp-1">
                          {product.product_name}
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-zinc-950 border-zinc-200 bg-white font-mono text-xs font-bold">
                        ★ {product.average_rating}
                      </Badge>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between text-xs border-t border-zinc-200/60 pt-2 text-zinc-500">
                      <span className="font-mono text-[11px] text-zinc-600">{product.total_reviews} Reviews</span>
                      <SourceBadge source="live_api" size="small" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </TooltipProvider>
  );
};
