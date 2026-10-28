import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, AlertTriangle, WifiOff, Clock, ShieldAlert } from 'lucide-react';
import { updateSimulationMode, fetchSimulationMode, clearApiCache } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

export const ApiSimulator = ({ onModeChange }) => {
  const [currentMode, setCurrentMode] = useState('LIVE_ONLINE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const res = await fetchSimulationMode();
      if (res.current_mode) {
        setCurrentMode(res.current_mode);
      }
    } catch (e) {
      console.warn('Could not fetch API simulation mode:', e);
    }
  };

  const handleModeSelect = async (mode) => {
    const previousMode = currentMode;
    setCurrentMode(mode);
    clearApiCache();
    if (onModeChange) onModeChange(mode);

    setLoading(true);
    try {
      await updateSimulationMode(mode);
    } catch (e) {
      console.error('Failed to set API simulation mode:', e);
      setCurrentMode(previousMode);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    {
      id: 'LIVE_ONLINE',
      label: 'Live API Online',
      desc: 'External Review API responding normally (200 OK)',
      icon: CheckCircle2,
      tooltip: 'Normal live data ingestion path'
    },
    {
      id: 'API_TIMEOUT',
      label: 'Simulate API Timeout',
      desc: 'External API takes >3000ms (504 Gateway Timeout)',
      icon: Clock,
      tooltip: 'Triggers fallback to MongoDB Cache'
    },
    {
      id: 'RATE_LIMITED',
      label: 'Simulate Rate Limit',
      desc: 'API Key quota exceeded (429 Too Many Requests)',
      icon: ShieldAlert,
      tooltip: 'Triggers quota fallback logic'
    },
    {
      id: 'SERVER_ERROR',
      label: 'Simulate 500 Error',
      desc: 'External scraper backend failure (500 Server Error)',
      icon: AlertTriangle,
      tooltip: 'Triggers server error fallback path'
    },
    {
      id: 'NETWORK_OFFLINE',
      label: 'Simulate Offline Mode',
      desc: 'No active internet connection (ENOTFOUND)',
      icon: WifiOff,
      tooltip: 'Triggers fallback to Offline CSV/JSON'
    }
  ];

  return (
    <TooltipProvider>
      <Card className="border-zinc-200/80 bg-white shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-950 text-white">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-xs font-bold text-zinc-950">Resilient 3-Tier Scraper Pipeline Simulator</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Demonstrates automatic graceful failover (<span className="text-zinc-950 font-bold">Live Stream</span> &rarr; <span className="text-zinc-700 font-semibold">MongoDB Cache</span> &rarr; <span className="text-zinc-500 font-semibold">Offline Dataset</span>)
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-[10px] text-zinc-900 border-zinc-300 bg-zinc-50 font-bold">
            Active: {currentMode}
          </Badge>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {modes.map((item) => {
              const Icon = item.icon;
              const isSelected = currentMode === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleModeSelect(item.id)}
                      disabled={loading}
                      className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between space-y-2 cursor-pointer w-full ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                          : 'border-zinc-200 bg-zinc-50/70 text-zinc-700 hover:border-zinc-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-zinc-700'}`} />
                        {isSelected && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-950'}`}>{item.label}</div>
                        <p className={`text-[10px] line-clamp-2 mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>{item.desc}</p>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{item.tooltip}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
