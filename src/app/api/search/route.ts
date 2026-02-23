import { NextRequest, NextResponse } from "next/server";

interface ProductResult {
  title: string;
  price: string;
  url: string;
  platform: string;
  image?: string;
  rating?: number;
  reviews?: number;
}

// Sample real Amazon products for demo purposes
const SAMPLE_PRODUCTS: Record<string, ProductResult[]> = {
  robot: [
    { title: "3D Printed Robot Arm Kit - DIY Robotic Arm", price: "$89.99", url: "https://www.amazon.com/s?k=3d+printed+robot+arm", platform: "amazon", rating: 4.2, reviews: 856 },
    { title: "Programmable Robot Car 3D Printed Chassis", price: "$45.99", url: "https://www.amazon.com/s?k=3d+printed+robot+car", platform: "amazon", rating: 4.5, reviews: 1203 },
    { title: "3D Printed humanoid Robot Head - Arduino Compatible", price: "$67.50", url: "https://www.amazon.com/s?k=3d+printed+robot+head", platform: "amazon", rating: 4.1, reviews: 342 },
    { title: "Robot Vacuum Cleaner 3D Printed Parts", price: "$34.99", url: "https://www.amazon.com/s?k=robot+vacuum+3d+printed", platform: "amazon", rating: 4.3, reviews: 567 },
    { title: "3D Printed Robot Action Figure Collectible", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printed+robot+figure", platform: "amazon", rating: 4.6, reviews: 2100 },
  ],
  case: [
    { title: "3D Printed Phone Case - Custom Design", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printed+phone+case", platform: "amazon", rating: 4.4, reviews: 3200 },
    { title: "Nintendo Switch 3D Printed Case", price: "$29.99", url: "https://www.amazon.com/s?k=3d+printed+switch+case", platform: "amazon", rating: 4.2, reviews: 890 },
    { title: "Raspberry Pi 3D Printed Case with Fan", price: "$15.99", url: "https://www.amazon.com/s?k=raspberry+pi+3d+printed+case", platform: "amazon", rating: 4.7, reviews: 4500 },
    { title: "AirPods Pro 3D Printed Case Cover", price: "$12.99", url: "https://www.amazon.com/s?k=airpods+3d+printed+case", platform: "amazon", rating: 4.3, reviews: 2100 },
    { title: "3D Printed Laptop Stand with Case", price: "$39.99", url: "https://www.amazon.com/s?k=3d+printed+laptop+stand", platform: "amazon", rating: 4.1, reviews: 445 },
  ],
  holder: [
    { title: "3D Printed Headphone Stand Holder", price: "$22.99", url: "https://www.amazon.com/s?k=3d+printed+headphone+holder", platform: "amazon", rating: 4.5, reviews: 1800 },
    { title: "Wall Mounted Tool Holder 3D Printed", price: "$18.50", url: "https://www.amazon.com/s?k=3d+printed+tool+holder", platform: "amazon", rating: 4.3, reviews: 920 },
    { title: "3D Printed Phone Holder for Car", price: "$14.99", url: "https://www.amazon.com/s?k=3d+printed+phone+holder+car", platform: "amazon", rating: 4.4, reviews: 3400 },
    { title: "Desk Organizer 3D Printed Pen Holder", price: "$16.99", url: "https://www.amazon.com/s?k=3d+printed+pen+holder", platform: "amazon", rating: 4.2, reviews: 1100 },
    { title: "3D Printed Mask Holder Face Shield", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printed+mask+holder", platform: "amazon", rating: 4.0, reviews: 320 },
  ],
  default: [
    { title: "3D Printed Filament Dry Box with Spool Holder", price: "$34.99", url: "https://www.amazon.com/s?k=3d+printed+filament+holder", platform: "amazon", rating: 4.6, reviews: 2800 },
    { title: "Custom 3D Printed Cookie Cutter Set", price: "$12.99", url: "https://www.amazon.com/s?k=3d+printed+cookie+cutter", platform: "amazon", rating: 4.7, reviews: 5200 },
    { title: "3D Printed Architectural Model Kit", price: "$49.99", url: "https://www.amazon.com/s?k=3d+printed+architectural+model", platform: "amazon", rating: 4.3, reviews: 670 },
    { title: "3D Printed Jewelry - Custom Rings", price: "$39.99", url: "https://www.amazon.com/s?k=3d+printed+jewelry+ring", platform: "amazon", rating: 4.5, reviews: 1900 },
    { title: "PLA Filament 1.75mm - 3D Printing Material", price: "$22.99", url: "https://www.amazon.com/s?k=pla+filament+3d+printing", platform: "amazon", rating: 4.8, reviews: 12000 },
  ]
};

// eBay sample data
const EBAY_PRODUCTS: ProductResult[] = [
  { title: "Custom 3D Printed Robot Figurine - Made to Order", price: "$35.00", url: "https://www.ebay.com/sch/i.html?_nkw=custom+3d+printed+robot", platform: "ebay" },
  { title: "3D Printed Phone Case Custom Design", price: "$15.00", url: "https://www.ebay.com/sch/i.html?_nkw=3d+printed+phone+case", platform: "ebay" },
  { title: "3D Printed Art - Abstract Sculpture", price: "$75.00", url: "https://www.ebay.com/sch/i.html?_nkw=3d+printed+art+sculpture", platform: "ebay" },
  { title: "Custom 3D Printed Keycap Set for Mechanical Keyboard", price: "$28.00", url: "https://www.ebay.com/sch/i.html?_nkw=3d+printed+keycap", platform: "ebay" },
  { title: "3D Printed Drone Parts - Custom FPV Frame", price: "$45.00", url: "https://www.ebay.com/sch/i.html?_nkw=3d+printed+drone+frame", platform: "ebay" },
];

// Etsy sample data  
const ETSY_PRODUCTS: ProductResult[] = [
  { title: "Custom 3D Printed Name Plate - Personalized Desk Accessory", price: "$25.00", url: "https://www.etsy.com/search?q=custom+3d+printed+name+plate", platform: "etsy" },
  { title: "3D Printed Wedding Cake Topper - Custom Couple Names", price: "$18.00", url: "https://www.etsy.com/search?q=3d+printed+cake+topper", platform: "etsy" },
  { title: "Personalized 3D Printed Baby Growth Chart", price: "$32.00", url: "https://www.etsy.com/search?q=3d+printed+growth+chart", platform: "etsy" },
  { title: "Custom 3D Printed Miniature Figurine - Your Photo", price: "$40.00", url: "https://www.etsy.com/search?q=custom+3d+printed+miniature", platform: "etsy" },
  { title: "3D Printed Architectural Model - Custom House Design", price: "$85.00", url: "https://www.etsy.com/search?q=3d+printed+architectural+model", platform: "etsy" },
];

function getSampleProducts(query: string): ProductResult[] {
  const key = query.toLowerCase().split(" ")[0];
  return SAMPLE_PRODUCTS[key] || SAMPLE_PRODUCTS.default;
}

function is3DPrintRelated(title: string): boolean {
  const keywords = ["3d", "printed", "printing", "filament", "pla", "abs", "custom", "model"];
  const lower = title.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// Keepa API for real Amazon data
async function searchKeepa(query: string): Promise<ProductResult[]> {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) return [];
  
  try {
    const url = `https://api.keepa.com/search?domain=1&search=${encodeURIComponent(query)}&items=20&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    
    if (data.products) {
      return data.products
        .filter((p: any) => p.title && is3DPrintRelated(p.title))
        .slice(0, 10)
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

// Try real scraping
async function tryScrapeAmazon(query: string): Promise<ProductResult[]> {
  try {
    // Try alternative user agent and different endpoint
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&rh=p_72%3A2661618011`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(5000),
    });
    
    const html = await res.text();
    
    // Check if we got real content
    if (html.length < 5000 || html.includes("captcha") || html.includes("sorry")) {
      return [];
    }
    
    const results: ProductResult[] = [];
    
    // Try to find JSON-LD data
    const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    
    while ((match = jsonLdPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const items = Array.isArray(data) ? data : (data["@graph"] || [data]);
        
        for (const item of items) {
          if (item["@type"] === "Product" && item.name) {
            const price = item.offers?.price || item.offers?.[0]?.price;
            results.push({
              title: item.name,
              price: price ? `$${parseFloat(price).toFixed(2)}` : "Check Price",
              url: item.url || item.offers?.[0]?.url || "",
              platform: "amazon",
            });
          }
        }
      } catch {}
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
    return NextResponse.json({ results: [], message: "No query provided" });
  }
  
  const allResults: ProductResult[] = [];
  
  // Try Keepa first (real data)
  const keepaResults = await searchKeepa(query);
  if (keepaResults.length > 0) {
    allResults.push(...keepaResults);
  }
  
  // Try scraping
  if (allResults.length === 0) {
    const scrapedResults = await tryScrapeAmazon(query + " 3d printed");
    if (scrapedResults.length > 0) {
      allResults.push(...scrapedResults);
    }
  }
  
  // Add sample data if no real data found
  if (allResults.length === 0) {
    if (platform === "all" || platform === "amazon") {
      allResults.push(...getSampleProducts(query));
    }
    if (platform === "all" || platform === "ebay") {
      allResults.push(...EBAY_PRODUCTS.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(p.title.toLowerCase().split(" ")[2] || "")
      ).slice(0, 3));
    }
    if (platform === "all" || platform === "etsy") {
      allResults.push(...ETSY_PRODUCTS.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(p.title.toLowerCase().split(" ")[2] || "")
      ).slice(0, 3));
    }
  }
  
  // Deduplicate
  const seen = new Set<string>();
  const uniqueResults = allResults.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return NextResponse.json({ 
    results: uniqueResults.slice(0, 20),
    count: uniqueResults.length,
    hasRealData: keepaResults.length > 0 || allResults.length > 15,
    message: keepaResults.length === 0 ? "Sample data shown. Add KEEPA_API_KEY for real Amazon data." : undefined,
  });
}
