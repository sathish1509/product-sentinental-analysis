from typing import Dict, List, Any

COUNTRY_MAP = {
    'amazon.in': 'India',
    'amazon.com': 'United States',
    'amazon.co.uk': 'United Kingdom',
    'amazon.de': 'Germany',
    'amazon.ca': 'Canada'
}

def normalize_review(raw_review: Dict[str, Any], asin: str, amazon_domain: str) -> Dict[str, Any]:
    """
    Normalizes a single raw Rainforest review dictionary into standard clean schema.
    """
    country = COUNTRY_MAP.get(amazon_domain.lower(), amazon_domain)
    
    date_info = raw_review.get("date", {})
    review_date = ""
    if isinstance(date_info, dict):
        review_date = date_info.get("utc") or date_info.get("raw") or ""
    elif isinstance(date_info, str):
        review_date = date_info

    helpful = raw_review.get("helpful_votes") or raw_review.get("votes") or 0
    try:
        helpful_votes = int(helpful)
    except (ValueError, TypeError):
        helpful_votes = 0

    rating_raw = raw_review.get("rating", 5)
    try:
        rating = int(rating_raw)
    except (ValueError, TypeError):
        rating = 5

    profile = raw_review.get("profile") or {}
    reviewer = {
        "name": profile.get("name") or "Amazon Customer",
        "id": profile.get("id"),
        "avatar": profile.get("avatar")
    }

    return {
        "review_id": raw_review.get("id") or raw_review.get("review_id") or "",
        "title": raw_review.get("title") or "",
        "body": raw_review.get("body") or raw_review.get("review_text") or "",
        "rating": rating,
        "review_date": review_date,
        "reviewer": reviewer,
        "verified_purchase": bool(raw_review.get("verified_purchase", True)),
        "helpful_votes": helpful_votes,
        "review_country": raw_review.get("country") or country,
        "asin": asin,
        "review_link": raw_review.get("link") or f"https://www.amazon.com/gp/customer-reviews/{raw_review.get('id', '')}",
        "raw_response": raw_review
    }

def normalize_rainforest_response(api_response: Dict[str, Any], asin: str, amazon_domain: str) -> Dict[str, Any]:
    """
    Normalizes complete Rainforest API payload into the clean standard output format.
    """
    if not api_response.get("success"):
        return {
            "success": False,
            "asin": asin,
            "amazon_domain": amazon_domain,
            "error": api_response.get("error", "Unknown API error")
        }

    raw_data = api_response.get("raw_data", {})
    raw_reviews = raw_data.get("reviews", [])

    if not isinstance(raw_reviews, list) or len(raw_reviews) == 0:
        return {
            "success": True,
            "asin": asin,
            "amazon_domain": amazon_domain,
            "reviews_count": 0,
            "message": "No reviews returned for this product.",
            "reviews": []
        }

    normalized_list = [normalize_review(rev, asin, amazon_domain) for rev in raw_reviews]

    return {
        "success": True,
        "asin": asin,
        "amazon_domain": amazon_domain,
        "reviews_count": len(normalized_list),
        "reviews": normalized_list
    }
