import React from 'react';
import { ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export const AspectBreakdown = ({ aspects }) => {
  const defaultAspects = [
    { aspect: 'Quality', total_mentions: 18, positive_mentions: 14, negative_mentions: 4, sentiment_score: 78 },
    { aspect: 'Battery', total_mentions: 15, positive_mentions: 12, negative_mentions: 3, sentiment_score: 80 },
    { aspect: 'Performance', total_mentions: 14, positive_mentions: 11, negative_mentions: 3, sentiment_score: 79 },
    { aspect: 'Price', total_mentions: 10, positive_mentions: 6, negative_mentions: 4, sentiment_score: 60 },
    { aspect: 'Delivery', total_mentions: 8, positive_mentions: 7, negative_mentions: 1, sentiment_score: 88 },
    { aspect: 'Design', total_mentions: 12, positive_mentions: 9, negative_mentions: 3, sentiment_score: 75 },
    { aspect: 'Durability', total_mentions: 7, positive_mentions: 3, negative_mentions: 4, sentiment_score: 43 },
    { aspect: 'Customer Service', total_mentions: 6, positive_mentions: 2, negative_mentions: 4, sentiment_score: 33 }
  ];

  const aspectList = aspects && aspects.length > 0 ? aspects : defaultAspects;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-950 text-white">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
            Product Aspect Sentiment Breakdown
          </h3>
        </div>
        <Badge variant="outline" className="text-zinc-700 font-mono text-[10px] border-zinc-200 bg-zinc-50">
          8 Categories Tracked
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {aspectList.map((item, idx) => {
          const score = item.sentiment_score !== undefined ? item.sentiment_score : 70;
          let progressColor = 'bg-zinc-950';

          if (score < 50) {
            progressColor = 'bg-zinc-400';
          } else if (score < 70) {
            progressColor = 'bg-zinc-600';
          }

          return (
            <Card key={idx} className="border-zinc-200/80 bg-white hover:border-zinc-400 hover:shadow-sm transition-all p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-950">{item.aspect}</span>
                <span className="text-xs font-extrabold font-mono text-zinc-950">{score}% Pos</span>
              </div>

              {/* Pure Monochrome Progress Bar */}
              <Progress value={score} color={progressColor} />

              {/* Mentions count */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-mono">
                <span className="flex items-center gap-1 text-zinc-950 font-bold">
                  <ThumbsUp className="w-3 h-3 text-zinc-950" /> {item.positive_mentions || 0}
                </span>
                <span className="text-[10px] text-zinc-400">{item.total_mentions || 0} mentions</span>
                <span className="flex items-center gap-1 text-zinc-500 font-medium">
                  <ThumbsDown className="w-3 h-3 text-zinc-500" /> {item.negative_mentions || 0}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
