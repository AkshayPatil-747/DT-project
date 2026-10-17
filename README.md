# Amazon Product Trust Checker 🛡️

A full-stack, responsive web application that evaluates Amazon product listings, seller reliability, and customer reviews to compute a transparent, mathematical **"Trust & Risk Score" (0–100)** before purchase.

Designed to defend consumers against sophisticated e-commerce fraud tactics including:
- **Review Hijacking**: Unscrupulous sellers reusing dormant product listings (e.g. bedsheets or charging cables) to disguise cheap electronics with thousands of inherited 5-star ratings.
- **Coordinated Review Bursts**: Fraudulent review spikes where >35% of 5-star ratings are flooded within a single 72-hour window.
- **Unverified Buyer Rings & Bot Phrasing**: Template reviews with repeated generic phrasing and low verified purchase ratios.
- **Untrusted Merchant Accounts**: Newly minted storefronts shipping via third-party channels with poor feedback history.
- **Extreme Price Anomalies**: Fabricated MSRPs claiming >75% discounts without verified deal badges.

---

## 📐 Mathematical Trust Formula

The application calculates a transparent composite trust index based on three weighted pillars:

$$\text{Total Trust Score} = (0.45 \times \text{ReviewScore}) + (0.35 \times \text{SellerScore}) + (0.20 \times \text{ProductScore})$$

### 1. Review Authenticity Score (45% Weight)
- **Verified Purchase Ratio**: Calculates $(\text{verified\_reviews} / \text{total\_reviews}) \times 100$. Penalized if ratio $< 70\%$.
- **Review Burst Detection**: Deducts **20 points** if $> 35\%$ of 5-star reviews were posted within a single 72-hour window.
- **Text Repetition / Generic Phrasing**: Scans for short boilerplate phrases (*"great product"*, *"fast shipping"*, *"good item"*, *"loved it"*) repeated across buyer accounts.
- **Listing Hijacking Detection**: Cross-references product title tokens with older review keywords. If reviews describe incompatible categories (e.g. bedsheets for wireless earbuds), score drops by **30 points**.
- **Bimodal Polarization Penalty**: Flags products with steep peaks at 5-star and 1-star ratings with negligible 2–4 star middle distribution (**-15 points**).

### 2. Seller Reliability Score (35% Weight)
- **Fulfillment Channel (up to 30 pts)**:
  - Sold & Shipped by Amazon or Fulfilled by Amazon (FBA): **+30 pts**
  - Third-party merchant fulfillment (FBM): **+5 pts**
- **12-Month Feedback Rating (up to 40 pts)**:
  - $> 92\%$ Positive: **+40 pts**
  - $80\% - 91\%$ Positive: **+20 pts**
  - $< 80\%$ Positive: **0 pts**
- **Seller Maturity (up to 30 pts)**:
  - Established merchant ($> 100$ ratings): **+30 pts**
  - Intermediate ($15 - 100$ ratings): **+15 pts**
  - New storefront ($< 15$ ratings): **5 pts max**

### 3. Product Integrity Score (20% Weight)
- **Brand Matching (50 pts)**: Brand in product title matches registered storefront name.
- **Return Policy (50 pts)**: Standard Amazon 30-day money-back guarantee.
- **Price Sanity Penalty (-25 pts)**: Discount $> 75\%$ off MSRP without an official Amazon deal badge.

---

## 🚦 Risk Classification Tiers

| Score Range | Risk Level | Visual Badge | Guidance |
| :--- | :--- | :--- | :--- |
| **80 – 100** | **Safe** | 🟢 Verified & Highly Reliable | Meets all organic criteria, safe to buy. |
| **55 – 79** | **Moderate Risk** | 🟡 Exercise Caution | Inspect 1-star reviews and fulfillment type. |
| **0 – 54** | **High Risk** | 🔴 High Caution Advised | Suspected hijacked listing or review fraud. |

---

## 🎯 Pre-built Realistic Demos

Click any demo button in the navigation bar to immediately inspect complete scenario data:

1. **Safe Product** (`ASIN: B08N5WRWNW`):
   - *Title*: Sony WH-1000XM4 Wireless Premium Headphones
   - *Score*: **88/100 (Safe / Emerald)**
   - *Characteristics*: Official Sony brand, Sold & Shipped by Amazon, 94% verified purchase ratio, natural review distribution over 4 years.
2. **Hijacked Listing** (`ASIN: B09XFAK321`):
   - *Title*: Ultra Pro Wireless Earbuds Bluetooth 5.3
   - *Score*: **42/100 (High Risk / Rose)**
   - *Characteristics*: Title is earbuds, but older reviews praise Egyptian cotton bedsheets and micro-USB cables. Slashed from $149.99 to $18.99 (87% fake discount). Unestablished 3rd-party seller.
3. **Fake Review Spike** (`ASIN: B07XYZ9999`):
   - *Title*: Pro Bass Studio In-Ear Pods
   - *Score*: **56/100 (Moderate Risk / Amber)**
   - *Characteristics*: 48% of 5-star reviews posted in a 48-hour spike, repeated boilerplate phrases, low verified purchase ratio.

---

## 🛠️ Tech Stack & Key Files

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Dark Theme Palette (Slate / Emerald / Amber / Rose)
- **Icons**: Lucide React
- **Celebration / Feedback**: Canvas Confetti
- **Key Modules**:
  - `src/lib/trustEngine.ts`: Core mathematical analysis and scoring rules.
  - `src/lib/asinExtractor.ts`: Multi-domain URL and ASIN parser.
  - `src/lib/mockData.ts`: Rich mock scenarios and dynamic mock generator.
  - `src/app/api/analyze/route.ts`: Evaluation API endpoint with live scraper support and seamless offline fallback.
  - `src/app/api/history/route.ts`: History persistence API endpoint.
  - `src/components/TrustGauge.tsx`: SVG arc trust gauge with animated count-up.
  - `src/components/BreakdownCard.tsx`: 3 detailed score cards with academic formula tooltips.
  - `src/components/ReviewExplorer.tsx`: Review audit inspector with highlighted hijacked keywords.
  - `src/components/HistoryDrawer.tsx`: History drawer with saved scans and comparison jump.
  - `src/components/FormulaModal.tsx`: Formula explanation modal for academic review.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Or build and run production server
npm run build
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Optional: Live Amazon Scraper Integration
To enable live scraping against live Amazon product pages, create a `.env.local` file:
```env
AMAZON_SCRAPER_API_KEY=your_rainforest_or_scraperapi_key_here
```
If this key is omitted or hits rate limits, the app seamlessly uses the offline simulation engine.
