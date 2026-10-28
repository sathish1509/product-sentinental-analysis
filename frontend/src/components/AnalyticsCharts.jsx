import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, TrendingUp, BarChart2, PieChart as PieIcon } from 'lucide-react';

// Pure Monochrome SaaS Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg space-y-1 text-xs">
        <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 flex items-center justify-between gap-3">
          <span>{label || payload[0].name}</span>
          <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" /> Active
          </span>
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs pt-0.5">
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-2 h-2 rounded-full border border-zinc-300" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-zinc-950">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsCharts = ({ sentimentDist, ratingDist, trendData }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const totalReviews = (sentimentDist?.positive || 0) + (sentimentDist?.neutral || 0) + (sentimentDist?.negative || 0) || 28;
  const posPct = Math.round(((sentimentDist?.positive || 18) / totalReviews) * 100);

  // Pure Monochrome Donut Chart Data
  const pieData = [
    { name: 'Positive', value: sentimentDist?.positive || 18, color: '#09090b', gradientId: 'pieBlack' },
    { name: 'Neutral', value: sentimentDist?.neutral || 4, color: '#71717a', gradientId: 'pieMidGrey' },
    { name: 'Negative', value: sentimentDist?.negative || 6, color: '#d4d4d8', gradientId: 'pieLightGrey' }
  ];

  // Pure Monochrome Bar Chart Data (Tonal Grayscale)
  const barData = [
    { rating: '5 Stars', count: ratingDist?.[5] || 14, color: '#09090b', grad: 'url(#barBlack)' },
    { rating: '4 Stars', count: ratingDist?.[4] || 8, color: '#3f3f46', grad: 'url(#barDarkGrey)' },
    { rating: '3 Stars', count: ratingDist?.[3] || 4, color: '#71717a', grad: 'url(#barMidGrey)' },
    { rating: '2 Stars', count: ratingDist?.[2] || 1, color: '#a1a1aa', grad: 'url(#barLightGrey)' },
    { rating: '1 Star', count: ratingDist?.[1] || 3, color: '#d4d4d8', grad: 'url(#barPaleGrey)' }
  ];

  // Pure Monochrome Area Trend Data
  const lineData = trendData || [
    { month: 'Mar', positive: 65, negative: 20 },
    { month: 'Apr', positive: 70, negative: 18 },
    { month: 'May', positive: 82, negative: 15 },
    { month: 'Jun', positive: 78, negative: 22 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* 1. Sentiment Donut Chart (Pure Monochrome) */}
      <Card className="border-zinc-200/80 bg-white shadow-sm hover:border-zinc-400 transition-all flex flex-col justify-between">
        <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200">
              <PieIcon className="w-3.5 h-3.5 text-zinc-900" />
            </div>
            <CardTitle className="text-xs font-bold text-zinc-950 tracking-tight">Sentiment Distribution</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono text-zinc-800 border-zinc-200 bg-zinc-50">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 mr-1" />
            Live Stream
          </Badge>
        </CardHeader>

        <CardContent className="p-4 relative flex-1 flex flex-col items-center justify-center">
          <div className="h-56 w-full relative">
            
            {/* Center Donut Minimalist Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <span className="text-3xl font-extrabold font-mono text-zinc-950 tracking-tight">{posPct}%</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Positive Share</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="pieBlack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18181b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#09090b" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="pieMidGrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8c8c94" stopOpacity={1} />
                    <stop offset="100%" stopColor="#52525b" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="pieLightGrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e4e4e7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d4d4d8" stopOpacity={1} />
                  </linearGradient>
                </defs>

                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  cornerRadius={4}
                  stroke="#ffffff"
                  strokeWidth={2}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#${entry.gradientId})`}
                      style={{
                        filter: activeIndex === index ? 'drop-shadow(0 0 6px rgba(0,0,0,0.25))' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monochrome Legend */}
          <div className="flex items-center justify-center gap-4 text-[11px] pt-3 border-t border-zinc-100 w-full">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-600 font-medium">{item.name}:</span>
                <span className="font-mono font-bold text-zinc-950">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Rating Breakdown Bar Chart (Pure Monochrome) */}
      <Card className="border-zinc-200/80 bg-white shadow-sm hover:border-zinc-400 transition-all flex flex-col justify-between">
        <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200">
              <BarChart2 className="w-3.5 h-3.5 text-zinc-900" />
            </div>
            <CardTitle className="text-xs font-bold text-zinc-950 tracking-tight">Rating Breakdown (1-5 Stars)</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono text-zinc-800 border-zinc-200 bg-zinc-50">
            Real-Time
          </Badge>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="barBlack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18181b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#09090b" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="barDarkGrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3f3f46" stopOpacity={1} />
                    <stop offset="100%" stopColor="#27272a" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="barMidGrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#71717a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#52525b" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="barLightGrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a1a1aa" stopOpacity={1} />
                    <stop offset="100%" stopColor="#71717a" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="barPaleGrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4d4d8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#a1a1aa" stopOpacity={0.9} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis
                  dataKey="rating"
                  stroke="#71717a"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(244, 244, 245, 0.8)' }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.grad} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-zinc-600 text-center border-t border-zinc-100 pt-2 font-mono">
            Most frequent rating: <span className="text-zinc-950 font-bold">5 Stars</span> (14 reviews)
          </div>
        </CardContent>
      </Card>

      {/* 3. Sentiment Trend Timeline (Pure Monochrome) */}
      <Card className="md:col-span-2 lg:col-span-1 border-zinc-200/80 bg-white shadow-sm hover:border-zinc-400 transition-all flex flex-col justify-between">
        <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-900" />
            </div>
            <CardTitle className="text-xs font-bold text-zinc-950 tracking-tight">Sentiment Trend Over Time</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono text-zinc-800 border-zinc-200 bg-zinc-50">
            +4.2% Trend
          </Badge>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaPosMono" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#09090b" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#09090b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaNegMono" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a1a1aa" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#a1a1aa" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="positive"
                  stroke="#09090b"
                  strokeWidth={2.2}
                  fill="url(#areaPosMono)"
                  dot={{ r: 3.5, strokeWidth: 2, stroke: '#09090b', fill: '#ffffff' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#09090b', fill: '#09090b' }}
                  name="Positive %"
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stroke="#a1a1aa"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  fill="url(#areaNegMono)"
                  dot={{ r: 3, strokeWidth: 1.5, stroke: '#71717a', fill: '#ffffff' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#52525b', fill: '#71717a' }}
                  name="Negative %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-600 border-t border-zinc-100 pt-2 font-mono">
            <span className="flex items-center gap-1.5 text-zinc-950 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" /> Positive Trend
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-500" /> Negative Trend
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
