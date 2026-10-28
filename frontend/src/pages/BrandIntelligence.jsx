import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, ShieldCheck, BarChart3, RefreshCw, Scale } from 'lucide-react';
import { fetchBrandIntelligence, compareProducts, fetchProducts } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';

export const BrandIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Comparator state
  const [productList, setProductList] = useState([]);
  const [prodA, setProdA] = useState('PROD-101');
  const [prodB, setProdB] = useState('PROD-102');
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [intelRes, productsRes] = await Promise.all([
        fetchBrandIntelligence(),
        fetchProducts()
      ]);
      setData(intelRes);
      setProductList(productsRes.products || []);

      // Run initial comparison
      runComparison('PROD-101', 'PROD-102');
    } catch (e) {
      console.error('Failed to load brand intelligence:', e);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async (idA, idB) => {
    setComparing(true);
    try {
      const res = await compareProducts([idA, idB]);
      setComparison(res.products || []);
    } catch (e) {
      console.error('Failed to compare products:', e);
    } finally {
      setComparing(false);
    }
  };

  const handleCompareClick = () => {
    if (prodA && prodB) {
      runComparison(prodA, prodB);
    }
  };

  const brandRankings = data?.brand_rankings || [];
  const recommendations = data?.strategic_recommendations || [];

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Header Banner */}
        <Card className="p-6 border-zinc-200/80 bg-white shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
              <Award className="w-3.5 h-3.5 text-zinc-900" />
              Executive Brand Analytics
            </span>
            <span className="text-xs text-zinc-400">• Competitive Benchmarking & Theme Extraction</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
            Brand Intelligence & Market Positioning
          </h1>
          <p className="text-xs text-zinc-600 max-w-4xl leading-relaxed">
            Synthesizes customer sentiment across product categories and retailer platforms. Identifies recurring brand complaints, tracks net sentiment scores, and delivers data-driven strategic actions.
          </p>
        </Card>

        {/* Brand Leaderboard Table (Pure Monochrome) */}
        <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <CardTitle className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-900" />
                Cross-Brand Sentiment Leaderboard
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ranked by Net Sentiment Score (% Positive minus % Negative customer sentiment).
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-zinc-800 border-zinc-200 bg-zinc-50 font-bold">
              {brandRankings.length} Monitored Brands
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] bg-zinc-50/70 font-bold">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Brand / Segment</th>
                  <th className="py-2.5 px-3">Reviews</th>
                  <th className="py-2.5 px-3">Avg Rating</th>
                  <th className="py-2.5 px-3">Positive %</th>
                  <th className="py-2.5 px-3">Negative %</th>
                  <th className="py-2.5 px-3">Net Score</th>
                  <th className="py-2.5 px-3">Primary Complaint Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {brandRankings.map((b) => {
                  const rankBadge = b.rank === 1 ? 'bg-zinc-950 text-white border-zinc-950 font-bold' :
                                    b.rank === 2 ? 'bg-zinc-700 text-white border-zinc-700 font-bold' :
                                    'bg-zinc-100 text-zinc-900 border-zinc-300 font-bold';

                  return (
                    <tr key={b.brand} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-[11px] ${rankBadge}`}>
                          #{b.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans font-bold text-zinc-950 text-xs">
                        {b.brand}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">{b.total_reviews}</td>
                      <td className="py-3 px-3 text-zinc-950 font-bold">★ {b.average_rating}</td>
                      <td className="py-3 px-3 text-zinc-950 font-bold">{b.positive_percentage}%</td>
                      <td className="py-3 px-3 text-zinc-600 font-bold">{b.negative_percentage}%</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] text-zinc-950 border-zinc-300 bg-white font-bold"
                        >
                          {b.net_sentiment_score > 0 ? `+${b.net_sentiment_score}` : b.net_sentiment_score}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-600 text-[11px]">
                        {b.top_complaint}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Side-by-Side Product Comparator */}
        <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <CardTitle className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-zinc-900" />
                Side-by-Side Head-to-Head Comparator
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                Directly compare sentiment, star ratings, and aspect metrics between any two catalog products.
              </p>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={prodA}
                onChange={(e) => setProdA(e.target.value)}
                className="rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm cursor-pointer font-medium"
              >
                {productList.map(p => (
                  <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                ))}
              </select>

              <span className="text-xs font-bold text-zinc-400">VS</span>

              <select
                value={prodB}
                onChange={(e) => setProdB(e.target.value)}
                className="rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm cursor-pointer font-medium"
              >
                {productList.map(p => (
                  <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                ))}
              </select>

              <Button
                size="sm"
                onClick={handleCompareClick}
                disabled={comparing}
                className="bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm text-xs cursor-pointer font-semibold"
              >
                {comparing ? 'Comparing...' : 'Compare'}
              </Button>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          {comparison && comparison.length >= 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {comparison.map((prod) => (
                <div key={prod.product_id} className="p-5 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{prod.category}</span>
                      <h4 className="text-sm font-bold text-zinc-950">{prod.product_name}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">{prod.product_id}</span>
                    </div>
                    <Badge variant="outline" className="text-zinc-950 font-mono text-xs border-zinc-300 bg-white font-bold">
                      ★ {prod.average_rating}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200 shadow-sm">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Reviews</span>
                      <span className="font-bold text-zinc-950">{prod.total_reviews}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200 shadow-sm">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Positive</span>
                      <span className="font-bold text-zinc-950">{prod.positive_percentage}%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200 shadow-sm">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Negative</span>
                      <span className="font-bold text-zinc-950">{prod.negative_percentage}%</span>
                    </div>
                  </div>

                  {/* Aspect Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-zinc-800 block">Aspect Strengths</span>
                    <div className="space-y-1 text-[11px]">
                      {Object.keys(prod.aspects || {}).slice(0, 4).map(asp => {
                        const a = prod.aspects[asp];
                        const pct = Math.round((a.positive / (a.total || 1)) * 100);
                        return (
                          <div key={asp} className="flex items-center justify-between py-1 border-b border-zinc-200/60">
                            <span className="text-zinc-800 font-medium">{asp}</span>
                            <span className="font-mono font-bold text-zinc-950">
                              {pct}% Pos ({a.total} mentions)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-400">
              Select two products above and click Compare.
            </div>
          )}
        </Card>

        {/* Actionable Strategic Recommendations */}
        <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-4">
          <CardTitle className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-zinc-900" />
            Automated Evidence-Based Strategic Recommendations
          </CardTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => {
              return (
                <div key={i} className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-950">{rec.brand}</h4>
                      <Badge variant={rec.priority === 'HIGH' ? 'default' : 'outline'} className="text-[9px] font-mono font-bold">
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      {rec.observation}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-zinc-200 text-[11px] text-zinc-900 shadow-sm flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-900 shrink-0 mt-0.5" />
                    <span className="font-medium">{rec.recommendation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </TooltipProvider>
  );
};
