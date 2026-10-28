import React from 'react';
import { Star, CheckCircle2, Smile, Meh, Frown, Tag } from 'lucide-react';
import { SourceBadge } from './SourceBadge';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';

export const ReviewCard = ({ review }) => {
  const getSentimentBadge = (sentiment, confidence) => {
    const confPct = Math.round((confidence || 0.85) * 100);
    if (sentiment === 'positive') {
      return (
        <Badge variant="outline" className="border-zinc-300 bg-zinc-100 text-zinc-950 font-bold">
          <Smile className="w-3 h-3 text-zinc-950" />
          Positive ({confPct}%)
        </Badge>
      );
    }
    if (sentiment === 'negative') {
      return (
        <Badge variant="default" className="bg-zinc-950 text-white font-bold border-zinc-950">
          <Frown className="w-3 h-3 text-white" />
          Negative ({confPct}%)
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="border-zinc-300 bg-zinc-50 text-zinc-700 font-semibold">
        <Meh className="w-3 h-3 text-zinc-600" />
        Neutral ({confPct}%)
      </Badge>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'fill-zinc-950 text-zinc-950' : 'text-zinc-200'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="border-zinc-200/80 bg-white hover:border-zinc-400 hover:shadow-sm transition-all flex flex-col justify-between">
      
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between gap-2 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          {renderStars(review.rating)}
          <span className="text-[11px] font-medium text-zinc-500 font-mono">{review.review_date || '2026-08-24'}</span>
        </div>
        <div className="flex items-center gap-2">
          {review.verified_purchase && (
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-950 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          )}
          <SourceBadge source={review.source} size="small" />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2 flex-1">
        <h4 className="text-xs font-bold text-zinc-950 leading-snug">
          {review.review_title}
        </h4>
        <p className="text-xs text-zinc-600 leading-relaxed">
          {review.review_text}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100">
        <div>{getSentimentBadge(review.sentiment, review.confidence)}</div>

        {review.aspects && review.aspects.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <Tag className="w-3 h-3 text-zinc-400" />
            {review.aspects.map((asp, i) => (
              <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-zinc-700 border-zinc-200 bg-zinc-50">
                {asp}
              </Badge>
            ))}
          </div>
        )}
      </CardFooter>

    </Card>
  );
};
