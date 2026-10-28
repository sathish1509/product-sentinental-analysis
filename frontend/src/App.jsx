import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { ReviewAnalysis } from './pages/ReviewAnalysis';
import { SentimentAnalytics } from './pages/SentimentAnalytics';
import { AspectAnalysis } from './pages/AspectAnalysis';
import { ModelEvaluation } from './pages/ModelEvaluation';
import { DataIngestion } from './pages/DataIngestion';
import { BrandIntelligence } from './pages/BrandIntelligence';

export function App() {
  const [activePage, setActivePage] = useState('review-analysis');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} setSelectedProduct={setSelectedProduct} />;
      case 'products':
        return <Products setActivePage={setActivePage} setSelectedProduct={setSelectedProduct} />;
      case 'product-details':
        return <ProductDetails product={selectedProduct} setActivePage={setActivePage} />;
      case 'review-analysis':
        return <ReviewAnalysis />;
      case 'model-evaluation':
        return <ModelEvaluation />;
      case 'data-ingestion':
        return <DataIngestion />;
      case 'brand-intelligence':
        return <BrandIntelligence />;
      case 'sentiment-analytics':
        return <SentimentAnalytics />;
      case 'aspect-analysis':
        return <AspectAnalysis />;
      default:
        return <Dashboard setActivePage={setActivePage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white saas-grid">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6">
        {renderPage()}
      </main>

      <footer className="border-t border-zinc-200/80 bg-white/80 py-6 text-center text-xs text-zinc-500 space-y-1">
        <p className="font-semibold text-zinc-700">Continuous Sentiment Mining & Brand Intelligence Framework</p>
        <p className="text-[11px] text-zinc-400">Enterprise NLP Analytics • React + Node.js + Python Scikit-Learn</p>
      </footer>
    </div>
  );
}

export default App;
