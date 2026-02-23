import { NextRequest, NextResponse } from "next/server";

interface ProductResult {
  title: string;
  price: string;
  url: string;
  platform: string;
  category?: string;
  image?: string;
  rating?: number;
  asin?: string;
}

// Category configurations with search terms
const CATEGORIES: Record<string, { name: string; searchTerms: string[] }> = {
  "amazon-devices": { 
    name: "Amazon Devices & Accessories", 
    searchTerms: ["echo", "kindle", "fire tv", "alexa", "tablet"] 
  },
  "appliances": { 
    name: "Appliances", 
    searchTerms: ["kitchen", "vacuum", "air conditioner", "microwave", "blender"] 
  },
  "arts-crafts": { 
    name: "Arts, Crafts & Sewing", 
    searchTerms: ["craft", "sewing", "art", "supplies", "diy"] 
  },
  "automotive": { 
    name: "Automotive Parts & Accessories", 
    searchTerms: ["car", "auto", "vehicle", "motorcycle", "truck"] 
  },
  "baby": { 
    name: "Baby Products", 
    searchTerms: ["baby", "infant", "toddler", "diaper", "stroller"] 
  },
  "beauty": { 
    name: "Beauty & Personal Care", 
    searchTerms: ["skincare", "makeup", "haircare", "cosmetic", "beauty"] 
  },
  "books": { name: "Books", searchTerms: ["book", "novel", "ebook", "reading"] },
  "cds-vinyl": { name: "CDs & Vinyl", searchTerms: ["cd", "vinyl", "music", "album"] },
  "cell-phones": { 
    name: "Cell Phones & Accessories", 
    searchTerms: ["phone", "smartphone", "iphone", "android", "accessories"] 
  },
  "clothing": { 
    name: "Clothing, Shoes & Jewelry", 
    searchTerms: ["clothing", "shoes", "jewelry", "fashion", "wear"] 
  },
  "collectibles": { 
    name: "Collectibles & Fine Art", 
    searchTerms: ["collectible", "art", "antique", "rare", "vintage"] 
  },
  "computers": { 
    name: "Computers & Accessories", 
    searchTerms: ["computer", "laptop", "monitor", "keyboard", "mouse"] 
  },
  "electronics": { 
    name: "Electronics", 
    searchTerms: ["tv", "headphones", "camera", "speaker", "gadget"] 
  },
  "gift-cards": { name: "Gift Cards", searchTerms: ["gift card", "gift"] },
  "grocery": { 
    name: "Grocery & Gourmet Food", 
    searchTerms: ["food", "grocery", "snack", "organic", "gourmet"] 
  },
  "health": { 
    name: "Health & Household", 
    searchTerms: ["health", "household", "wellness", "medical", "supplement"] 
  },
  "home-kitchen": { 
    name: "Home & Kitchen", 
    searchTerms: ["kitchen", "home", "furniture", "decor", "dining"] 
  },
  "industrial": { 
    name: "Industrial & Scientific", 
    searchTerms: ["industrial", "scientific", "lab", "equipment", "tool"] 
  },
  "luggage": { 
    name: "Luggage & Travel Gear", 
    searchTerms: ["luggage", "travel", "suitcase", "backpack", "bag"] 
  },
  "movies-tv": { 
    name: "Movies & TV", 
    searchTerms: ["movie", "dvd", "blu-ray", "tv show", "streaming"] 
  },
  "musical-instruments": { 
    name: "Musical Instruments", 
    searchTerms: ["instrument", "guitar", "piano", "drum", "music gear"] 
  },
  "office": { 
    name: "Office Products", 
    searchTerms: ["office", "supplies", "printer", "paper", "stationery"] 
  },
  "patio-garden": { 
    name: "Patio, Lawn & Garden", 
    searchTerms: ["patio", "garden", "outdoor", "lawn", "yard"] 
  },
  "pet-supplies": { 
    name: "Pet Supplies", 
    searchTerms: ["pet", "dog", "cat", "animal", "aquarium"] 
  },
  "software": { name: "Software", searchTerms: ["software", "app", "program", "digital"] },
  "sports": { 
    name: "Sports & Outdoors", 
    searchTerms: ["sport", "outdoor", "fitness", "exercise", "camping"] 
  },
  "tools": { 
    name: "Tools & Home Improvement", 
    searchTerms: ["tool", "hardware", "improvement", "diy", "repair"] 
  },
  "toys": { 
    name: "Toys & Games", 
    searchTerms: ["toy", "game", "puzzle", "kids", "children"] 
  },
  "video-games": { 
    name: "Video Games", 
    searchTerms: ["video game", "gaming", "console", "playstation", "xbox"] 
  },
};

const PRINT_KEYWORDS = ["3d printed", "3d print", "printed", "filament", "custom 3d"];

function is3DPrintRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return PRINT_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

async function searchKeepa(query: string, categoryKey?: string): Promise<ProductResult[]> {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) {
    return [];
  }
  
  try {
    // Keepa uses category codes - we'll search broadly
    const searchQuery = `${query} 3d printed`;
    const url = `https://api.keepa.com/search?domain=1&search=${encodeURIComponent(searchQuery)}&items=20&key=${apiKey}`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    
    if (data.products) {
      return data.products
        .filter((p: any) => p.title && is3DPrintRelated(p.title))
        .slice(0, 15)
        .map((p: any) => ({
          title: p.title || "Unknown Product",
          price: p.price ? `$${(p.price / 100).toFixed(2)}` : "Check Price",
          url: `https://www.amazon.com/dp/${p.asin}`,
          platform: "amazon",
          category: categoryKey ? CATEGORIES[categoryKey]?.name : undefined,
          asin: p.asin,
          image: p.image,
          rating: p.rating,
        }));
    }
    return [];
  } catch (e) {
    console.log("Keepa error:", e);
    return [];
  }
}

async function searchEtsy(query: string, categoryKey?: string): Promise<ProductResult[]> {
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
          category: categoryKey ? CATEGORIES[categoryKey]?.name : undefined,
        });
      }
      if (results.length >= 10) break;
    }
    return results;
  } catch {
    return [];
  }
}

async function searchEbay(query: string, categoryKey?: string): Promise<ProductResult[]> {
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
      if (title.length > 10 && (title.toLowerCase().includes("3d") || title.toLowerCase().includes("printed"))) {
        results.push({
          title,
          price: "View on eBay",
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(title)}`,
          platform: "ebay",
          category: categoryKey ? CATEGORIES[categoryKey]?.name : undefined,
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
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const platform = searchParams.get("platform") || "all";
  
  // Return categories list if no query
  if (!query && !category) {
    return NextResponse.json({ 
      categories: Object.entries(CATEGORIES).map(([key, val]) => ({
        id: key,
        name: val.name,
      }))
    });
  }
  
  // If category specified, search within that category
  const categoryConfig = category ? CATEGORIES[category] : null;
  const searchTerms = categoryConfig?.searchTerms || (query ? [query] : []);
  
  const allResults: ProductResult[] = [];
  
  // Search each term for this category
  for (const term of searchTerms.slice(0, 3)) {
    const [keepaResults, etsyResults, ebayResults] = await Promise.allSettled([
      platform === "etsy" || platform === "ebay" ? [] : searchKeepa(term, category),
      platform === "amazon" || platform === "ebay" ? [] : searchEtsy(term, category),
      platform === "amazon" || platform === "etsy" ? [] : searchEbay(term, category),
    ]);
    
    if (keepaResults.status === "fulfilled") allResults.push(...keepaResults.value);
    if (etsyResults.status === "fulfilled") allResults.push(...etsyResults.value);
    if (ebayResults.status === "fulfilled") allResults.push(...ebayResults.value);
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
    results: uniqueResults,
    category: categoryConfig?.name,
    searchTerms,
    hasApiKey: !!process.env.KEEPA_API_KEY,
  });
}
