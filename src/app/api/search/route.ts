import { NextRequest, NextResponse } from "next/server";

interface ProductResult {
  title: string;
  price: string;
  url: string;
  platform: string;
  image?: string;
  rating?: number;
  reviews?: number;
  type?: "product" | "printable";
}

// Printable ideas
function generatePrintableIdeas(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  const queryCapitalized = q.split(/[\s-]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const ideaTemplates: Record<string, string[]> = {
    phone: ["Phone Stand", "Phone Case", "Phone Mount", "Wireless Charger Dock", "Phone Holder"],
    robot: ["Robot Arm", "Robot Gripper", "Robot Wheel", "Robot Chassis", "Robot Motor Mount"],
    case: ["Phone Case Model", "Tablet Stand", "Electronics Enclosure", "Battery Compartment"],
    holder: ["Pen Cup", "Tool Hook", "Cable Clip", "Phone Car Mount", "Headphone Stand"],
    drone: ["Landing Gear", "Propeller Guard", "Camera Gimbal", "Arm Bracket", "Battery Tray"],
    art: ["Sculpture", "Figurine", "Vase", "Wall Art", "Lamp Shade"],
    jewelry: ["Ring", "Pendant", "Earrings", "Bracelet"],
    toy: ["Fidget Spinner", "Marble Run", "Building Brick", "Puzzle Piece"],
    tool: ["Wrench Handle", "Screwdriver Grip", "Drill Bit Holder", "Hammer Handle"],
    car: ["License Plate Frame", "Air Vent Mount", "Cup Adapter", "Dash Cam Mount"],
    home: ["Cabinet Handle", "Drawer Knob", "Shelf Bracket", "Wall Hook"],
    kitchen: ["Spice Rack", "Knife Block", "Utensil Jar", "Drawer Organizer"],
  };
  
  let templates = ideaTemplates.default || ["Mount", "Bracket", "Stand", "Holder", "Case", "Cover", "Adapter", "Replacement"];
  for (const key of Object.keys(ideaTemplates)) {
    if (q.includes(key) || key.includes(q)) {
      templates = ideaTemplates[key];
      break;
    }
  }
  
  if (templates === ideaTemplates.default) {
    templates = [`Custom ${queryCapitalized}`, `${queryCapitalized} Prototype`, `DIY ${queryCapitalized}`, `${queryCapitalized} Model`, `${queryCapitalized} Design`, `${queryCapitalized} Pattern`, `${queryCapitalized} Component`, `${queryCapitalized} Part`];
  }
  
  return templates.slice(0, 8).map((idea: string) => ({
    title: idea,
    price: "🖨️ Printable",
    url: `https://www.thingiverse.com/search?type=things&q=${encodeURIComponent(idea)}`,
    platform: "thingiverse",
    type: "printable",
  }));
}

// Multi-platform sample database
const SAMPLE_DATABASE: Record<string, ProductResult[]> = {
  robot: [
    { title: "DIY Robot Arm Kit - Arduino Servo", price: "$89.99", url: "https://www.amazon.com/s?k=robot+arm+kit", platform: "amazon", rating: 4.3, reviews: 1250 },
    { title: "Custom Robot Figurine - Handmade", price: "$35.00", url: "https://www.ebay.com/sch/i.html?_nkw=robot+figurine", platform: "ebay", rating: 4.4, reviews: 520 },
    { title: "Robot Sculpture - 3D Printed Art", price: "$65.00", url: "https://www.etsy.com/search?q=robot+sculpture", platform: "etsy", rating: 4.7, reviews: 320 },
    { title: "Robot Parts Kit - DIY Assembly", price: "$28.00", url: "https://www.walmart.com/search?q=robot+parts+kit", platform: "walmart", rating: 4.2, reviews: 180 },
    { title: "Bipedal Walking Robot - Raspberry Pi", price: "$125.00", url: "https://www.amazon.com/s?k=bipedal+robot", platform: "amazon", rating: 4.5, reviews: 890 },
    { title: "Robot Gift - Personalized", price: "$45.00", url: "https://www.etsy.com/search?q=robot+gift", platform: "etsy", rating: 4.8, reviews: 890 },
    { title: "Robot STEM Learning Kit", price: "$39.99", url: "https://www.walmart.com/search?q=robot+kit+stem", platform: "walmart", rating: 4.3, reviews: 210 },
    { title: "FPV Robot Frame - Racing", price: "$45.00", url: "https://www.ebay.com/sch/i.html?_nkw=fpv+robot", platform: "ebay", rating: 4.4, reviews: 290 },
  ],
  case: [
    { title: "Custom Phone Case - Your Design", price: "$19.99", url: "https://www.amazon.com/s?k=custom+phone+case", platform: "amazon", rating: 4.5, reviews: 8500 },
    { title: "Phone Case - Handmade 3D Printed", price: "$15.00", url: "https://www.ebay.com/sch/i.html?_nkw=phone+case+3d+printed", platform: "ebay", rating: 4.5, reviews: 890 },
    { title: "Personalized Phone Case - Custom", price: "$22.00", url: "https://www.etsy.com/search?q=personalized+phone+case", platform: "etsy", rating: 4.9, reviews: 2100 },
    { title: "Phone Case - Multiple Colors", price: "$14.99", url: "https://www.walmart.com/search?q=phone+case", platform: "walmart", rating: 4.2, reviews: 890 },
    { title: "Switch Case - Gaming Edition", price: "$29.99", url: "https://www.amazon.com/s?k=switch+case", platform: "amazon", rating: 4.3, reviews: 3200 },
    { title: "Raspberry Pi Case - with Fan", price: "$18.99", url: "https://www.amazon.com/s?k=raspberry+pi+case", platform: "amazon", rating: 4.7, reviews: 6700 },
    { title: "iPad Case - Protective", price: "$25.00", url: "https://www.etsy.com/search?q=ipad+case+3d+printed", platform: "etsy", rating: 4.7, reviews: 560 },
    { title: "Electronics Case - DIY", price: "$12.00", url: "https://www.ebay.com/sch/i.html?_nkw=electronics+case", platform: "ebay", rating: 4.3, reviews: 340 },
  ],
  holder: [
    { title: "Headphone Stand - Desktop", price: "$24.99", url: "https://www.amazon.com/s?k=headphone+stand", platform: "amazon", rating: 4.6, reviews: 4200 },
    { title: "Tool Holder - Wall Mount", price: "$18.50", url: "https://www.amazon.com/s?k=tool+holder", platform: "amazon", rating: 4.4, reviews: 2800 },
    { title: "Phone Mount - Car Dashboard", price: "$14.99", url: "https://www.amazon.com/s?k=phone+mount+car", platform: "amazon", rating: 4.5, reviews: 8900 },
    { title: "Pen Holder - Desk Organizer", price: "$12.00", url: "https://www.ebay.com/sch/i.html?_nkw=pen+holder", platform: "ebay", rating: 4.4, reviews: 450 },
    { title: "Custom Desk Organizer", price: "$35.00", url: "https://www.etsy.com/search?q=desk+organizer+3d+printed", platform: "etsy", rating: 4.8, reviews: 780 },
    { title: "Cable Clip - Desk Management", price: "$8.00", url: "https://www.walmart.com/search?q=cable+clip", platform: "walmart", rating: 4.3, reviews: 670 },
    { title: "Guitar Pick Holder", price: "$8.00", url: "https://www.ebay.com/sch/i.html?_nkw=guitar+pick+holder", platform: "ebay", rating: 4.6, reviews: 1200 },
    { title: "Mask Strap - Ear Saver", price: "$6.00", url: "https://www.etsy.com/search?q=mask+strap+3d+printed", platform: "etsy", rating: 4.5, reviews: 2300 },
  ],
  drone: [
    { title: "Drone Frame - FPV Racing", price: "$45.00", url: "https://www.amazon.com/s?k=drone+frame", platform: "amazon", rating: 4.5, reviews: 1800 },
    { title: "Propeller Guard - Safety", price: "$18.99", url: "https://www.amazon.com/s?k=drone+propeller+guard", platform: "amazon", rating: 4.4, reviews: 2100 },
    { title: "Drone Parts - Custom", price: "$22.00", url: "https://www.ebay.com/sch/i.html?_nkw=drone+parts", platform: "ebay", rating: 4.3, reviews: 290 },
    { title: "Drone Landing Gear", price: "$15.00", url: "https://www.etsy.com/search?q=drone+landing+gear", platform: "etsy", rating: 4.5, reviews: 180 },
    { title: "Camera Gimbal Mount", price: "$28.99", url: "https://www.amazon.com/s?k=drone+gimbal+mount", platform: "amazon", rating: 4.2, reviews: 670 },
    { title: "Battery Tray - Storage", price: "$12.00", url: "https://www.walmart.com/search?q=drone+battery+holder", platform: "walmart", rating: 4.4, reviews: 340 },
  ],
  art: [
    { title: "Abstract Sculpture - Modern Art", price: "$75.00", url: "https://www.amazon.com/s?k=abstract+sculpture", platform: "amazon", rating: 4.7, reviews: 1200 },
    { title: "Buddha Statue - Home Decor", price: "$45.99", url: "https://www.amazon.com/s?k=buddha+statue", platform: "amazon", rating: 4.5, reviews: 2800 },
    { title: "Handmade Sculpture - Custom", price: "$85.00", url: "https://www.etsy.com/search?q=3d+printed+sculpture", platform: "etsy", rating: 4.9, reviews: 560 },
    { title: "Wall Art - Geometric", price: "$55.00", url: "https://www.ebay.com/sch/i.html?_nkw=wall+art+3d", platform: "ebay", rating: 4.6, reviews: 230 },
    { title: "Modern Vase - 3D Printed", price: "$35.00", url: "https://www.walmart.com/search?q=modern+vase", platform: "walmart", rating: 4.4, reviews: 450 },
    { title: "Figurine - Collectible", price: "$42.00", url: "https://www.etsy.com/search?q=figurine+3d+printed", platform: "etsy", rating: 4.7, reviews: 890 },
  ],
  jewelry: [
    { title: "Custom Ring - Personalized", price: "$39.99", url: "https://www.amazon.com/s?k=custom+ring", platform: "amazon", rating: 4.6, reviews: 3200 },
    { title: "Necklace Pendant - Custom", price: "$24.99", url: "https://www.amazon.com/s?k=necklace+pendant", platform: "amazon", rating: 4.5, reviews: 1800 },
    { title: "Handmade Ring - Unique", price: "$45.00", url: "https://www.etsy.com/search?q=handmade+ring+3d+printed", platform: "etsy", rating: 4.9, reviews: 890 },
    { title: "Earrings - Geometric", price: "$22.00", url: "https://www.ebay.com/sch/i.html?_nkw=earrings+3d+printed", platform: "ebay", rating: 4.7, reviews: 410 },
    { title: "Bracelet - Custom Design", price: "$29.00", url: "https://www.walmart.com/search?q=bracelet+custom", platform: "walmart", rating: 4.3, reviews: 280 },
    { title: "Cufflinks - Professional", price: "$34.00", url: "https://www.etsy.com/search?q=cufflinks+3d+printed", platform: "etsy", rating: 4.8, reviews: 560 },
  ],
  toy: [
    { title: "Toy Car - Custom Model", price: "$14.99", url: "https://www.amazon.com/s?k=toy+car+3d+printed", platform: "amazon", rating: 4.5, reviews: 5600 },
    { title: "Puzzle Cube - Brain Teaser", price: "$18.99", url: "https://www.amazon.com/s?k=puzzle+cube", platform: "amazon", rating: 4.4, reviews: 2300 },
    { title: "LEGO Compatible Bricks", price: "$24.99", url: "https://www.amazon.com/s?k=lego+bricks+3d+printed", platform: "amazon", rating: 4.6, reviews: 8900 },
    { title: "Custom Toy - Made to Order", price: "$20.00", url: "https://www.etsy.com/search?q=custom+toy+3d+printed", platform: "etsy", rating: 4.8, reviews: 670 },
    { title: "Fidget Toys - Various", price: "$12.00", url: "https://www.ebay.com/sch/i.html?_nkw=fidget+toy", platform: "ebay", rating: 4.4, reviews: 890 },
    { title: "Game Tokens - Custom", price: "$15.00", url: "https://www.walmart.com/search?q=game+tokens", platform: "walmart", rating: 4.2, reviews: 340 },
  ],
  home: [
    { title: "Lamp Shade - Modern LED", price: "$34.99", url: "https://www.amazon.com/s?k=lamp+shade+3d+printed", platform: "amazon", rating: 4.5, reviews: 2800 },
    { title: "Cabinet Handle - Custom Pull", price: "$19.99", url: "https://www.amazon.com/s?k=cabinet+handle", platform: "amazon", rating: 4.4, reviews: 4200 },
    { title: "Shelf Bracket - Wall Mount", price: "$15.99", url: "https://www.amazon.com/s?k=shelf+bracket", platform: "amazon", rating: 4.6, reviews: 1900 },
    { title: "Plant Pot - Modern Design", price: "$22.99", url: "https://www.amazon.com/s?k=plant+pot+3d+printed", platform: "amazon", rating: 4.3, reviews: 5600 },
    { title: "Coaster Set - Custom", price: "$12.00", url: "https://www.etsy.com/search?q=coaster+set+3d+printed", platform: "etsy", rating: 4.7, reviews: 2100 },
    { title: "Drawer Organizer", price: "$18.00", url: "https://www.walmart.com/search?q=drawer+organizer", platform: "walmart", rating: 4.4, reviews: 890 },
  ],
  gaming: [
    { title: "Controller Stand - Gaming", price: "$24.99", url: "https://www.amazon.com/s?k=controller+stand", platform: "amazon", rating: 4.5, reviews: 3400 },
    { title: "VR Headset Stand - Quest", price: "$29.99", url: "https://www.amazon.com/s?k=vr+headset+stand", platform: "amazon", rating: 4.6, reviews: 1200 },
    { title: "Arcade Button - Custom", price: "$16.99", url: "https://www.amazon.com/s?k=arcade+button", platform: "amazon", rating: 4.4, reviews: 2100 },
    { title: "Switch Dock - Custom Shell", price: "$34.99", url: "https://www.amazon.com/s?k=switch+dock", platform: "amazon", rating: 4.2, reviews: 890 },
    { title: "Gaming Accessories", price: "$18.00", url: "https://www.etsy.com/search?q=gaming+accessories+3d+printed", platform: "etsy", rating: 4.8, reviews: 560 },
    { title: "Controller Grip", price: "$14.00", url: "https://www.ebay.com/sch/i.html?_nkw=controller+grip", platform: "ebay", rating: 4.3, reviews: 180 },
  ],
};

const DEFAULT_PRODUCTS: ProductResult[] = [
  { title: "PLA Filament 1.75mm - 1kg Spool", price: "$22.99", url: "https://www.amazon.com/s?k=pla+filament", platform: "amazon", rating: 4.8, reviews: 25000 },
  { title: "3D Printer Nozzle Kit", price: "$15.99", url: "https://www.amazon.com/s?k=3d+printer+nozzle", platform: "amazon", rating: 4.6, reviews: 8900 },
  { title: "Build Plate - PEI Sheet", price: "$24.99", url: "https://www.amazon.com/s?k=build+plate+3d+printer", platform: "amazon", rating: 4.7, reviews: 5600 },
  { title: "Filament Dry Box", price: "$29.99", url: "https://www.amazon.com/s?k=filament+dry+box", platform: "amazon", rating: 4.5, reviews: 4200 },
  { title: "3D Printer Tools Kit", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printer+tools", platform: "amazon", rating: 4.4, reviews: 3100 },
];

// Generate multi-platform products
function generateMultiPlatformProducts(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  const queryCapitalized = query.split(/[\s-]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const platforms = [
    { id: "amazon", url: "https://www.amazon.com/s?k=" },
    { id: "ebay", url: "https://www.ebay.com/sch/i.html?_nkw=" },
    { id: "etsy", url: "https://www.etsy.com/search?q=" },
    { id: "walmart", url: "https://www.walmart.com/search?q=" },
  ];
  
  const suffixes = ["Kit", "Parts", "DIY", "Custom Design", "Replacement", "Accessory", "Bundle", "Pack", "Set", "Model"];
  const products: ProductResult[] = [];
  
  for (let i = 0; i < 40; i++) {
    const platform = platforms[i % platforms.length];
    const suffix = suffixes[i % suffixes.length];
    const title = `3D Printed ${queryCapitalized} ${suffix}`;
    const price = 15 + Math.floor(Math.random() * 50);
    const reviews = 300 + Math.floor(Math.random() * 2000);
    
    products.push({
      title,
      price: `$${price}.99`,
      url: platform.url + encodeURIComponent(title.replace(/ /g, "+")),
      platform: platform.id,
      rating: Math.round((4.0 + Math.random() * 0.8) * 10) / 10,
      reviews,
    });
  }
  
  return products;
}

function getProductsForQuery(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);
  let results: ProductResult[] = [];
  
  const isRelevant = (title: string): boolean => {
    const titleLower = title.toLowerCase();
    return words.some(w => w.length > 2 && titleLower.includes(w));
  };
  
  // Try exact match
  if (SAMPLE_DATABASE[q]) {
    results = [...SAMPLE_DATABASE[q]];
  }
  
  // Try matching words
  if (results.length < 4) {
    for (const word of words) {
      if (SAMPLE_DATABASE[word] && results.length < 15) {
        results = [...results, ...SAMPLE_DATABASE[word].filter(p => isRelevant(p.title))];
      }
    }
  }
  
  // Try partial matches
  if (results.length < 3) {
    for (const key of Object.keys(SAMPLE_DATABASE)) {
      if (q.includes(key) || key.includes(q)) {
        const newResults = SAMPLE_DATABASE[key].filter(p => isRelevant(p.title));
        if (newResults.length > 0) results = [...results, ...newResults];
      }
      if (results.length >= 15) break;
    }
  }
  
  // Generate multi-platform products
  if (results.length < 10) {
    results = [...results, ...generateMultiPlatformProducts(q)];
  }
  
  // Add defaults for 3D printing queries
  if (q.includes("3d") || q.includes("printer") || q.includes("filament")) {
    results = [...results, ...DEFAULT_PRODUCTS];
  }
  
  // Shuffle
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }
  
  // Deduplicate and fix URLs
  const seen = new Set<string>();
  return results.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 48);
}

// Try APIs for real data
async function searchSerpAPI(searchQuery: string): Promise<ProductResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return [];
  
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&engine=google_shopping&api_key=${apiKey}&num=20`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    
    if (data.shopping_results) {
      return data.shopping_results.slice(0, 15).map((item: any) => ({
        title: item.title || "Unknown",
        price: item.price || item.extracted_price ? `$${item.extracted_price || item.price}` : "Check Price",
        url: item.link || item.product_link || "",
        platform: item.source === "Amazon" ? "amazon" : (item.source?.toLowerCase() || "shopping"),
        image: item.thumbnail,
        rating: item.rating,
        reviews: item.reviews,
      }));
    }
    return [];
  } catch (e) {
    console.log("SerpAPI error:", e);
    return [];
  }
}

async function searchKeepa(searchQuery: string): Promise<ProductResult[]> {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) return [];
  
  try {
    const url = `https://api.keepa.com/search?domain=1&search=${encodeURIComponent(searchQuery)}&items=20&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    
    if (data.products) {
      return data.products.slice(0, 10).map((p: any) => ({
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
  
  if (!query) {
    return NextResponse.json({ results: [], message: "No query provided" });
  }
  
  let allResults: ProductResult[] = [];
  
  // Try APIs first
  const serpResults = await searchSerpAPI(query + " 3d printed");
  if (serpResults.length > 0) allResults.push(...serpResults);
  
  if (allResults.length < 3) {
    const keepaResults = await searchKeepa(query + " 3d printed");
    if (keepaResults.length > 0) allResults.push(...keepaResults);
  }
  
  // Fall back to sample data
  if (allResults.length < 3) {
    allResults = [...allResults, ...getProductsForQuery(query)];
  }
  
  // Get printable ideas
  const printableIdeas = generatePrintableIdeas(query);
  
  // Deduplicate
  const seen = new Set<string>();
  const uniqueResults = allResults.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return NextResponse.json({ 
    results: uniqueResults.slice(0, 48),
    printableIdeas,
    count: uniqueResults.length,
    query,
  });
}
