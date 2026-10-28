import os
import requests
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, '..', '.env'))
load_dotenv(os.path.join(base_dir, '..', 'backend', '.env'))

RAINFOREST_BASE_URL = "https://api.rainforestapi.com/request"

class RainforestClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("RAINFOREST_API_KEY")
        
    def fetch_reviews(
        self,
        asin: str,
        amazon_domain: str = "amazon.in",
        language: str = "en",
        output: str = "json"
    ) -> Dict[str, Any]:
        """
        Sends request to Rainforest API to retrieve Amazon reviews for a given ASIN.
        """
        if not self.api_key or not self.api_key.strip() or "your_api_key_here" in self.api_key:
            return {
                "success": False,
                "error": "RAINFOREST_API_KEY is not configured in environment variables (.env)."
            }
            
        if not asin or not isinstance(asin, str) or not asin.strip():
            return {
                "success": False,
                "error": "ASIN parameter is required."
            }

        params = {
            "api_key": self.api_key.strip(),
            "type": "reviews",
            "amazon_domain": amazon_domain.strip(),
            "asin": asin.strip(),
            "language": language.strip(),
            "output": output.strip()
        }

        try:
            response = requests.get(RAINFOREST_BASE_URL, params=params, timeout=15)
            
            if response.status_code == 401 or response.status_code == 403:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": "Rainforest API authentication failed. Invalid API key."
                }
            elif response.status_code == 429:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": "Rainforest API rate limit or credit quota exceeded (429 Too Many Requests)."
                }
            elif response.status_code in [400, 404]:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": f"Invalid ASIN ({asin}) or Amazon domain ({amazon_domain})."
                }

            response.raise_for_status()
            data = response.json()

            if data.get("request_info", {}).get("success") is False:
                msg = data.get("request_info", {}).get("message", "Rainforest API request failed.")
                return {
                    "success": False,
                    "error": msg.replace(self.api_key, "[REDACTED_API_KEY]")
                }

            return {
                "success": True,
                "raw_data": data
            }

        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Rainforest API request timed out after 15 seconds."
            }
        except requests.exceptions.RequestException as req_err:
            err_msg = str(req_err)
            if self.api_key in err_msg:
                err_msg = err_msg.replace(self.api_key, "[REDACTED_API_KEY]")
            return {
                "success": False,
                "error": f"Network error while reaching Rainforest API: {err_msg}"
            }
        except Exception as e:
            err_msg = str(e)
            if self.api_key in err_msg:
                err_msg = err_msg.replace(self.api_key, "[REDACTED_API_KEY]")
            return {
                "success": False,
                "error": f"Unexpected error: {err_msg}"
            }
