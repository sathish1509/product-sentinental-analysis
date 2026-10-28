import os
import sys
import json
from review_provider import ReviewProvider

def run_test(domain: str = "amazon.in", asin: str = "B000PHHY8O"):
    print("=" * 70)
    print("      RAINFOREST API INTEGRATION TEST RUNNER")
    print("=" * 70)
    print(f"[*] Target Amazon Domain : {domain}")
    print(f"[*] Target Product ASIN  : {asin}")
    print("[*] Contacting Rainforest API...")
    print("-" * 70)

    provider = ReviewProvider()
    result = provider.get_amazon_reviews(asin=asin, amazon_domain=domain)

    print(f"\n1. Request Status       : {'SUCCESS' if result.get('success') else 'FAILED'}")
    print(f"2. Product / ASIN       : {result.get('asin')}")
    
    if not result.get("success"):
        print(f"[!] Error               : {result.get('error')}")
        print("=" * 70)
        return

    reviews = result.get("reviews", [])
    print(f"3. Reviews Count        : {result.get('reviews_count', 0)}")
    print("=" * 70)

    if not reviews:
        print("[!] No reviews returned for this product.")
        return

    print("\n4. EXTRACTED & NORMALIZED REVIEWS:\n")
    for idx, rev in enumerate(reviews, 1):
        print(f"--- Review #{idx} ---")
        print(f"  Title            : {rev.get('title')}")
        print(f"  Rating           : {'★' * rev.get('rating', 0)} ({rev.get('rating')}/5)")
        print(f"  Date             : {rev.get('review_date')}")
        print(f"  Verified Purchase: {'Yes' if rev.get('verified_purchase') else 'No'}")
        print(f"  Helpful Votes    : {rev.get('helpful_votes')}")
        print(f"  Country          : {rev.get('review_country')}")
        print(f"  Body             : {rev.get('body')}")
        print()

    print("=" * 70)
    print("[+] Test completed successfully!")

if __name__ == "__main__":
    domain_arg = sys.argv[1] if len(sys.argv) > 1 else "amazon.in"
    asin_arg = sys.argv[2] if len(sys.argv) > 2 else "B000PHHY8O"
    run_test(domain=domain_arg, asin=asin_arg)
