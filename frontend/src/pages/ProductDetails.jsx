import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchReviews, fetchProductAnalytics } from '../services/api';
import { SourceBadge } from '../components/SourceBadge';
import { ReviewCard } from '../components/ReviewCard';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { AspectBreakdown } from '../components/AspectBreakdown';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';

export const ProductDetails = ({ product, setActivePage }) => {
  const [reviews, setReviews] = useState([]);
  const [source, setSource] = useState('live_api');
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const selectedProduct = product || {
    product_id: 'PROD-101',
    product_name: 'SonicPro Wireless Noise-Canceling Headphones',
    category: 'Audio',
    average_rating: 4.6,
    total_reviews: 128,
    description: 'Premium active noise-canceling headphones featuring 30-hour battery life and custom dynamic acoustic drivers.'
  };

  useEffect(() => {
    loadData(false);
  }, [selectedProduct.product_id]);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [reviewRes, analyticsRes] = await Promise.all([
        fetchReviews(selectedProduct.product_id, forceRefresh),
        fetchProductAnalytics(selectedProduct.product_id, forceRefresh)
      ]);

      setReviews(reviewRes.reviews || []);
      setSource(reviewRes.source || 'live_api');
      setMessage(reviewRes.message || '');
      setAnalytics(analyticsRes);
    } catch (e) {
      console.error('Error loading product details:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActivePage('products')}
          className="flex items-center gap-1.5 text-zinc-800 hover:text-black border-zinc-200 cursor-pointer font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Catalog
        </Button>

        {/* Product Banner Card */}
        <Card className="p-6 border-zinc-200/80 bg-white shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-zinc-900 border-zinc-300 bg-zinc-50 font-bold">
                  {selectedProduct.product_id}
                </Badge>
                <span className="text-xs text-zinc-500 font-medium">• {selectedProduct.category}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 font-sans">{selectedProduct.product_name}</h1>
              <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">{selectedProduct.description}</p>
            </div>

            {/* Current Source Badge Banner */}
            <div className="flex flex-col items-end gap-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <span className="text-[11px] text-zinc-500 font-medium">Pipeline Source:</span>
              <SourceBadge source={source} />
            </div>
          </div>

          {/* Status Alert Banner */}
          {message && (
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-700 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </Card>

        {/* Analytics Charts */}
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
          analytics && (
            <AnalyticsCharts
              sentimentDist={analytics.sentiment_distribution}
              ratingDist={analytics.rating_distribution}
              trendData={analytics.review_trend}
            />
          )
        )}

        {/* Aspect Breakdown */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 space-y-3 border-zinc-200/80 bg-white">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <AspectBreakdown aspects={analytics?.aspect_sentiment} />
        )}

        {/* Review Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-900" />
              Scraped Customer Reviews ({reviews.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-800 hover:text-black border-zinc-200 cursor-pointer font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Scraper
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <Card key={idx} className="p-4 space-y-3 h-40 border-zinc-200/80 bg-white">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev, idx) => (
                <ReviewCard key={idx} review={rev} />
              ))}
            </div>
          )}
        </div>

      </div>
    </TooltipProvider>
  );
};
