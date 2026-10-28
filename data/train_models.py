import os
import re
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix
)

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s.,!\'-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def rating_to_sentiment(r):
    try:
        val = float(r)
        if val <= 2:
            return 'negative'
        elif val == 3:
            return 'neutral'
        else:
            return 'positive'
    except (ValueError, TypeError):
        return 'neutral'

def train_pipeline():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, 'processed', 'cleaned_reviews.csv')
    raw_path = os.path.join(base_dir, 'raw', 'product_reviews.csv')
    models_dir = os.path.join(base_dir, 'models')

    os.makedirs(models_dir, exist_ok=True)

    if os.path.exists(processed_path):
        print(f"[*] Loading processed dataset from: {processed_path}")
        df = pd.read_csv(processed_path)
    else:
        print(f"[*] Loading raw dataset from: {raw_path}")
        df = pd.read_csv(raw_path)

    print(f"[+] Loaded {len(df)} total reviews.")

    # 1. Clean and prepare text
    if 'cleaned_text' not in df.columns or df['cleaned_text'].isnull().sum() > 0:
        df['full_review'] = df.get('review_title', '').fillna('') + " " + df.get('review_text', '').fillna('')
        df['cleaned_text'] = df['full_review'].apply(clean_text)
    else:
        df['cleaned_text'] = df['cleaned_text'].astype(str).apply(clean_text)

    # 2. Assign sentiment targets from ratings if not present
    if 'sentiment' not in df.columns:
        df['sentiment'] = df['rating'].apply(rating_to_sentiment)

    df = df.dropna(subset=['sentiment', 'cleaned_text'])
    df = df[df['cleaned_text'].str.len() > 3].reset_index(drop=True)

    class_counts = df['sentiment'].value_counts().to_dict()
    print(f"[*] Total Valid Dataset: {len(df)} rows")
    print(f"[*] Class Breakdown: {class_counts}")

    X = df['cleaned_text']
    y = df['sentiment']

    # 3. Train-Test Split BEFORE feature extraction to eliminate Data Leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[*] Data split completed: {len(X_train)} training, {len(X_test)} testing (Stratified)")

    # 4. Feature Extraction: Fit vectorizer strictly on X_train only
    print("[*] Fitting TF-IDF Vectorizer on X_train (max_features=5000, ngrams=(1,2), stop_words='english')...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words='english',
        min_df=2,
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    print(f"[+] Vectorizer vocabulary size: {len(vectorizer.vocabulary_)} features")

    # 5. Model Comparison with Class Imbalance Weighting
    models = {
        'Logistic Regression': LogisticRegression(
            C=2.0,
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        ),
        'Multinomial Naive Bayes': MultinomialNB(alpha=0.3),
        'Linear SVC': LinearSVC(
            C=1.0,
            class_weight='balanced',
            random_state=42,
            max_iter=2000
        )
    }

    results = {}
    best_model = None
    best_model_name = None
    best_f1 = 0.0

    target_labels = ['negative', 'neutral', 'positive']

    for name, clf in models.items():
        print(f"\n==========================================")
        print(f"   Training {name}")
        print(f"==========================================")
        clf.fit(X_train_vec, y_train)
        y_pred = clf.predict(X_test_vec)

        acc = accuracy_score(y_test, y_pred)
        precision, recall, f1, support = precision_recall_fscore_support(
            y_test, y_pred, labels=target_labels, zero_division=0
        )
        macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average='macro', zero_division=0
        )
        weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average='weighted', zero_division=0
        )

        cm = confusion_matrix(y_test, y_pred, labels=target_labels).tolist()

        per_class = {}
        for idx, lbl in enumerate(target_labels):
            per_class[lbl] = {
                'precision': round(float(precision[idx]), 4),
                'recall': round(float(recall[idx]), 4),
                'f1_score': round(float(f1[idx]), 4),
                'support': int(support[idx])
            }

        results[name] = {
            'accuracy': round(float(acc), 4),
            'macro_precision': round(float(macro_p), 4),
            'macro_recall': round(float(macro_r), 4),
            'macro_f1': round(float(macro_f1), 4),
            'weighted_f1': round(float(weighted_f1), 4),
            'per_class': per_class,
            'confusion_matrix': cm
        }

        print(f"[+] {name} Accuracy: {acc * 100:.2f}%, Macro F1: {macro_f1:.4f}")
        print(classification_report(y_test, y_pred, target_names=target_labels, zero_division=0))

        # We select best model based on macro F1 to ensure neutral & negative aren't ignored
        if macro_f1 > best_f1:
            best_f1 = macro_f1
            best_model = clf
            best_model_name = name

    print(f"\n[*] Best Model Selected: {best_model_name} (Macro F1 = {best_f1:.4f})")

    # 6. Serialize Model Artifacts
    model_path = os.path.join(models_dir, 'sentiment_model.pkl')
    vectorizer_path = os.path.join(models_dir, 'vectorizer.pkl')
    metrics_path = os.path.join(models_dir, 'evaluation_metrics.json')

    joblib.dump(best_model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    metrics_payload = {
        'best_model': best_model_name,
        'dataset': {
            'total_samples': len(df),
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'class_distribution': class_counts
        },
        'feature_extraction': {
            'method': 'TF-IDF Vectorizer',
            'max_features': len(vectorizer.vocabulary_),
            'ngram_range': [1, 2],
            'sublinear_tf': True,
            'data_leakage_mitigated': True
        },
        'labels': target_labels,
        'model_comparison': results,
        'best_model_metrics': results[best_model_name]
    }

    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"\n[+] Successfully saved serialized model to: {model_path}")
    print(f"[+] Successfully saved vectorizer to: {vectorizer_path}")
    print(f"[+] Successfully saved verified evaluation metrics to: {metrics_path}")

if __name__ == '__main__':
    train_pipeline()
