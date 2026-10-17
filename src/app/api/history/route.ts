import { NextRequest, NextResponse } from 'next/server';
import { HistoryItem } from '@/types/trust';

// In-memory persistent history during server lifecycle
let historyStore: HistoryItem[] = [
  {
    id: 'hist-1',
    asin: 'B08N5WRWNW',
    productTitle: 'Sony WH-1000XM4 Wireless Industry Leading Noise Canceling Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    price: 278.00,
    overallScore: 88,
    riskLevel: 'Safe',
    analyzedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    sellerName: 'Amazon.com',
  },
  {
    id: 'hist-2',
    asin: 'B09XFAK321',
    productTitle: 'Ultra Pro Wireless Earbuds Bluetooth 5.3 Waterproof HiFi Bass Stereo Sport',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    price: 18.99,
    overallScore: 42,
    riskLevel: 'High Risk',
    analyzedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    sellerName: 'Shenzhen Lingrui Direct',
  },
  {
    id: 'hist-3',
    asin: 'B07XYZ9999',
    productTitle: 'Pro Bass Studio In-Ear Pods with Active Noise Isolation and Wireless Charging',
    productImage: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80',
    price: 29.99,
    overallScore: 56,
    riskLevel: 'Moderate Risk',
    analyzedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    sellerName: 'SoundWave Ventures',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    history: historyStore,
  });
}

export async function POST(req: NextRequest) {
  try {
    const item: HistoryItem = await req.json();
    if (!item.asin || !item.productTitle) {
      return NextResponse.json({ error: 'Invalid history item payload' }, { status: 400 });
    }

    // Deduplicate if already exists, move to top
    historyStore = [
      item,
      ...historyStore.filter((h) => h.asin !== item.asin),
    ].slice(0, 30); // keep up to 30 items

    return NextResponse.json({
      success: true,
      history: historyStore,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to record history item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const all = url.searchParams.get('all');

  if (all === 'true') {
    historyStore = [];
    return NextResponse.json({ success: true, history: [] });
  }

  if (id) {
    historyStore = historyStore.filter((h) => h.id !== id && h.asin !== id);
    return NextResponse.json({ success: true, history: historyStore });
  }

  return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
}
