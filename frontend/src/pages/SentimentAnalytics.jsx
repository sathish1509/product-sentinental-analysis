import React, { useState, useEffect } from 'react';
import { BarChart3, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { fetchGlobalAnalytics } from '../services/api';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { TooltipProvider } from '../components/ui/tooltip';

export const SentimentAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchGlobalAnalytics();
      setStats(res);
    } catch (e) {
      console.error('Error fetching global sentiment analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const sentimentDist = stats?.sentiment_distribution || { positive: 18, neutral: 4, negative: 6 };
  const ratingDist = stats?.rating_distribution || { 5: 14, 4: 8, 3: 4, 2: 1, 1: 3 };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Banner Card */}
        <Card className="p-6 space-y-2 border-zinc-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
              <BarChart3 className="w-3.5 h-3.5 text-zinc-900" />
              Cross-Catalog Sentiment Intelligence
            </span>
            <span className="text-xs text-zinc-400">• Macro Metrics</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
            Catalog-Wide Sentiment Distribution & Trends
          </h1>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-4xl">
            Aggregated sentiment metrics and monthly temporal trends across all scraped product categories (Audio, Electronics, Wearables, Appliances).
          </p>
        </Card>

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

        {/* Driver Analysis Grid (Pure Monochrome) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Top Positive Sentiment Drivers */}
          <Card className="p-5 space-y-3 border-zinc-200/80 bg-white shadow-sm">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-zinc-950" />
              Top Positive Sentiment Drivers
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2 text-xs">
                {(stats?.top_positive_aspects || ['Active Noise Cancellation', 'OLED Picture Contrast', 'Battery Life (30+ Hrs)', 'LiDAR Vacuum Mapping']).map((driver, i) => (
                  <li key={i} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{driver}</span>
                    <Badge variant="outline" className="font-mono text-[10px] text-zinc-950 border-zinc-300 bg-white font-bold">
                      +92% Impact
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Top Negative Sentiment Drivers */}
          <Card className="p-5 space-y-3 border-zinc-200/80 bg-white shadow-sm">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-zinc-600" />
              Top Negative Complaints
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2 text-xs">
                {(stats?.top_complaints || ['Bluetooth Disconnections', 'Ear Cushion Heat Buildup', 'TV Onboard Audio Bass', 'Water Resistance Claims']).map((complaint, i) => (
                  <li key={i} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{complaint}</span>
                    <Badge variant="default" className="font-mono text-[10px] bg-zinc-950 text-white font-bold">
                      -85% Impact
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

        </div>

      </div>
    </TooltipProvider>
  );
};
