import { NextRequest, NextResponse } from "next/server";

const PRINT_KEYWORDS = [
  "3d", "printed", "printing", "filament", "pla", "abs", "petg", 
  "model", "stl", "printer", "nozzle", "bed", "resin", "sla",
  "robot", "case", "holder", "mount", "bracket", "gear", "vent",
  "custom", "定制", "impression", "3d打印"
];

function is3DPrintRelated(title: string, query: string): boolean {
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  if (lowerTitle.includes(lowerQuery)) return true;
  return PRINT_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

async function searchAmazon(query: string): Promise<any[]> {
  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    
    // If blocked or too short, return empty
    if (html.length < 1000 || html.includes("�")) {
      return [];
    }
    
    const results: any[] = [];
    
    // Try JSON-LD
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches.slice(0, 5)) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">/, "").replace(/<\/script>/, "");
          const data = JSON.parse(jsonStr);
          if (data["@type"] === "Product" && data.name && is3DPrintRelated(data.name, query)) {
            results.push({
              title: data.name,
              price: data.offers?.price ? `$${data.offers.price}` : "View on Amazon",
              url: data.url || `https://www.amazon.com/s?k=${encodeURIComponent(data.name)}`,
              platform: "amazon",
            });
          }
        } catch {}
      }
    }
    
    // Regex fallback for titles
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
    
    return results;
  } catch {
    return [];
  }
}

async function searchEbay(query: string): Promise<any[]> {
  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 500) return [];
    
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
    return results;
  } catch {
    return [];
  }
}

async function searchEtsy(query: string): Promise<any[]> {
  try {
    const url = `https://www.etsy.com/search?q=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    if (html.length < 500) return [];
    
    const results: any[] = [];
    const titlePattern = /"title":"([^"]{5,100})"/g;
    let match: RegExpExecArray | null;
    while ((match = titlePattern.exec(html)) !== null) {
      const title = match[1];
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
    return results;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const platform = request.nextUrl.searchParams.get("platform") || "all";
  
  if (!query) {
    return NextResponse.json({ results: [] });
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
