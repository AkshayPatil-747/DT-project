/**
 * ASIN Extractor Engine
 * Extracts 10-character Amazon Standard Identification Numbers (ASIN)
 * from direct strings or various Amazon URL formats.
 */

export interface ExtractionResult {
  asin: string | null;
  domain: string | null;
  isValid: boolean;
  error?: string;
  sourceType: 'asin_direct' | 'amazon_url' | 'unknown';
}

const ASIN_REGEX = /\b([B0-9][A-Z0-9]{9})\b/i;

const URL_PATTERNS = [
  /\/dp\/([A-Z0-9]{10})/i,
  /\/gp\/product\/([A-Z0-9]{10})/i,
  /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
  /\/product\/([A-Z0-9]{10})/i,
  /\/d\/([A-Z0-9]{10})/i,
  /[?&]asin=([A-Z0-9]{10})/i,
  /[?&]ASIN=([A-Z0-9]{10})/i,
  /\/o\/ASIN\/([A-Z0-9]{10})/i,
  /\/aw\/d\/([A-Z0-9]{10})/i,
];

const SUPPORTED_DOMAINS = [
  'amazon.com',
  'amazon.in',
  'amazon.co.uk',
  'amazon.de',
  'amazon.ca',
  'amazon.fr',
  'amazon.co.jp',
  'amazon.it',
  'amazon.es',
  'amazon.com.au',
  'amazon.com.mx',
  'amzn.to',
  'amzn.in',
  'amzn.eu',
];

/**
 * Clean user input (strip quotes, extra spaces, "ASIN:", etc.)
 */
function sanitizeInput(raw: string): string {
  let s = raw.trim();
  // Strip enclosing quotes or brackets
  s = s.replace(/^["'<\s]+|["'>\s]+$/g, '');
  // Strip prefixes like "asin:" or "asin = "
  s = s.replace(/^asin\s*[:=]\s*/i, '');
  return s.trim();
}

export function extractAsin(input: string): ExtractionResult {
  const trimmed = sanitizeInput(input);

  if (!trimmed) {
    return {
      asin: null,
      domain: null,
      isValid: false,
      error: 'Please provide an Amazon URL or a 10-character ASIN.',
      sourceType: 'unknown',
    };
  }

  // Check if input is a direct 10-character ASIN (case-insensitive)
  if (/^[A-Za-z0-9]{10}$/.test(trimmed)) {
    return {
      asin: trimmed.toUpperCase(),
      domain: 'amazon.in', // Default to amazon.in / auto-detect
      isValid: true,
      sourceType: 'asin_direct',
    };
  }

  // Check if it's a URL
  try {
    let parsedUrl: URL;
    let urlString = trimmed;
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      if (urlString.includes('amazon.') || urlString.includes('amzn.')) {
        urlString = `https://${urlString}`;
      }
    }

    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      parsedUrl = new URL(urlString);
    } else {
      // Fallback search in raw text
      for (const pattern of URL_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match && match[1]) {
          return {
            asin: match[1].toUpperCase(),
            domain: 'amazon.in',
            isValid: true,
            sourceType: 'amazon_url',
          };
        }
      }

      const fallbackMatch = trimmed.match(ASIN_REGEX);
      if (fallbackMatch && fallbackMatch[1]) {
        return {
          asin: fallbackMatch[1].toUpperCase(),
          domain: 'amazon.in',
          isValid: true,
          sourceType: 'asin_direct',
        };
      }

      return {
        asin: null,
        domain: null,
        isValid: false,
        error: 'Invalid input. Please enter a valid 10-character ASIN (e.g., B071Z8M4KX) or a full Amazon product URL.',
        sourceType: 'unknown',
      };
    }

    const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
    const isAmazonDomain = SUPPORTED_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`)
    );

    // Try URL patterns on pathname and search
    const fullPathAndSearch = `${parsedUrl.pathname}${parsedUrl.search}`;
    for (const pattern of URL_PATTERNS) {
      const match = fullPathAndSearch.match(pattern);
      if (match && match[1]) {
        return {
          asin: match[1].toUpperCase(),
          domain: isAmazonDomain ? host : 'amazon.in',
          isValid: true,
          sourceType: 'amazon_url',
        };
      }
    }

    // Try path segments
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i].toLowerCase();
      if (['dp', 'gp', 'product', 'd', 'aw'].includes(seg)) {
        if (segments[i + 1] && /^[A-Za-z0-9]{10}$/.test(segments[i + 1])) {
          return {
            asin: segments[i + 1].toUpperCase(),
            domain: isAmazonDomain ? host : 'amazon.in',
            isValid: true,
            sourceType: 'amazon_url',
          };
        }
      }
    }

    // Direct search for 10-char alphanumeric in pathname
    const embeddedMatch = fullPathAndSearch.match(ASIN_REGEX);
    if (embeddedMatch && embeddedMatch[1]) {
      return {
        asin: embeddedMatch[1].toUpperCase(),
        domain: isAmazonDomain ? host : 'amazon.in',
        isValid: true,
        sourceType: 'amazon_url',
      };
    }

    // If it's a short URL like amzn.in/d/xyz or amzn.to/xyz
    if (host.includes('amzn.')) {
      return {
        asin: null, // needs redirect resolution
        domain: host,
        isValid: true, // mark valid so async resolver can follow
        sourceType: 'amazon_url',
      };
    }

    return {
      asin: null,
      domain: host,
      isValid: false,
      error: 'Could not detect an ASIN in the provided Amazon link. Make sure it points to a specific product page.',
      sourceType: 'amazon_url',
    };
  } catch {
    return {
      asin: null,
      domain: null,
      isValid: false,
      error: 'Failed to parse URL. Please check the format.',
      sourceType: 'unknown',
    };
  }
}

/**
 * Async resolution: Follows redirects for short URLs like amzn.in/d/... or amzn.to/...
 */
export async function resolveAndExtractAsin(input: string): Promise<ExtractionResult> {
  const initial = extractAsin(input);
  if (initial.isValid && initial.asin) {
    return initial;
  }

  const trimmed = sanitizeInput(input);
  if (trimmed.includes('amzn.') || trimmed.includes('amazon.')) {
    try {
      let url = trimmed;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const finalUrl = res.url;
      if (finalUrl && finalUrl !== url) {
        const resolved = extractAsin(finalUrl);
        if (resolved.isValid && resolved.asin) {
          return resolved;
        }
      }
    } catch (e) {
      console.warn('Short URL resolution error:', e);
    }
  }

  return initial;
}
