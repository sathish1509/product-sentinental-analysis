import React, { useState, useEffect } from 'react';
import { Tag, CheckCircle2, AlertTriangle, Layers, ArrowUpDown } from 'lucide-react';
import { AspectBreakdown } from '../components/AspectBreakdown';
import { fetchProductAnalytics, fetchProducts } from '../services/api';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { TooltipProvider } from '../components/ui/tooltip';

export const AspectAnalysis = () => {
  const [aspects, setAspects] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('PROD-101');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductsList();
  }, []);

  useEffect(() => {
    loadAspectData(selectedProductId);
  }, [selectedProductId]);

  const loadProductsList = async () => {
    try {
      const res = await fetchProducts();
      if (res.products && res.products.length > 0) {
        setProducts(res.products);
      }
    } catch (e) {
      console.error('Error fetching product list:', e);
    }
  };

  const loadAspectData = async (prodId) => {
    setLoading(true);
    try {
      const res = await fetchProductAnalytics(prodId);
      setAspects(res.aspect_sentiment || []);
    } catch (e) {
      console.error('Error fetching aspect analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Banner Card */}
        <Card className="p-6 space-y-4 border-zinc-200/80 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
                  <Tag className="w-3.5 h-3.5 text-zinc-900" />
                  Multi-Dimensional NLP Analytics
                </span>
                <span className="text-xs text-zinc-400">• Fine-Grained ABSA</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
                Aspect-Based Sentiment Mining (ABSA)
              </h1>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
                Extracts customer perceptions across 8 discrete product dimensions (Price, Quality, Battery, Performance, Delivery, Design, Durability, Customer Service) from unstructured review texts.
              </p>
            </div>

            {/* Product Selector Dropdown */}
            <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
              <span className="text-xs font-bold text-zinc-700 whitespace-nowrap">Product:</span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm cursor-pointer"
              >
                {products.length > 0 ? (
                  products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} ({p.product_id})
                    </option>
                  ))
                ) : (
                  <option value="PROD-101">SonicPro Headphones (PROD-101)</option>
                )}
              </select>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="p-4 space-y-3 border-zinc-200/80 bg-white">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <AspectBreakdown aspects={aspects} />
        )}

        {/* Actionable Insights (Pure Monochrome) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-3 border-zinc-200/80 bg-white shadow-sm">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-950" />
              Key Feature Strengths
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Customer feedback strongly validates <strong className="text-zinc-950 font-bold">Battery Life</strong> and <strong className="text-zinc-950 font-bold">Acoustic Quality</strong>, with positive mentions exceeding 80%. Display brightness and active noise cancellation remain primary positive drivers.
            </p>
          </Card>

          <Card className="p-5 space-y-3 border-zinc-200/80 bg-white shadow-sm">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-zinc-600" />
              High Priority Engineering Concerns
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              <strong className="text-zinc-950 font-bold">Customer Service</strong> and <strong className="text-zinc-950 font-bold">Durability</strong> exhibit higher negative sentiment ratios. Reviewers report delays in replacement processing for damaged ear cushions and liquid damage claims.
            </p>
          </Card>
        </div>

      </div>
    </TooltipProvider>
  );
};
