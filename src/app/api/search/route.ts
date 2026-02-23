import { NextRequest, NextResponse } from "next/server";
import googleTrends from "google-trends-api";

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
  
  // If title contains the search query, it's related
  if (lowerTitle.includes(lowerQuery)) return true;
  
  // Check if title contains any 3D printing keywords
  return PRINT_KEYWORDS.some(keyword => lowerTitle.includes(keyword.toLowerCase()));
}

async function getGoogleTrends(query: string): Promise<any> {
  try {
    const interestOverTime = await googleTrends.interestOverTime({
      keyword: query + " 3d printed",
      geo: "US",
      timeframe: "today 12-m",
    });
    
    const data = JSON.parse(interestOverTime);
    
    if (data.default?.timelineData) {
      const timelineData = data.default.timelineData;
      
      // Get recent trend (last 7 data points average)
      const recentPoints = timelineData.slice(-7);
      const avgInterest = Math.round(
        recentPoints.reduce((sum: number, point: any) => sum + (point.value?.[0] || 0), 0) / recentPoints.length
      );
      
      // Get trend direction
      const recent = recentPoints[recentPoints.length - 1]?.value?.[0] || 0;
      const older = recentPoints[0]?.value?.[0] || 0;
      const trend = recent > older ? "up" : recent < older ? "down" : "stable";
      
      return {
        interest: avgInterest,
        trend,
        dataPoints: timelineData.length,
      };
    }
    
    return null;
  } catch (error) {
    console.log("Google Trends error:", error);
    return null;
  }
}

async function searchAmazon(query: string): Promise<any[]> {
  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    const results: any[] = [];
    
    // Try to extract JSON-LD structured data first
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">/, "").replace(/<\/script>/, "");
          const data = JSON.parse(jsonStr);
          if (data["@type"] === "Product" && data.name) {
            if (is3DPrintRelated(data.name, query)) {
              results.push({
                title: data.name,
                price: data.offers?.price ? `$${data.offers.price}` : "N/A",
                url: data.url || `https://www.amazon.com/s?k=${encodeURIComponent(data.name)}`,
                platform: "amazon",
              });
            }
          }
        } catch {}
      }
    }
    
    // Fallback: regex extraction
    const titlePatterns = [
      /<span class="a-text-normal"[^>]*>([^<]+)<\/span>/g,
      /<a[^>]+class="[^"]*a-link-normal[^"]*"[^>]+title="([^"]+)"/g,
    ];
    
    for (const pattern of titlePatterns) {
      let match;
      while ((match = pattern.exec(html)) && results.length < 15) {
        const title = match[1].trim().replace(/<[^>]+>/g, "");
        if (title.length > 10 && is3DPrintRelated(title, query)) {
          results.push({
            title,
            price: "View on Amazon",
            url: `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
            platform: "amazon",
          });
        }
      }
    }
    
    return results.slice(0, 15);
  } catch (error) {
    console.log("Amazon search error:", error);
    return [];
  }
}

async function searchEbay(query: string): Promise<any[]> {
  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    const results: any[] = [];
    
    const titlePattern = /<h3[^>]*class="[^"]*s-item__title[^"]*"[^>]*>([^<]+)<\/h3>/g;
    let match;
    while ((match = titlePattern.exec(html)) && results.length < 10) {
      const title = match[1].replace(/<[^>]+>/g, "").trim();
      if (title.length > 5 && is3DPrintRelated(title, query)) {
        results.push({
          title,
          price: "View on eBay",
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(title)}`,
          platform: "ebay",
        });
      }
    }
    
    return results.slice(0, 10);
  } catch (error) {
    console.log("eBay search error:", error);
    return [];
  }
}

async function searchEtsy(query: string): Promise<any[]> {
  try {
    const url = `https://www.etsy.com/search?q=${encodeURIComponent(query + " 3d printed")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    
    const html = await res.text();
    const results: any[] = [];
    
    // Try JSON extraction from initial state
    const jsonMatch = html.match(/"SearchResultsAndResponse":\s*({[\s\S]*?})/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const listings = data?.searchResults?.results || [];
        for (const item of listings.slice(0, 10)) {
          if (item.title && is3DPrintRelated(item.title, query)) {
            results.push({
              title: item.title,
              price: item.price?.value ? `$${item.price.value}` : "N/A",
              url: item.url || `https://www.etsy.com/search?q=${encodeURIComponent(item.title)}`,
              platform: "etsy",
            });
          }
        }
      } catch {}
    }
    
    return results.slice(0, 10);
  } catch (error) {
    console.log("Etsy search error:", error);
    return [];
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
  
  // Run searches in parallel
  const [amazonResults, ebayResults, etsyResults, trendsData] = await Promise.allSettled([
    platform === "etsy" ? [] : searchAmazon(query),
    platform === "amazon" ? [] : searchEbay(query),
    platform === "amazon" ? [] : searchEtsy(query),
    getGoogleTrends(query),
  ]);
  
  if (amazonResults.status === "fulfilled") {
    allResults.push(...amazonResults.value);
  }
  if (ebayResults.status === "fulfilled") {
    allResults.push(...ebayResults.value);
  }
  if (etsyResults.status === "fulfilled") {
    allResults.push(...etsyResults.value);
  }
  
  // Get trends data
  let trends = null;
  if (trendsData.status === "fulfilled" && trendsData.value) {
    trends = trendsData.value;
  }
  
  // Remove duplicates
  const seen = new Set();
  const uniqueResults = allResults.filter(item => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return NextResponse.json({ 
    results: uniqueResults,
    trends 
  });
}
