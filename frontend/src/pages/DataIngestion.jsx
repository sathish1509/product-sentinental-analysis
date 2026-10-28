import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Database, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { uploadCSV } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';

export const DataIngestion = () => {
  const [csvText, setCsvText] = useState('');
  const [filename, setFilename] = useState('sample_batch.csv');
  const [appendToDataset, setAppendToDataset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [filterSentiment, setFilterSentiment] = useState('ALL');

  const sampleDatasets = {
    audio: `product_id,product_name,category,review_title,review_text,rating
PROD-101,SonicPro Headphones,Audio,Incredible sound quality,Active noise cancellation blocks all background noise and battery lasts 30 hours,5
PROD-101,SonicPro Headphones,Audio,Ear pads get hot,Sound is good but the synthetic leather cushions cause ear sweating after 2 hours,3
PROD-101,SonicPro Headphones,Audio,Defective headband,Plastic hinge cracked after three weeks of daily office use,1
PROD-101,SonicPro Headphones,Audio,Fast delivery and clean packaging,Arrived on time in sturdy packaging with all accessories included,5`,
    appliances: `product_id,product_name,category,review_title,review_text,rating
FK-101,Candes Personal Air Cooler,Home Appliances,Super fast cooling,Cools a bedroom down within 15 minutes and fan is whisper quiet,5
FK-101,Candes Personal Air Cooler,Home Appliances,Tank capacity too small,Requires water refilling every 5 hours during hot summer nights,3
FK-102,Pigeon Electric Kettle,Home Appliances,Boils in 2 minutes,Great stainless steel build and auto shutoff works reliably,5
FK-102,Pigeon Electric Kettle,Home Appliances,Cord is very short,The power cord is only 2 feet long requiring extension cord,3`,
    smartphones: `product_id,product_name,category,review_title,review_text,rating
PH-901,AeroMax 5G Smartphone,Electronics,Blazing fast processor,120Hz AMOLED screen is gorgeous and apps open instantaneously,5
PH-901,AeroMax 5G Smartphone,Electronics,Average camera performance,Daylight photos look fine but low-light night mode is grainy,3
PH-901,AeroMax 5G Smartphone,Electronics,Battery drain during gaming,Heats up significantly when playing 3D games and drains battery quickly,2
PH-901,AeroMax 5G Smartphone,Electronics,Excellent customer support,Replaced my charger for free within 48 hours without any hassle,5`
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read the selected file. Please ensure it is a valid text or CSV file.');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!csvText.trim()) {
      setError('Please provide or upload CSV content before processing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await uploadCSV(csvText, filename, appendToDataset);
      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || 'Failed to process CSV file.');
      }
    } catch (err) {
      console.error('CSV Ingestion Error:', err);
      setError(err.response?.data?.error || err.message || 'Server error while ingesting CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const allRecords = result?.all_records || [];
  const filteredRecords = allRecords.filter(r => {
    if (filterSentiment === 'ALL') return true;
    return r.sentiment === filterSentiment.toLowerCase();
  });

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        
        {/* Header Banner */}
        <Card className="p-6 border-zinc-200/80 bg-white shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
              <UploadCloud className="w-3.5 h-3.5 text-zinc-900" />
              Data Pipeline Ingestion Engine
            </span>
            <span className="text-xs text-zinc-400">• Automated Preprocessing & Real-Time Sentiment Mining</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
            CSV Dataset Ingestion & Preprocessing
          </h1>
          <p className="text-xs text-zinc-600 max-w-4xl leading-relaxed">
            Upload customer review datasets in CSV format. The ingestion engine automatically validates schemas, cleans noisy text, strips duplicates, extracts domain aspects, and classifies positive, neutral, and negative sentiment using the trained NLP model.
          </p>
        </Card>

        {/* Input / Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Upload & Editor */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <CardTitle className="text-xs font-bold text-zinc-950 flex items-center gap-2 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-zinc-900" />
                  Select or Paste CSV Data
                </CardTitle>

                {/* Pre-load Sample Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-zinc-500 font-medium">Sample Batches:</span>
                  <button
                    type="button"
                    onClick={() => { setCsvText(sampleDatasets.audio); setFilename('audio_reviews.csv'); }}
                    className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[10px] font-semibold text-zinc-900 border border-zinc-200 cursor-pointer transition-colors"
                  >
                    Audio
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCsvText(sampleDatasets.appliances); setFilename('home_appliances.csv'); }}
                    className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[10px] font-semibold text-zinc-900 border border-zinc-200 cursor-pointer transition-colors"
                  >
                    Appliances
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCsvText(sampleDatasets.smartphones); setFilename('smartphone_reviews.csv'); }}
                    className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[10px] font-semibold text-zinc-900 border border-zinc-200 cursor-pointer transition-colors"
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-900 rounded-xl p-6 text-center bg-zinc-50/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-zinc-900" />
                  </div>
                  <p className="text-xs font-bold text-zinc-950">
                    Click to browse or drag & drop a review CSV file
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Supports comma-separated files containing review text and optional star ratings
                  </p>
                  {filename && (
                    <Badge variant="outline" className="font-mono text-[10px] text-zinc-950 bg-white border-zinc-300 mt-2 font-bold">
                      Selected: {filename}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Text Area Manual Inspection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-900">CSV Raw Content Preview</label>
                  <span className="text-[10px] font-mono text-zinc-400">{csvText.split('\n').length} lines</span>
                </div>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="product_id,product_name,category,review_title,review_text,rating&#10;PROD-101,SonicPro,Audio,Great bass,Sound quality is superb and battery lasts long,5"
                  rows={8}
                  className="w-full rounded-xl bg-white border border-zinc-200 p-3 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              {/* Options & Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 select-none">
                  <input
                    type="checkbox"
                    checked={appendToDataset}
                    onChange={(e) => setAppendToDataset(e.target.checked)}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>Append valid reviews to local training dataset</span>
                </label>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !csvText.trim()}
                  className="w-full sm:w-auto bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Processing & Inferring...' : 'Ingest & Classify Reviews'}
                </Button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-zinc-900 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block">Validation Error</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Ingestion Summary Card (Pure Monochrome) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-4 h-full flex flex-col justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-900" />
                  Pipeline Ingestion Metrics
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-1">
                  Validation stats and sentiment breakdown for current batch.
                </p>
              </div>

              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Rows Ingested</span>
                      <span className="font-mono font-bold text-lg text-zinc-950">
                        {result.summary?.valid_reviews_processed}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Duplicates Dropped</span>
                      <span className="font-mono font-bold text-lg text-zinc-700">
                        {result.summary?.duplicates_removed}
                      </span>
                    </div>
                  </div>

                  {/* Sentiment Breakdown */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <span className="text-xs font-bold text-zinc-950 block">Sentiment Classification Split</span>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-950 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> Positive
                        </span>
                        <span className="font-mono font-bold text-zinc-950">
                          {result.summary?.sentiment_distribution?.positive || 0} reviews
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-700 font-semibold flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 text-zinc-600" /> Neutral
                        </span>
                        <span className="font-mono font-bold text-zinc-950">
                          {result.summary?.sentiment_distribution?.neutral || 0} reviews
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-800 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-zinc-800" /> Negative
                        </span>
                        <span className="font-mono font-bold text-zinc-950">
                          {result.summary?.sentiment_distribution?.negative || 0} reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600">
                    Detected headers: <span className="font-mono font-bold text-zinc-950">{result.summary?.detected_columns?.join(', ')}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-xl space-y-2 bg-zinc-50/50">
                  <Database className="w-8 h-8 mx-auto text-zinc-400" />
                  <p>Upload a CSV file or load a sample batch to view ingestion statistics.</p>
                </div>
              )}

              <div className="text-[11px] text-zinc-400 border-t border-zinc-100 pt-3">
                Ingested reviews are normalized into standard schema with NLP tags.
              </div>
            </Card>
          </div>

        </div>

        {/* Processed Reviews Table */}
        {result && (
          <Card className="p-5 border-zinc-200/80 bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <CardTitle className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                  Processed Reviews & Real-Time Inferred Sentiment
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Showing {filteredRecords.length} classified records from batch <span className="text-zinc-950 font-mono font-bold">{filename}</span>
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/80 text-xs">
                {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterSentiment(tab)}
                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                      filterSentiment === tab
                        ? 'bg-zinc-950 text-white shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] bg-zinc-50/70 font-bold">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Review Text</th>
                    <th className="py-2.5 px-3">Sentiment</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Extracted Aspects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRecords.map((rev) => {
                    return (
                      <tr key={rev.review_id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-zinc-950 whitespace-nowrap">
                          <div>{rev.product_name}</div>
                          <span className="text-[10px] text-zinc-400 font-mono">{rev.product_id}</span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-zinc-950 font-mono font-bold">
                          {'★'.repeat(rev.rating)} ({rev.rating}/5)
                        </td>
                        <td className="py-3 px-3 text-zinc-600 max-w-md">
                          <div className="font-bold text-zinc-950 text-xs line-clamp-1">{rev.review_title}</div>
                          <div className="text-zinc-500 text-[11px] line-clamp-2 mt-0.5">{rev.review_text}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge variant={rev.sentiment === 'negative' ? 'default' : 'outline'} className="capitalize font-mono text-[10px] font-bold">
                            {rev.sentiment}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-zinc-950 font-bold">
                          {Math.round((rev.confidence || 0.85) * 100)}%
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {rev.aspects && rev.aspects.length > 0 ? (
                              rev.aspects.map((asp, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono font-semibold"
                                >
                                  {asp}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-400 text-[10px] italic">General</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>
    </TooltipProvider>
  );
};
