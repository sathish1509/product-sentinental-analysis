# Real-Time Product Review Scraping and Sentiment Analysis with Offline Fallback

A production-grade, college-level software engineering and data science project that collects product reviews from an external API, performs real-time machine learning sentiment and aspect analysis, and automatically falls back across three data tiers (`live_api` &rarr; `mongodb_cache` &rarr; `offline_dataset`) when external services fail or networks go offline.

---

## 1. Problem Statement & Objective

### Problem Statement
E-commerce platforms and brand managers rely on customer feedback to monitor product quality and customer satisfaction. However, external review APIs and web scrapers frequently suffer from API rate limiting, network timeouts, authentication failures, or downtime. Applications that rely solely on live APIs break down during outages.

### Objective
This project delivers a resilient, high-availability review analytics application that:
1. Scrapes/retrieves product reviews in real-time from external APIs when online.
2. Applies a trained NLP Machine Learning pipeline (TF-IDF + Logistic Regression) to classify sentiment and mine product aspects.
3. Automatically falls back to a MongoDB cache or local offline dataset when external APIs fail or network connectivity is lost.
4. Displays live data source badges (`Live API`, `Cached`, `Offline Dataset`) and interactive analytics charts on a modern React dashboard.

---

## 2. Technology Stack

| Layer | Technology | Key Libraries & Frameworks |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Recharts, Lucide React, Axios, Modern Tailwind-style CSS |
| **Backend** | Node.js + Express.js | Mongoose, CORS, Child Process |
| **Database** | MongoDB | Mongoose ORM |
| **Data & ML** | Python 3 | Pandas, NumPy, Scikit-learn, NLTK, Joblib, Matplotlib |
| **Notebooks** | Jupyter Notebook (`.ipynb`) | 7 Sequential College Presentation Notebooks |

---

## 3. Required Folder Structure

```
f:/Data-Science-Project/
├── frontend/                     # React + Vite + Recharts + CSS
│   ├── src/
│   │   ├── components/           # Navbar, SourceBadge, ReviewCard, AnalyticsCharts, AspectBreakdown, ApiSimulator
│   │   ├── pages/                # Dashboard, Products, ProductDetails, ReviewAnalysis, SentimentAnalytics, AspectAnalysis
│   │   ├── services/             # api.js (Axios HTTP client)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express.js + Mongoose REST API
│   ├── config/                   # db.js (MongoDB connection with graceful fallback)
│   ├── controllers/              # productController.js, reviewController.js, analyticsController.js
│   ├── models/                   # Product.js, Review.js
│   ├── routes/                   # productRoutes.js, reviewRoutes.js, analyticsRoutes.js
│   ├── services/                 # reviewService.js, externalReviewApi.js, sentimentInferenceService.js
│   ├── middleware/               # errorHandler.js
│   ├── predict.py                # Python ML inference bridge
│   ├── server.js
│   └── package.json
│
├── data/                         # Isolated ML/NLP & Dataset Folder
│   ├── raw/
│   │   ├── product_reviews.csv   # Primary CSV review dataset
│   │   └── sample_reviews.json   # Offline fallback JSON dataset
│   ├── processed/
│   │   └── cleaned_reviews.csv   # Sanitized & tokenized dataset
│   ├── models/
│   │   ├── sentiment_model.pkl   # Serialized Logistic Regression model
│   │   └── vectorizer.pkl        # Serialized TF-IDF Vectorizer
│   ├── notebooks/                # 7 Jupyter Notebooks (.ipynb format)
│   │   ├── 01_data_loading.ipynb
│   │   ├── 02_data_cleaning.ipynb
│   │   ├── 03_exploratory_analysis.ipynb
│   │   ├── 04_sentiment_training.ipynb
│   │   ├── 05_model_evaluation.ipynb
│   │   ├── 06_aspect_based_analysis.ipynb
│   │   └── 07_api_data_testing.ipynb
│   ├── train_models.py           # Automated model training script
│   ├── generate_notebooks.py     # Notebook scaffolding script
│   └── README.md
│
├── .env.example
├── README.md
└── docker-compose.yml
```

---

## 4. Architecture & 3-Tier Fallback Mechanism

```
                     User / Browser
                           │
                 ┌─────────┴─────────┐
                 │  React Frontend   │
                 └─────────┬─────────┘
                           │ REST API
                 ┌─────────┴─────────┐
                 │ Express Backend   │
                 └─────────┬─────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │ (Tier 1)        │ (Tier 2)        │ (Tier 3)
         ▼                 ▼                 ▼
 ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐
 │ External     │   │   MongoDB    │   │ Local Dataset   │
 │ Review API   │   │    Cache     │   │ (CSV/JSON File) │
 └───────┬──────┘   └──────┬───────┘   └────────┬────────┘
         │ (Success)       │ (Fallback)         │ (Emergency)
         └─────────────────┼────────────────────┘
                           ▼
            ┌─────────────────────────────┐
            │ Sentiment Inference Bridge  │
            │ (data/models/sentiment.pkl) │
            └──────────────┬──────────────┘
                           ▼
            ┌─────────────────────────────┐
            │  Dashboard & Analytics Data │
            │   (source: live_api |       │
            │    mongodb_cache |          │
            │    offline_dataset)         │
            └─────────────────────────────┘
```

### Fallback Logic Details (`reviewService.js`)
1. **Tier 1 (`live_api`)**: Calls external review API adapter. If successful, normalizes fields, runs sentiment model inference, caches results in MongoDB, and returns with `source: "live_api"`.
2. **Tier 2 (`mongodb_cache`)**: If live API fails (timeout, rate limit, HTTP 500, network error), queries MongoDB for cached reviews of the requested product, returning `source: "mongodb_cache"`.
3. **Tier 3 (`offline_dataset`)**: If MongoDB has no records or MongoDB is unreachable, reads local dataset (`data/raw/sample_reviews.json`), classifies unrated reviews using the ML model, and returns `source: "offline_dataset"`.

---

## 5. Machine Learning Pipeline & Notebooks

All data processing, model training, evaluation, and experimentation reside strictly within `data/notebooks/`:

1. **`01_data_loading.ipynb`**: Data ingestion from CSV/JSON, schema validation, shape inspection, nulls, duplicates.
2. **`02_data_cleaning.ipynb`**: Lowercasing, regex cleaning (HTML/URLs/special characters), tokenization, stopword removal.
3. **`03_exploratory_analysis.ipynb`**: Rating breakdown, sentiment distribution pie charts, word frequencies, Matplotlib plots.
4. **`04_sentiment_training.ipynb`**: TF-IDF feature matrix, train/test split, comparing Logistic Regression vs Naive Bayes vs SVM, saving `sentiment_model.pkl` and `vectorizer.pkl`.
5. **`05_model_evaluation.ipynb`**: Classification reports, confusion matrix heatmaps, misclassification analysis.
6. **`06_aspect_based_analysis.ipynb`**: Keyword sentiment mining for 8 aspects (Price, Quality, Battery, Performance, Delivery, Design, Durability, Customer Service).
7. **`07_api_data_testing.ipynb`**: Simulating external API calls, parsing responses, testing real-time model inference, fallback verification.

---

## 6. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Get list of all monitored catalog products |
| `GET` | `/api/products/:id` | Get detailed metadata for a single product |
| `GET` | `/api/products/simulation-mode` | Get current external API scraper simulation mode |
| `POST` | `/api/products/simulation-mode` | Update API simulation mode (`LIVE_ONLINE`, `API_TIMEOUT`, `RATE_LIMITED`, `SERVER_ERROR`, `NETWORK_OFFLINE`) |
| `GET` | `/api/reviews/products/:id/reviews` | Retrieve product reviews via 3-tier fallback engine |
| `POST` | `/api/reviews/analyze` | Classify raw review text sentiment using trained ML model |
| `GET` | `/api/analytics/global` | Aggregate catalog-wide analytics metrics |
| `GET` | `/api/analytics/products/:id/analytics` | Get sentiment ratio, rating counts, aspect scores for a product |

---

## 7. Installation & Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MongoDB (optional, system falls back to offline dataset if offline)

### Step 1: Install Python Dependencies & Train ML Model
```bash
# Install Python packages
pip install pandas numpy scikit-learn nltk joblib matplotlib

# Execute automated training script to generate pickled model artifacts
python data/train_models.py
```

### Step 2: Setup and Start Backend Server
```bash
cd backend
npm install
npm start
```
The backend REST API starts at `http://localhost:5000`.

### Step 3: Setup and Start Frontend Application
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Step 4: Running Jupyter Notebooks for Presentation
```bash
jupyter notebook data/notebooks/
```

---

## 8. Presentation Demo Guide

During a project demonstration or college presentation:
1. Navigate to the **Dashboard** at `http://localhost:3000`.
2. Observe the **Presentation Demo: Live API Scraper Simulator** widget.
3. Switch between simulation modes (`Live API Online` &rarr; `Simulate API Timeout` &rarr; `Simulate Offline Mode`).
4. Click on any product (e.g. **SonicPro Headphones**) to observe the source badge dynamically change from **Live API** to **Cached (MongoDB)** to **Offline Dataset**.
5. Navigate to the **Review Analysis** page to test live ML sentiment predictions on custom text.

---

## 9. Future Enhancements
- Integration with transformer-based NLP models (BERT / RoBERTa).
- Real-time WebSocket streaming of live retailer reviews.
- Automated web scraping using Playwright/Puppeteer for live Amazon and BestBuy review extraction.
