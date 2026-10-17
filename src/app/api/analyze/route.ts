import { NextRequest, NextResponse } from 'next/server';
import { resolveAndExtractAsin } from '@/lib/asinExtractor';
import { MOCK_SCENARIOS, generateDynamicMock } from '@/lib/mockData';
import { analyzeTrust } from '@/lib/trustEngine';
import { scrapeAmazonLive } from '@/lib/liveScraper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query || body.asin;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a valid Amazon product URL or 10-character ASIN.' },
        { status: 400 }
      );
    }

    // Resolve ASIN and domain (handles short URLs and various Amazon country links)
    const extraction = await resolveAndExtractAsin(query);
    if (!extraction.isValid || !extraction.asin) {
      return NextResponse.json(
        {
          error: extraction.error || 'Could not detect an ASIN in the provided Amazon input. Please ensure it is a 10-character ASIN (e.g., B071Z8M4KX) or product page link.',
        },
        { status: 422 }
      );
    }

    const asin = extraction.asin;
    const domain = extraction.domain || 'amazon.in';
    const apiKey = process.env.AMAZON_SCRAPER_API_KEY || process.env.RAINFOREST_API_KEY;

    let isLiveFetch = false;
    let dataSource = 'Pre-Built Demo Preset';
    let scenarioData: any = null;

    // Check if it's one of the 3 pre-built demo scenarios
    const isPresetDemo = ['B08N5WRWNW', 'B09XFAK321', 'B07XYZ9999'].includes(asin);

    if (isPresetDemo && !body.forceLive) {
      scenarioData = MOCK_SCENARIOS[asin];
      dataSource = 'Simulation Preset';
    } else {
      // 1. Attempt API key scraper if user has configured one
      if (apiKey && !body.forceMock) {
        try {
          const liveResponse = await fetch(
            `https://api.rainforestapi.com/request?api_key=${apiKey}&type=product&asin=${asin}&amazon_domain=${domain}`,
            { headers: { 'Accept': 'application/json' }, next: { revalidate: 3600 } }
          );

          if (liveResponse.ok) {
            const liveJson = await liveResponse.json();
            if (liveJson.product) {
              isLiveFetch = true;
              dataSource = 'Rainforest API';
              const p = liveJson.product;
              scenarioData = {
                product: {
                  asin: p.asin || asin,
                  title: p.title || 'Amazon Product',
                  brand: p.brand || 'Amazon Merchant',
                  storefrontBrand: p.brand || 'Amazon Merchant',
                  category: p.categories?.[0]?.name || 'Electronics',
                  price: p.buybox_winner?.price?.value || 49.99,
                  msrp: p.buybox_winner?.rrp?.value || p.buybox_winner?.price?.value || 49.99,
                  discountPercentage: Math.max(0, Math.round((1 - (p.buybox_winner?.price?.value || 49.99) / (p.buybox_winner?.rrp?.value || 59.99)) * 100)),
                  imageUrl: p.main_image?.link || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                  productUrl: p.link || `https://www.${domain}/dp/${asin}`,
                  returnPolicy: p.return_policy || 'Eligible for 30-day replacement/refund',
                  hasOfficialBadge: Boolean(p.is_amazon_choice || p.is_best_seller),
                  listingAgeMonths: 24,
                  ratingAverage: p.rating || 4.2,
                  totalRatingsCount: p.ratings_total || 500,
                },
                seller: {
                  name: p.buybox_winner?.seller?.name || 'Amazon',
                  isFBA: Boolean(p.buybox_winner?.is_fulfilled_by_amazon),
                  isSoldByAmazon: Boolean(p.buybox_winner?.is_amazon_fresh || p.buybox_winner?.seller?.name === 'Amazon.com'),
                  positiveFeedbackRate: p.buybox_winner?.seller?.rating || 95,
                  totalRatings: p.buybox_winner?.seller?.ratings_total || 2500,
                  accountAgeMonths: 36,
                  shipsFrom: p.buybox_winner?.shipping?.raw || 'Amazon Logistics',
                },
                ratingDistribution: {
                  fiveStar: 70,
                  fourStar: 15,
                  threeStar: 8,
                  twoStar: 3,
                  oneStar: 4,
                },
                categoryMarketAverage: 50.00,
                reviews: (p.reviews || []).slice(0, 10).map((r: any, idx: number) => ({
                  id: `live-rev-${idx}`,
                  author: r.profile?.name || `Shopper ${idx + 1}`,
                  rating: r.rating || 5,
                  date: r.date?.utc || new Date().toISOString(),
                  title: r.title || 'Review',
                  content: r.body || '',
                  isVerified: Boolean(r.verified_purchase),
                  helpfulVotes: r.helpful_votes || 0,
                })),
              };
            }
          }
        } catch (apiErr) {
          console.warn('API scraper failed:', apiErr);
        }
      }

      // 2. Direct Live Scraping from Amazon (no API key required)
      if (!scenarioData) {
        try {
          console.log(`Executing direct live scrape for ASIN: ${asin} on domain: ${domain}`);
          let scraped = await scrapeAmazonLive(asin, domain);

          // If domain failed and wasn't amazon.com, try amazon.com
          if (!scraped && domain !== 'amazon.com') {
            console.log(`Retrying live scrape for ASIN: ${asin} on amazon.com`);
            scraped = await scrapeAmazonLive(asin, 'amazon.com');
          }

          if (scraped && scraped.success) {
            isLiveFetch = true;
            dataSource = `Live Amazon Scraper (${scraped.domain})`;
            scenarioData = scraped;
          }
        } catch (scrapeErr: any) {
          console.warn('Direct live scrape error:', scrapeErr.message);
        }
      }

      // 3. High-fidelity dynamic fallback if Amazon blocked request
      if (!scenarioData) {
        scenarioData = generateDynamicMock(asin, query);
        dataSource = 'Adaptive Simulation Engine';
      }
    }

    const analysis = analyzeTrust(
      scenarioData.product,
      scenarioData.seller,
      scenarioData.reviews,
      scenarioData.ratingDistribution,
      scenarioData.categoryMarketAverage,
      !isLiveFetch
    );

    return NextResponse.json({
      success: true,
      asin,
      domain,
      isLiveFetch,
      dataSource,
      hasApiKeyConfigured: Boolean(apiKey),
      data: analysis,
    });
  } catch (error: any) {
    console.error('API analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while evaluating Amazon listing.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const asin = url.searchParams.get('asin');
  const domain = url.searchParams.get('domain') || 'amazon.in';

  if (!asin) {
    return NextResponse.json({ error: 'Please provide ?asin= parameter' }, { status: 400 });
  }

  let isLiveFetch = false;
  let dataSource = 'Simulation Preset';
  let scenarioData: any = MOCK_SCENARIOS[asin];

  if (!scenarioData) {
    const scraped = await scrapeAmazonLive(asin, domain);
    if (scraped && scraped.success) {
      isLiveFetch = true;
      dataSource = `Live Amazon Scraper (${scraped.domain})`;
      scenarioData = scraped;
    } else {
      scenarioData = generateDynamicMock(asin);
      dataSource = 'Adaptive Simulation Engine';
    }
  }

  const analysis = analyzeTrust(
    scenarioData.product,
    scenarioData.seller,
    scenarioData.reviews,
    scenarioData.ratingDistribution,
    scenarioData.categoryMarketAverage,
    !isLiveFetch
  );

  return NextResponse.json({
    success: true,
    asin,
    isLiveFetch,
    dataSource,
    hasApiKeyConfigured: Boolean(process.env.AMAZON_SCRAPER_API_KEY || process.env.RAINFOREST_API_KEY),
    data: analysis,
  });
}
