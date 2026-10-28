from typing import Dict, Any, Optional
from rainforest_client import RainforestClient
from review_normalizer import normalize_rainforest_response

class ReviewProvider:
    def __init__(self, api_key: Optional[str] = None):
        self.client = RainforestClient(api_key=api_key)
        
    def get_amazon_reviews(
        self,
        asin: str,
        amazon_domain: str = "amazon.in",
        language: str = "en",
        output: str = "json"
    ) -> Dict[str, Any]:
        """
        Retrieves Amazon product reviews via Rainforest API and returns normalized response.
        """
        raw_res = self.client.fetch_reviews(
            asin=asin,
            amazon_domain=amazon_domain,
            language=language,
            output=output
        )
        return normalize_rainforest_response(raw_res, asin=asin, amazon_domain=amazon_domain)
