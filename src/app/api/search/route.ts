import { NextRequest, NextResponse } from "next/server";

// 3D printing related keywords to filter results
const PRINT_KEYWORDS = [
  "3d", "printed", "printing", "filament", "pla", "abs", "petg", 
  "model", "stl", "printer", "nozzle", "bed", "resin", "sla",
  "robot", "case", "holder", "mount", "bracket", "gear", "vent",
  "custom", "定制", "printed", "impression", "3d打印"
];

function is3DPrintRelated(title: string, query: string): boolean {
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (lowerTitle.includes(lowerQuery)) return true;
  
  return PRINT_KEYWORDS.some(keyword => lowerTitle.includes(keyword.toLowerCase()));
}

function generateMockResults(query: string, platform: string): any[] {
  const mockProducts = [
    { name: `${query} 3D Printed Robot Case`, price: 24.99 },
    { name: `Custom 3D Printed ${query} Holder`, price: 19.99 },
    { name: `3D Printed ${query} Model Kit`, price: 34.99 },
    { name: `Professional ${query} 3D Print`, price: 49.99 },
    { name: `Handmade ${query} 3D Printed Art`, price: 29.99 },
    { name: `Custom ${query} 3D Printed Parts`, price: 39.99 },
    { name: `3D Printed ${query} for Electronics`, price: 15.99 },
    { name: `Premium ${query} 3D Printed Set`, price: 44.99 },
    { name: `Artisan ${query} 3D Printed Design`, price: 27.99 },
    { name: `Limited Edition ${query} 3D Print`, price: 59.99 },
  ];
  
  const platformUrls = {
    amazon: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    ebay: (q: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
    etsy: (q: string) => `https://www.etsy.com/search?q=${encodeURIComponent(q)}`,
  };
  
  return mockProducts
    .filter(p => is3DPrintRelated(p.name, query))
    .slice(0, 10)
    .map(p => ({
      title: p.name,
      price: `$${p.price}`,
      url: platformUrls[platform as keyof typeof platformUrls]?.(query + " 3d printed") || `https://www.amazon.com/s?k=${encodeURIComponent(query + " 3d printed")}`,
      platform: platform,
      isMock: true,
    }));
}

async function searchAmazon(query: string): Promise<any[]> {
  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    const results: any[] = [];
    
    // Check if we're blocked (compressed/encrypted response)
    if (html.length < 1000 || html.includes("�") || !html.includes("<")) {
      console.log("Amazon blocking detected, returning mock data");
      return generateMockResults(query, "amazon");
    }
    
    // Try JSON-LD extraction
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches.slice(0, 5)) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">/, "").replace(/<\/script>/, "");
          const data = JSON.parse(jsonStr);
          if (data["@type"] === "Product" && data.name) {
            if (is3DPrintRelated(data.name, query)) {
              results.push({
                title: data.name,
                price: data.offers?.price ? `$${data.offers.price}` : "View on Amazon",
                url: data.url || `https://www.amazon.com/s?k=${encodeURIComponent(data.name)}`,
                platform: "amazon",
              });
            }
          }
        } catch {}
      }
    }
    
    // Regex fallback
    const titlePattern = /<span class="a-text-normal"[^>]*>([^<]+)<\/span>/g;
    let match: RegExpExecArray | null;
    while ((match = titlePattern.exec(html)) !== null) {
      const title = match[1].replace(/<[^>]+>/g, "").trim();
      if (title.length > 10 && is3DPrintRelated(title, query)) {
        results.push({
          title,
          price: "View on Amazon",
          url: `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
          platform: "amazon",
        });
      }
      if (results.length >= 15) break;
    }
    
    return results.length > 0 ? results : generateMockResults(query, "amazon");
  } catch (error) {
    console.log("Amazon error, using mock:", error);
    return generateMockResults(query, "amazon");
  }
}

async function searchEbay(query: string): Promise<any[]> {
  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    
    if (html.length < 500) {
      return generateMockResults(query, "ebay");
    }
    
    const results: any[] = [];
    const titlePattern = /<h3[^>]*class="[^"]*s-item__title[^"]*"[^>]*>([^<]+)<\/h3>/g;
    let match: RegExpExecArray | null;
    while ((match = titlePattern.exec(html)) !== null) {
      const title = match[1].replace(/<[^>]+>/g, "").trim();
      if (title.length > 5 && is3DPrintRelated(title, query)) {
        results.push({
          title,
          price: "View on eBay",
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(title)}`,
          platform: "ebay",
        });
      }
      if (results.length >= 10) break;
    }
    
    return results.length > 0 ? results : generateMockResults(query, "ebay");
  } catch {
    return generateMockResults(query, "ebay");
  }
}

async function searchEtsy(query: string): Promise<any[]> {
  try {
    const url = `https://www.etsy.com/search?q=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    
    if (html.length < 500) {
      return generateMockResults(query, "etsy");
    }
    
    // Try to find listings in the page
    const results: any[] = [];
    const titlePattern = /"title":"([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = titlePattern.exec(html)) !== null) {
      const title = match[1].slice(0, 100);
      if (is3DPrintRelated(title, query)) {
        results.push({
          title,
          price: "View on Etsy",
          url: `https://www.etsy.com/search?q=${encodeURIComponent(title)}`,
          platform: "etsy",
        });
      }
      if (results.length >= 10) break;
    }
    
    return results.length > 0 ? results : generateMockResults(query, "etsy");
  } catch {
    return generateMockResults(query, "etsy");
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const platform = searchParams.get("platform") || "all";
  
  if (!query) {
    return NextResponse.json({ results: [], trends: null });
  }
  
  const allResults: any[] = [];
  
  const [amazonResults, ebayResults, etsyResults] = await Promise.allSettled([
    platform === "etsy" ? [] : searchAmazon(query),
    platform === "amazon" ? [] : searchEbay(query),
    platform === "amazon" ? [] : searchEtsy(query),
  ]);
  
  if (amazonResults.status === "fulfilled") allResults.push(...amazonResults.value);
  if (ebayResults.status === "fulfilled") allResults.push(...ebayResults.value);
  if (etsyResults.status === "fulfilled") allResults.push(...etsyResults.value);
  
  // Remove duplicates
  const seen = new Set();
  const uniqueResults = allResults.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return NextResponse.json({ results: uniqueResults });
}
