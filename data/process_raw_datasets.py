import os
import re
import json
import pandas as pd
import numpy as np

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s.,!\'-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_product_name(name):
    if not isinstance(name, str):
        return "Generic Product"
    name = re.sub(r'[\?\uFFFD]+', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name if name else "Generic Product"

def rating_to_sentiment(rating):
    try:
        r = float(rating)
        if r <= 2:
            return 'negative'
        elif r == 3:
            return 'neutral'
        else:
            return 'positive'
    except:
        return 'neutral'

def infer_flipkart_category(product_name):
    p_lower = str(product_name).lower()
    if any(k in p_lower for k in ['cooler', 'fan', 'iron', 'kettle', 'heater', 'geyser', 'vacuum', 'mixer']):
        return 'Home Appliances'
    elif any(k in p_lower for k in ['phone', 'laptop', 'tablet', 'tv', 'monitor', 'camera']):
        return 'Electronics'
    elif any(k in p_lower for k in ['earphone', 'headphone', 'speaker', 'soundbar', 'buds', 'airpods']):
        return 'Audio & Accessories'
    elif any(k in p_lower for k in ['watch', 'band', 'fitness', 'smartwatch']):
        return 'Wearables'
    else:
        return 'Consumer Goods'

def process_datasets():
    base_dir = os.path.dirname(__file__)
    amz_path = os.path.join(os.path.dirname(base_dir), 'amazon data set', 'Reviews.csv')
    fk_path = os.path.join(os.path.dirname(base_dir), 'flipkart data set', 'Dataset-SA.csv')

    print("[*] Processing Amazon Dataset...")
    df_amz = pd.read_csv(amz_path)
    print(f"[+] Loaded Amazon raw rows: {len(df_amz)}")

    df_amz['review_text'] = df_amz['Text'].apply(clean_text)
    df_amz['review_title'] = df_amz['Summary'].apply(clean_text)
    df_amz['rating'] = pd.to_numeric(df_amz['Score'], errors='coerce').fillna(3).astype(int)
    df_amz['sentiment'] = df_amz['rating'].apply(rating_to_sentiment)
    
    top_amz_products = df_amz['ProductId'].value_counts().head(10).index.tolist()
    product_name_map = {
        top_amz_products[0]: "Vitality Canned Dog Food & Organic Stew",
        top_amz_products[1]: "Jumbo Salted Peanuts & Roasted Snacks",
        top_amz_products[2]: "Turkish Delight Confectionery Candy",
        top_amz_products[3]: "Organic Green Tea & Herbal Infusions",
        top_amz_products[4]: "Gourmet Dark Roast Coffee Beans",
    } if len(top_amz_products) >= 5 else {}

    def get_amz_product_name(pid):
        if pid in product_name_map:
            return product_name_map[pid]
        return f"Amazon Grocery Item ({pid[:8]})"

    df_amz['product_id'] = 'AMZ-' + df_amz['ProductId'].astype(str)
    df_amz['product_name'] = df_amz['ProductId'].apply(get_amz_product_name)
    df_amz['category'] = 'Grocery & Gourmet'
    df_amz['review_date'] = pd.to_datetime(df_amz['Time'], unit='s', errors='coerce').dt.strftime('%Y-%m-%d').fillna('2026-06-01')
    df_amz['verified_purchase'] = True
    df_amz['platform'] = 'Amazon'

    amz_subset = df_amz[['product_id', 'product_name', 'category', 'review_title', 'review_text', 'rating', 'sentiment', 'review_date', 'verified_purchase', 'platform']].copy()
    amz_subset = amz_subset[amz_subset['review_text'].str.len() > 10]

    print("[*] Processing Flipkart Dataset...")
    df_fk = pd.read_csv(fk_path)
    print(f"[+] Loaded Flipkart raw rows: {len(df_fk)}")

    df_fk['rating'] = pd.to_numeric(df_fk['Rate'], errors='coerce')
    df_fk = df_fk.dropna(subset=['rating'])
    df_fk['rating'] = df_fk['rating'].astype(int)

    df_fk['review_text'] = df_fk['Review'].apply(clean_text)
    df_fk['review_title'] = df_fk['Summary'].apply(clean_text)
    mask = df_fk['review_text'].str.len() < 5
    df_fk.loc[mask, 'review_text'] = df_fk.loc[mask, 'review_title']
    df_fk = df_fk[df_fk['review_text'].str.len() > 5]

    df_fk['clean_pname'] = df_fk['product_name'].apply(clean_product_name)
    df_fk['category'] = df_fk['clean_pname'].apply(infer_flipkart_category)
    
    unique_pnames = df_fk['clean_pname'].unique()
    pid_map = {name: f"FK-{idx+101}" for idx, name in enumerate(unique_pnames)}
    df_fk['product_id'] = df_fk['clean_pname'].map(pid_map)
    df_fk['product_name'] = df_fk['clean_pname']

    def map_fk_sentiment(s):
        s_str = str(s).lower()
        if 'pos' in s_str: return 'positive'
        elif 'neg' in s_str: return 'negative'
        else: return 'neutral'

    df_fk['sentiment'] = df_fk['Sentiment'].apply(map_fk_sentiment)
    df_fk['review_date'] = '2026-07-15'
    df_fk['verified_purchase'] = True
    df_fk['platform'] = 'Flipkart'

    fk_subset = df_fk[['product_id', 'product_name', 'category', 'review_title', 'review_text', 'rating', 'sentiment', 'review_date', 'verified_purchase', 'platform']].copy()

    print(f"[+] Cleaned Amazon rows: {len(amz_subset)}")
    print(f"[+] Cleaned Flipkart rows: {len(fk_subset)}")

    combined_all = pd.concat([amz_subset, fk_subset], ignore_index=True)
    
    pos_sample = combined_all[combined_all['sentiment'] == 'positive'].sample(n=20000, random_state=42, replace=False)
    neg_sample = combined_all[combined_all['sentiment'] == 'negative'].sample(n=min(20000, len(combined_all[combined_all['sentiment'] == 'negative'])), random_state=42, replace=False)
    neu_sample = combined_all[combined_all['sentiment'] == 'neutral'].sample(n=min(20000, len(combined_all[combined_all['sentiment'] == 'neutral'])), random_state=42, replace=True)

    df_ml = pd.concat([pos_sample, neg_sample, neu_sample], ignore_index=True).sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    processed_dir = os.path.join(base_dir, 'processed')
    raw_dir = os.path.join(base_dir, 'raw')
    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(raw_dir, exist_ok=True)

    processed_path = os.path.join(processed_dir, 'cleaned_reviews.csv')
    df_ml.to_csv(processed_path, index=False)
    print(f"[+] Saved balanced ML dataset ({len(df_ml)} rows) to: {processed_path}")

    raw_sample = combined_all.sample(n=10000, random_state=42).reset_index(drop=True)
    raw_csv_path = os.path.join(raw_dir, 'product_reviews.csv')
    raw_sample[['product_id', 'product_name', 'category', 'review_title', 'review_text', 'rating', 'review_date', 'verified_purchase']].to_csv(raw_csv_path, index=False)
    print(f"[+] Saved raw product reviews ({len(raw_sample)} rows) to: {raw_csv_path}")

    json_sample = []
    top_pids = raw_sample['product_id'].value_counts().head(10).index.tolist()
    for pid in top_pids:
        rows = raw_sample[raw_sample['product_id'] == pid].head(10)
        for _, row in rows.iterrows():
            json_sample.append({
                "product_id": str(row['product_id']),
                "product_name": str(row['product_name']),
                "category": str(row['category']),
                "review_title": str(row['review_title']),
                "review_text": str(row['review_text']),
                "rating": int(row['rating']),
                "review_date": str(row['review_date']),
                "verified_purchase": bool(row['verified_purchase'])
            })

    json_path = os.path.join(raw_dir, 'sample_reviews.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(json_sample, f, indent=2)
    print(f"[+] Saved offline fallback JSON ({len(json_sample)} reviews) to: {json_path}")

if __name__ == '__main__':
    process_datasets()
