import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  BarChart3,
  Tag,
  Server,
  Cpu,
  Database,
  Award,
  UploadCloud
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

export const Navbar = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Catalog overview & real-time metrics' },
    { id: 'products', label: 'Products', icon: ShoppingBag, tooltip: 'Monitored e-commerce product catalog' },
    { id: 'review-analysis', label: 'Review Sandbox', icon: Sparkles, tooltip: 'Interactive scikit-learn review inference' },
    { id: 'sentiment-analytics', label: 'Sentiment Trends', icon: BarChart3, tooltip: 'Catalog-wide sentiment distribution' },
    { id: 'aspect-analysis', label: 'Aspect ABSA', icon: Tag, tooltip: 'Aspect-based sentiment breakdown' },
    { id: 'brand-intelligence', label: 'Brand Intel', icon: Award, tooltip: 'Leaderboard & competitive comparison' },
    { id: 'model-evaluation', label: 'Model Metrics', icon: Cpu, tooltip: 'Confusion matrix & benchmark F1 scores' },
    { id: 'data-ingestion', label: 'Ingestion', icon: UploadCloud, tooltip: 'Upload review datasets & live scrape' }
  ];

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-4 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Brand Logo & Title */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActivePage('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4 text-white" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-zinc-950 font-sans">
                  SentimentalAI
                </span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-zinc-900 border-zinc-300 bg-zinc-100 font-bold">
                  v2.0
                </Badge>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">Brand Intelligence Framework</span>
            </div>
          </div>

          {/* Center: Navigation Pills */}
          <nav className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80 overflow-x-auto max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActivePage(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      {item.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{item.tooltip}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Right: Backend API Status Indicator (Pure Monochrome) */}
          <div className="hidden lg:flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-900 shadow-sm cursor-pointer hover:bg-zinc-100 transition-colors">
                  <Server className="w-3.5 h-3.5 text-zinc-800" />
                  <span className="text-[11px] font-bold text-zinc-950">API Active</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-950"></span>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">Express Backend Running on :5000</TooltipContent>
            </Tooltip>
          </div>

        </div>
      </header>
    </TooltipProvider>
  );
};
