import { NextRequest, NextResponse } from "next/server";

interface ProductResult {
  title: string;
  price: string;
  url: string;
  platform: string;
  category?: string;
  image?: string;
}

const PRINT_KEYWORDS = ["3d printed", "3d print", "printed", "filament", "custom 3d"];

function is3DPrintRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return PRINT_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

// Facebook Marketplace
async function searchFacebookMarketplace(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(query)}%203d%20printed`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 1000) return [];
    
    const results: ProductResult[] = [];
    
    // Facebook renders content dynamically - look for JSON data in script tags
    const scriptPattern = /"marketplace_search_feed":\s*({[\s\S]*?})\s*[,\n]/g;
    let match;
    
    while ((match = scriptPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const items = data?.edges || data?.results || [];
        
        for (const item of items.slice(0, 10)) {
          const node = item?.node || item;
          const title = node?.listing?.title || node?.title || "";
          const price = node?.listing?.price?.amount || node?.price || "";
          
          if (title && is3DPrintRelated(title)) {
            results.push({
              title,
              price: price ? `$${parseFloat(price).toFixed(2)}` : "Contact for price",
              url: node?.listing?.url || `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(title)}`,
              platform: "facebook",
              image: node?.listing?.image?.url || node?.image,
            });
          }
        }
      } catch {}
      if (results.length >= 10) break;
    }
    
    // Alternative: look for any product data
    if (results.length === 0) {
      const jsonPattern = /"text":\s*"([^"]{10,100}3d[^"]{0,50})"/g;
      while ((match = jsonPattern.exec(html)) !== null) {
        const title = match[1].replace(/\\u0026/g, "&");
        if (title.length > 15 && is3DPrintRelated(title)) {
          results.push({
            title,
            price: "Contact for price",
            url: `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(title)}`,
            platform: "facebook",
          });
        }
        if (results.length >= 10) break;
      }
    }
    
    return results;
  } catch (e) {
    console.log("Facebook error:", e);
    return [];
  }
}

// Shopify stores (general search via Google cached results)
async function searchShopify(query: string): Promise<ProductResult[]> {
  try {
    // Use Google custom search to find Shopify stores
    const url = `https://www.google.com/search?q=${encodeURIComponent(query + " 3d printed site:shopify.com")}&num=20`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    
    const html = await res.text();
    if (html.length < 500) return [];
    
    const results: ProductResult[] = [];
    
    // Extract Shopify store URLs
    const urlPattern = /https:\/\/[^/]*\.myshopify\.com[^\s"<>]*/g;
    let match;
    const shopifyUrls = new Set<string>();
    
    while ((match = urlPattern.exec(html)) !== null) {
      const storeUrl = match[0].split("?")[0];
      if (!shopifyUrls.has(storeUrl) && shopifyUrls.size < 5) {
        shopifyUrls.add(storeUrl);
      }
    }
    
    // Visit each Shopify store and search
    for (const storeUrl of shopifyUrls) {
      try {
        const storeRes = await fetch(storeUrl + "/search?q=3d+printed", {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(5000),
        });
        
        const storeHtml = await storeRes.text();
        
        // Extract product titles
        const titlePattern = /"title":\s*"([^"]{10,80})"/g;
        let titleMatch;
        
        while ((titleMatch = titlePattern.exec(storeHtml)) !== null) {
          const title = titleMatch[1].replace(/\\u0026/g, "&");
          if (is3DPrintRelated(title)) {
            results.push({
              title,
              price: "Visit store",
              url: storeUrl + "/search?q=3d+printed",
              platform: "shopify",
              image: undefined,
            });
          }
          if (results.length >= 15) break;
        }
        
        if (results.length >= 15) break;
      } catch {}
    }
    
    return results;
  } catch (e) {
    console.log("Shopify search error:", e);
    return [];
  }
}

// Thingiverse (popular 3D print files)
async function searchThingiverse(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.thingiverse.com/search?type=items&sort=relevant&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 500) return [];
    
    const results: ProductResult[] = [];
    
    // Thingiverse JSON data
    const dataPattern = /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/;
    const dataMatch = html.match(dataPattern);
    
    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);
        const items = data?.searchResults?.hits?.hits || [];
        
        for (const item of items.slice(0, 15)) {
          const title = item?._source?.name || item?.name || "";
          if (title && is3DPrintRelated(title)) {
            results.push({
              title,
              price: "Free (download)",
              url: item?._source?.public_url || item?.url || "",
              platform: "thingiverse",
              image: item?._source?.thumbnail || item?.thumbnail,
            });
          }
        }
      } catch {}
    }
    
    return results;
  } catch {
    return [];
  }
}

// Printables (Prusa's 3D print site)
async function searchPrintables(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.printables.com/search/models?keyword=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 500) return [];
    
    const results: ProductResult[] = [];
    
    // Extract JSON data
    const jsonPattern = /"name":\s*"([^"]{5,80})"[^}]*?"url":\s*"([^"]+)"/g;
    let match;
    
    while ((match = jsonPattern.exec(html)) !== null) {
      const title = match[1];
      const url = "https://www.printables.com" + match[2];
      
      if (title && is3DPrintRelated(title)) {
        results.push({
          title,
          price: "Free (download)",
          url,
          platform: "printables",
        });
      }
      if (results.length >= 15) break;
    }
    
    return results;
  } catch {
    return [];
  }
}

// eBay (existing)
async function searchEbay(query: string): Promise<ProductResult[]> {
  try {
    const searchQuery = `3d printed ${query}`;
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}`;
    
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
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

// Etsy (existing)
async function searchEtsy(query: string): Promise<ProductResult[]> {
  try {
    const searchQuery = `3d printed ${query}`;
    const url = `https://www.etsy.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
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

// Keepa API for Amazon
async function searchKeepa(query: string): Promise<ProductResult[]> {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) return [];
  
  try {
    const searchQuery = `${query} 3d printed`;
    const url = `https://api.keepa.com/search?domain=1&search=${encodeURIComponent(searchQuery)}&items=20&key=${apiKey}`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    
    if (data.products) {
      return data.products
        .filter((p: any) => p.title && is3DPrintRelated(p.title))
        .slice(0, 15)
        .map((p: any) => ({
          title: p.title || "Unknown",
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
  
  // Determine which platforms to search
  const platforms = platform === "all" 
    ? ["thingiverse", "printables", "etsy", "ebay", "facebook", "shopify", "amazon"]
    : [platform];
  
  const promises = [];
  
  if (platforms.includes("amazon")) {
    promises.push(searchKeepa(query));
  }
  if (platforms.includes("ebay")) {
    promises.push(searchEbay(query));
  }
  if (platforms.includes("etsy")) {
    promises.push(searchEtsy(query));
  }
  if (platforms.includes("facebook")) {
    promises.push(searchFacebookMarketplace(query));
  }
  if (platforms.includes("shopify")) {
    promises.push(searchShopify(query));
  }
  if (platforms.includes("thingiverse")) {
    promises.push(searchThingiverse(query));
  }
  if (platforms.includes("printables")) {
    promises.push(searchPrintables(query));
  }
  
  const results = await Promise.allSettled(promises);
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
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
    platforms: platforms,
  });
}
