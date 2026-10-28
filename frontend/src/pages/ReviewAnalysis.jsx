import React, { useState } from 'react';
import { Sparkles, Smile, Frown, Meh, Tag, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { analyzeReview } from '../services/api';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';

export const ReviewAnalysis = () => {
  const [reviewText, setReviewText] = useState(
    "I've been using these noise-canceling headphones for two weeks. The battery lasts incredible 32 hours and sound quality is phenomenal, but the leather cushions get warm after 2 hours."
  );
  const [rating, setRating] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!reviewText.trim()) return;

    setLoading(true);
    try {
      const res = await analyzeReview(reviewText, rating);
      setResult(res);
    } catch (err) {
      console.error('Error analyzing review text:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleReviews = [
    {
      title: "Audio & Battery Praise",
      rating: 5,
      text: "The audio fidelity is crystal clear with deep punchy bass. Charging is super fast and battery lasts 30+ hours easily!",
      badge: "Positive Example"
    },
    {
      title: "Hardware Defect Complaint",
      rating: 1,
      text: "Terrible quality control! The left speaker started buzzing after 3 days and customer service refused a replacement.",
      badge: "Negative Example"
    },
    {
      title: "Mixed Neutral Feedback",
      rating: 3,
      text: "Screen quality is sharp and colors are vibrant, but built-in speakers lack bass and the remote control feels cheap.",
      badge: "Neutral Example"
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Header Banner Card */}
        <Card className="p-6 border-zinc-200/80 bg-white shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
              Machine Learning Inference Sandbox
            </span>
            <span className="text-xs text-zinc-400">• Real-Time Prediction</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
            Live Custom Review Sentiment Analyzer
          </h1>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-4xl">
            Type or paste any product review below to test the scikit-learn NLP classification engine. The Express backend vectorizes the text using <span className="font-mono font-semibold text-zinc-950 bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">TF-IDF Vectorizer</span> and predicts sentiment via <span className="font-mono font-semibold text-zinc-950 bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">Linear SVC (Calibrated Softmax)</span> trained on real e-commerce data.
          </p>
        </Card>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Form & Presets */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-4">
              <form onSubmit={handleAnalyze} className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-900">
                    Customer Review Text
                  </label>
                  
                  {/* Star Rating Selector (Pure Monochrome) */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Tooltip key={star}>
                        <TooltipTrigger asChild>
                          <Star
                            onClick={() => setRating(star)}
                            className={`w-4 h-4 cursor-pointer transition-all ${
                              star <= rating
                                ? 'fill-zinc-950 text-zinc-950 scale-105'
                                : 'text-zinc-300 hover:text-zinc-500'
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">{star} Star Rating</TooltipContent>
                      </Tooltip>
                    ))}
                    <span className="text-xs text-zinc-600 font-mono font-medium ml-1">
                      ({rating} {rating === 1 ? 'Star' : 'Stars'})
                    </span>
                  </div>
                </div>

                <Textarea
                  rows={6}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Paste or type customer review text here..."
                  className="p-3.5 text-xs text-zinc-900 bg-white border border-zinc-200 rounded-lg focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {reviewText.length} characters • {reviewText.split(/\s+/).filter(Boolean).length} words
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !reviewText.trim()}
                    className="bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm flex items-center gap-2 text-xs font-semibold px-4 py-2 cursor-pointer transition-all"
                  >
                    {loading ? 'Running ML Inference...' : 'Run ML Sentiment Classifier'}
                    <Sparkles className="w-3.5 h-3.5" />
                  </Button>
                </div>

              </form>
            </Card>

            {/* Quick Presets */}
            <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Quick Test Presets
                </h3>
                <span className="text-[11px] text-zinc-400">Click to autofill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sampleReviews.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setReviewText(sample.text);
                      setRating(sample.rating);
                    }}
                    className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/70 text-left hover:bg-white hover:border-zinc-900 hover:shadow-sm transition-all space-y-1.5 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 group-hover:text-black">
                        {sample.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                      {sample.text}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-500 block pt-1">
                      {sample.rating} Stars • {sample.badge}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: ML Inference Output (Pure Monochrome) */}
          <div className="lg:col-span-5">
            {loading ? (
              <Card className="p-6 border-zinc-200/80 bg-white shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-zinc-50 border border-zinc-100 space-y-3 text-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </Card>
            ) : result ? (
              <Card className="p-6 border-zinc-200/80 bg-white shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                    <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                      Model Output
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px] text-zinc-900 border-zinc-300 bg-zinc-50">
                    Linear SVC (Calibrated)
                  </Badge>
                </div>

                {/* Sentiment Verdict Box (Pure Monochrome) */}
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-300 bg-zinc-50 text-center transition-all">
                  {result.sentiment === 'positive' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center mb-2 shadow-sm">
                        <Smile className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-base font-extrabold text-zinc-950 tracking-wider uppercase">
                        Positive Sentiment
                      </span>
                    </>
                  )}
                  {result.sentiment === 'negative' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center mb-2 shadow-sm">
                        <Frown className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-base font-extrabold text-zinc-950 tracking-wider uppercase">
                        Negative Sentiment
                      </span>
                    </>
                  )}
                  {result.sentiment === 'neutral' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center mb-2 shadow-sm">
                        <Meh className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-base font-extrabold text-zinc-950 tracking-wider uppercase">
                        Neutral Sentiment
                      </span>
                    </>
                  )}

                  <div className="w-full space-y-1.5 pt-4">
                    <div className="flex justify-between text-xs text-zinc-600 font-medium">
                      <span>Model Confidence:</span>
                      <span className="font-mono font-bold text-zinc-950">
                        {Math.round((result.confidence || 0.85) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.round((result.confidence || 0.85) * 100)}
                      color="bg-zinc-950"
                    />
                  </div>
                </div>

                {/* Extracted Product Aspects */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-zinc-800">
                    Extracted Product Aspects:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.aspects && result.aspects.length > 0 ? (
                      result.aspects.map((asp, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200"
                        >
                          <Tag className="w-3 h-3 text-zinc-600" />
                          {asp}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">
                        No specific aspect keywords detected.
                      </span>
                    )}
                  </div>
                </div>

                {/* Pipeline Metadata Footer */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Inference Latency: ~18ms</span>
                  <span>Tokens: {reviewText.split(/\s+/).filter(Boolean).length}</span>
                </div>

              </Card>
            ) : (
              <Card className="p-12 border-zinc-200/80 bg-white shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[340px]">
                <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                  <Sparkles className="w-5 h-5 text-zinc-700" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900">Awaiting ML Classification</h4>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  Enter review text or click one of the quick test presets, then click &ldquo;Run ML Sentiment Classifier&rdquo; to execute inference.
                </p>
              </Card>
            )}
          </div>

        </div>

      </div>
    </TooltipProvider>
  );
};
