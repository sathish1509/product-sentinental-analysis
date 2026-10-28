# Data & Machine Learning Pipeline

This folder contains all data engineering, dataset preprocessing, exploratory analysis, model training, evaluation, aspect mining, and API scraping simulations for the **Real-Time Product Review Scraping and Sentiment Analysis with Offline Fallback** project.

## Directory Structure

```
data/
├── raw/
│   ├── product_reviews.csv      # Primary CSV dataset (multi-category product reviews)
│   └── sample_reviews.json      # Offline fallback dataset (JSON format)
├── processed/
│   └── cleaned_reviews.csv      # Sanitized and tokenized review dataset
├── models/
│   ├── sentiment_model.pkl      # Trained Logistic Regression sentiment classifier
│   └── vectorizer.pkl           # TF-IDF Feature Extraction Vectorizer
├── notebooks/
│   ├── 01_data_loading.ipynb    # Ingestion, schema verification, missing data checks
│   ├── 02_data_cleaning.ipynb   # Text normalization, regex cleaning, tokenization
│   ├── 03_exploratory_analysis.ipynb # Visualizing ratings, sentiment balance, categories
│   ├── 04_sentiment_training.ipynb   # TF-IDF vectorization & classifier model comparison
│   ├── 05_model_evaluation.ipynb    # Confusion matrix, classification metrics, error audit
│   ├── 06_aspect_based_analysis.ipynb # Mining product dimensions (Battery, Quality, etc.)
│   └── 07_api_data_testing.ipynb   # External scraper API integration & fallback testing
├── train_models.py              # Automated pipeline execution script
└── generate_notebooks.py        # Jupyter Notebook generator
```

## Running the Pipeline

To execute model training and generate serialized model pickles:

```bash
python data/train_models.py
```

To launch Jupyter Notebook environment for presentation:

```bash
jupyter notebook data/notebooks/
```
