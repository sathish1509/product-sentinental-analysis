import sys
import os
import json
import re
import joblib
import numpy as np

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s.,!\'-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=0)

def extract_aspects(text, rating=None):
    aspect_keywords = {
        'Price': ['price', 'expensive', 'cheap', 'cost', 'worth', 'money', 'value', 'affordable', 'pricing'],
        'Quality': ['quality', 'sound', 'picture', 'display', 'screen', 'audio', 'build', 'premium', 'material'],
        'Battery': ['battery', 'charge', 'charging', 'power', 'drain', 'hours', 'life', 'backup'],
        'Performance': ['fast', 'speed', 'lag', 'processor', 'smooth', 'snappy', 'slow', 'responsive', 'performance'],
        'Delivery': ['delivery', 'shipping', 'package', 'arrived', 'box', 'damaged', 'transit', 'shipped'],
        'Design': ['design', 'cushion', 'strap', 'weight', 'heavy', 'light', 'bright', 'ergonomic', 'look', 'looks'],
        'Durability': ['hinge', 'broke', 'snapped', 'water', 'sensor', 'cracked', 'sturdy', 'durable', 'lasting'],
        'Customer Service': ['support', 'service', 'warranty', 'refund', 'replacement', 'help', 'representative']
    }
    
    cleaned = text.lower()
    found_aspects = []
    for aspect, kws in aspect_keywords.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', cleaned) or kw in cleaned for kw in kws):
            found_aspects.append(aspect)
    return found_aspects

def predict_sentiment(review_text):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, 'data', 'models', 'sentiment_model.pkl')
    vectorizer_path = os.path.join(base_dir, 'data', 'models', 'vectorizer.pkl')

    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        # Heuristic fallback if models missing
        cleaned = clean_text(review_text)
        pos_words = ['great', 'excellent', 'amazing', 'love', 'superb', 'best', 'good', 'fast', 'worth']
        neg_words = ['terrible', 'bad', 'horrible', 'worst', 'broken', 'poor', 'disappointed', 'sucks', 'slow']
        
        pos_count = sum(1 for w in pos_words if w in cleaned)
        neg_count = sum(1 for w in neg_words if w in cleaned)
        
        if pos_count > neg_count:
            sent = 'positive'
            conf = 0.82
        elif neg_count > pos_count:
            sent = 'negative'
            conf = 0.80
        else:
            sent = 'neutral'
            conf = 0.65
        return {
            'sentiment': sent,
            'confidence': conf,
            'aspects': extract_aspects(review_text)
        }

    try:
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)

        cleaned = clean_text(review_text)
        X_vec = vectorizer.transform([cleaned])
        pred_sentiment = str(model.predict(X_vec)[0])
        
        confidence = 0.85
        if hasattr(model, 'predict_proba'):
            probas = model.predict_proba(X_vec)[0]
            confidence = float(max(probas))
        elif hasattr(model, 'decision_function'):
            scores = model.decision_function(X_vec)[0]
            if len(scores.shape) > 0 and len(scores) > 1:
                probs = softmax(scores)
                confidence = float(max(probs))
            else:
                confidence = float(1 / (1 + np.exp(-abs(scores))))

        aspects = extract_aspects(review_text)

        return {
            'sentiment': pred_sentiment,
            'confidence': round(float(confidence), 2),
            'aspects': aspects
        }
    except Exception as e:
        return {
            'sentiment': 'neutral',
            'confidence': 0.50,
            'aspects': extract_aspects(review_text),
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_text = " ".join(sys.argv[1:])
    else:
        input_text = sys.stdin.read()
    
    result = predict_sentiment(input_text)
    print(json.dumps(result))
