import { NextRequest, NextResponse } from "next/server";

interface ProductResult {
  title: string;
  price: string;
  url: string;
  platform: string;
  image?: string;
}

const PRINT_KEYWORDS = ["3d printed", "3d print", "printed", "filament", "custom 3d"];

function is3DPrintRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return PRINT_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

// Thingiverse - try to parse their page
async function searchThingiverse(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.thingiverse.com/search/type:things/sort:relevant/page:1/q:${query}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });
    
    const html = await res.text();
    if (html.length < 2000) return [];
    
    const results: ProductResult[] = [];
    
    // Look for thing data in multiple formats
    const patterns = [
      /"name":"([^"]+)"/g,
      /<img[^>]*alt="([^"]*robot[^"]*)"[^>]*>/gi,
      /data-name="([^"]+)"/g,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const title = match[1].replace(/\\u0026/g, "&").slice(0, 100);
        if (title && title.length > 5) {
          results.push({
            title,
            price: "Free",
            url: `https://www.thingiverse.com/search?q=${query}`,
            platform: "thingiverse",
          });
        }
        if (results.length >= 15) break;
      }
      if (results.length >= 15) break;
    }
    
    return results.slice(0, 15);
  } catch (e) {
    console.log("Thingiverse error:", e);
    return [];
  }
}

// Printables - try their old API endpoint
async function searchPrintables(query: string): Promise<ProductResult[]> {
  try {
    // Try the old Printables API endpoint that sometimes works
    const url = `https://www.printables.com/api/front/prints/search/`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword: query,
        page: 1,
        per_page: 20,
      }),
      signal: AbortSignal.timeout(10000),
    });
    
    const data = await res.json();
    
    if (data?.results) {
      return data.results.slice(0, 15).map((p: any) => ({
        title: p.name || p.title || "Unknown",
        price: p.price ? `$${p.price}` : "Free",
        url: p.url || `https://www.printables.com/print/${p.id}`,
        platform: "printables",
        image: p.thumbnail || p.image,
      }));
    }
    return [];
  } catch (e) {
    console.log("Printables error:", e);
    return [];
  }
}

// STL Finder - aggregates 3D print files
async function searchSTLFinder(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.stlfinder.com/api/v1/search/?query=${encodeURIComponent(query + " 3d printed")}&limit=20`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    
    const data = await res.json();
    
    if (data?.models) {
      return data.models.slice(0, 15).map((m: any) => ({
        title: m.name || m.title,
        price: "Free / varies",
        url: m.url || m.view_url,
        platform: "stlfinder",
        image: m.thumb,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

// Yeggi - 3D print search engine
async function searchYeggi(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.yeggi.com/q/${encodeURIComponent(query)}/`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 2000) return [];
    
    const results: ProductResult[] = [];
    const titlePattern = /"name":\s*"([^"]{10,80})"/g;
    let match;
    
    while ((match = titlePattern.exec(html)) !== null) {
      const title = match[1];
      if (title.toLowerCase().includes("3d") || title.toLowerCase().includes("print")) {
        results.push({
          title,
          price: "Varies",
          url: `https://www.yeggi.com/q/${encodeURIComponent(query)}/`,
          platform: "yeggi",
        });
      }
      if (results.length >= 10) break;
    }
    return results;
  } catch {
    return [];
  }
}

// eBay
async function searchEbay(query: string): Promise<ProductResult[]> {
  try {
    const searchQuery = `3d printed ${query}`;
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}`;
    
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 500) return [];
    
    const results: ProductResult[] = [];
    const titlePattern = /<h3[^>]*class="[^"]*s-item__title[^"]*"[^>]*>([^<]+)<\/h3>/g;
    let match: RegExpExecArray | null;
    
    while ((match = titlePattern.exec(html)) !== null) {
      const title = match[1].replace(/<[^>]+>/g, "").trim();
      if (title.length > 10 && is3DPrintRelated(title)) {
        results.push({
          title,
          price: "View on eBay",
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(title)}`,
          platform: "ebay",
        });
      }
      if (results.length >= 10) break;
    }
    return results;
  } catch {
    return [];
  }
}

// Etsy
async function searchEtsy(query: string): Promise<ProductResult[]> {
  try {
    const searchQuery = `3d printed ${query}`;
    const url = `https://www.etsy.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 500) return [];
    
    const results: ProductResult[] = [];
    const titlePattern = /"title":"([^"]{10,120})"/g;
    let match: RegExpExecArray | null;
    
    while ((match = titlePattern.exec(html)) !== null) {
      const title = match[1];
      if (title.toLowerCase().includes("3d") || title.toLowerCase().includes("printed")) {
        results.push({
          title,
          price: "View on Etsy",
          url: `https://www.etsy.com/search?q=${encodeURIComponent(title)}`,
          platform: "etsy",
        });
      }
      if (results.length >= 10) break;
    }
    return results;
  } catch {
    return [];
  }
}

// Keepa (Amazon)
async function searchKeepa(query: string): Promise<ProductResult[]> {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) return [];
  
  try {
    const url = `https://api.keepa.com/search?domain=1&search=${encodeURIComponent(query + " 3d printed")}&items=20&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    
    if (data.products) {
      return data.products
        .filter((p: any) => p.title && is3DPrintRelated(p.title))
        .slice(0, 15)
        .map((p: any) => ({
          title: p.title,
          price: p.price ? `$${(p.price / 100).toFixed(2)}` : "Check Price",
          url: `https://www.amazon.com/dp/${p.asin}`,
          platform: "amazon",
          image: p.image,
        }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const platform = request.nextUrl.searchParams.get("platform") || "all";
  
  if (!query) {
    return NextResponse.json({ results: [], message: "No query provided" });
  }
  
  const allResults: ProductResult[] = [];
  const errors: string[] = [];
  
  // Determine platforms to search
  const platforms = platform === "all" 
    ? ["thingiverse", "printables", "stlfinder", "yeggi", "etsy", "ebay", "amazon"]
    : [platform];
  
  const searchFunctions: Record<string, () => Promise<ProductResult[]>> = {
    thingiverse: () => searchThingiverse(query),
    printables: () => searchPrintables(query),
    stlfinder: () => searchSTLFinder(query),
    yeggi: () => searchYeggi(query),
    etsy: () => searchEtsy(query),
    ebay: () => searchEbay(query),
    amazon: () => searchKeepa(query),
  };
  
  // Search all platforms in parallel
  const promises = platforms
    .filter(p => searchFunctions[p])
    .map(async (p) => {
      try {
        const results = await searchFunctions[p]();
        return { platform: p, results };
      } catch (e) {
        return { platform: p, results: [], error: String(e) };
      }
    });
  
  const results = await Promise.allSettled(promises);
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value.results);
      if (result.value.error) {
        errors.push(`${result.value.platform}: ${result.value.error}`);
      }
    }
  }
  
  // Deduplicate
  const seen = new Set<string>();
  const uniqueResults = allResults.filter(item => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return NextResponse.json({ 
    results: uniqueResults.slice(0, 50),
    count: uniqueResults.length,
    hasAmazonKey: !!process.env.KEEPA_API_KEY,
    errors: errors.length > 0 ? errors : undefined,
  });
}
