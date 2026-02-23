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

// Thingiverse & Printables style ideas
function generatePrintableIdeas(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  const queryCapitalized = q.split(/[\s-]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const ideaTemplates: Record<string, string[]> = {
    robot: ["Bipedal Walking Robot", "Robot Arm Mechanism", "Robot Gripper Claw", "Hexapod Body", "Motor Mount", "Robot Wheel", "Sensor Housing", "Robot Chassis"],
    phone: ["Phone Stand Adjustable", "Magnetic Car Mount", "Snap Phone Case", "Tablet Dock", "Wireless Charger", "Phone Holder", "Desk Kickstand", "Bike Mount"],
    case: ["Electronics Enclosure", "Raspberry Pi Case", "Arduino Housing", "Battery Box", "Project Box", "Snap Fit Case", "Ventilated Cover", "Custom Shell"],
    holder: ["Pen Cup Organizer", "Tool Wall Mount", "Cable Clip", "Headphone Stand", "Knife Magnetic Strip", "Shelf Bracket", "Bottle Holder", "Guitar Pick Holder"],
    drone: ["FPV Drone Frame", "Landing Gear", "Prop Guard", "Gimbal Mount", "Arm Bracket", "Battery Tray", "Antenna Mount", "Motor Housing"],
    art: ["Geometric Vase", "Parametric Sculpture", "Figurine", "Wall Art Panel", "Lamp Shade", "Ceramic Bowl", "Garden Ornament", "Statue"],
    jewelry: ["Ring Band", "Pendant", "Earrings", "Bracelet", "Charm", "Belt Buckle", "Cufflinks", "Anklet"],
    toy: ["Fidget Spinner", "Marble Run", "LEGO Brick", "Puzzle Piece", "Game Token", "Action Figure", "Rubiks Cube", "YoYo"],
    home: ["Cabinet Handle", "Drawer Knob", "Light Switch", "Coaster", "Plant Pot", "Picture Frame", "Mirror Mount", "Shelf Bracket"],
    gaming: ["Controller Grip", "Arcade Button", "Joystick Topper", "Headphone Hook", "Cable Guide", "Vent Cover", "Card Holder", "VR Stand"],
    tool: ["Wrench Handle", "Screwdriver Grip", "Drill Holder", "Hammer Handle", "Pliers Grip", "Tool Box", "Goggle Frame", "Measuring Case"],
    car: ["License Plate", "Air Vent Mount", "Cup Adapter", "Dash Cam", "Wheel Cap", "Seat Gap", "Key Fob", "Sun Shade"],
    kitchen: ["Spice Jar", "Knife Block", "Utensil Jar", "Drawer Organizer", "Pot Lid Rack", "Cabinet Pull", "Towel Ring", "Soap Dispenser"],
  };
  
  let templates: string[] = [];
  for (const key of Object.keys(ideaTemplates)) {
    if (q.includes(key) || key.includes(q)) {
      templates = ideaTemplates[key];
      break;
    }
  }
  
  if (templates.length === 0) {
    templates = [
      `Custom ${queryCapitalized} Design`, `${queryCapitalized} STL File`, `DIY ${queryCapitalized} Model`,
      `Parametric ${queryCapitalized}`, `${queryCapitalized} Print File`, `${queryCapitalized} CAD`,
    ];
  }
  
  return templates.slice(0, 8).map((idea: string) => ({
    title: idea,
    price: "🖨️ Free STL",
    url: `https://www.thingiverse.com/search?type=things&q=${encodeURIComponent(idea)}`,
    platform: "thingiverse",
    type: "printable",
  }));
}

// Full database with ALL platforms
const SAMPLE_DATABASE: Record<string, ProductResult[]> = {
  robot: [
    // Amazon
    { title: "DIY Robot Arm Kit - Arduino", price: "$89.99", url: "https://www.amazon.com/s?k=robot+arm+kit", platform: "amazon", rating: 4.3, reviews: 1250 },
    // eBay
    { title: "Robot Figurine - Handmade", price: "$35.00", url: "https://www.ebay.com/sch/i.html?_nkw=robot+figurine", platform: "ebay", rating: 4.4, reviews: 520 },
    // Etsy
    { title: "Robot Sculpture - 3D Printed", price: "$65.00", url: "https://www.etsy.com/search?q=robot+sculpture", platform: "etsy", rating: 4.7, reviews: 320 },
    // Thingiverse - REAL
    { title: "Bipedal Walking Robot - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=bipedal+robot", platform: "thingiverse", rating: 4.6, reviews: 4500 },
    { title: "Robot Arm - STL Download", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=robot+arm", platform: "thingiverse", rating: 4.8, reviews: 12000 },
    { title: "Hexapod Spider Robot - Free", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=hexapod+robot", platform: "thingiverse", rating: 4.5, reviews: 3200 },
    // Printables - REAL
    { title: "Robot Gripper - Prusa Print", price: "Free", url: "https://www.printables.com/search/models?keyword=robot+gripper", platform: "printables", rating: 4.7, reviews: 8900 },
    { title: "Robot Wheel Design - Free", price: "Free", url: "https://www.printables.com/search/models?keyword=robot+wheel", platform: "printables", rating: 4.4, reviews: 2100 },
  ],
  phone: [
    { title: "Custom Phone Case - Your Design", price: "$19.99", url: "https://www.amazon.com/s?k=phone+case", platform: "amazon", rating: 4.5, reviews: 8500 },
    { title: "Phone Case - Handmade", price: "$15.00", url: "https://www.ebay.com/sch/i.html?_nkw=phone+case", platform: "ebay", rating: 4.5, reviews: 890 },
    { title: "Personalized Phone Case - Etsy", price: "$22.00", url: "https://www.etsy.com/search?q=phone+case", platform: "etsy", rating: 4.9, reviews: 2100 },
    // Thingiverse
    { title: "Phone Stand - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=phone+stand", platform: "thingiverse", rating: 4.7, reviews: 8900 },
    { title: "Magnetic Car Mount - STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=phone+mount", platform: "thingiverse", rating: 4.5, reviews: 5600 },
    // Printables
    { title: "Phone Dock - Free Download", price: "Free", url: "https://www.printables.com/search/models?keyword=phone+dock", platform: "printables", rating: 4.6, reviews: 4200 },
    { title: "Phone Case Prusa - Free", price: "Free", url: "https://www.printables.com/search/models?keyword=phone+case", platform: "printables", rating: 4.8, reviews: 15000 },
  ],
  case: [
    { title: "Raspberry Pi Case w/ Fan", price: "$18.99", url: "https://www.amazon.com/s?k=pi+case", platform: "amazon", rating: 4.7, reviews: 6700 },
    { title: "Switch Case - Gaming", price: "$29.99", url: "https://www.amazon.com/s?k=switch+case", platform: "amazon", rating: 4.3, reviews: 3200 },
    // Thingiverse
    { title: "RPi Case Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=raspberry+pi+case", platform: "thingiverse", rating: 4.9, reviews: 25000 },
    { title: "Arduino Enclosure - Free", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=arduino+case", platform: "thingiverse", rating: 4.7, reviews: 12000 },
    // Printables
    { title: "ESP32 Case - Free STL", price: "Free", url: "https://www.printables.com/search/models?keyword=esp32+case", platform: "printables", rating: 4.6, reviews: 8900 },
  ],
  holder: [
    { title: "Headphone Stand - Desktop", price: "$24.99", url: "https://www.amazon.com/s?k=headphone+stand", platform: "amazon", rating: 4.6, reviews: 4200 },
    { title: "Tool Holder - Wall Mount", price: "$18.50", url: "https://www.amazon.com/s?k=tool+holder", platform: "amazon", rating: 4.4, reviews: 2800 },
    // Thingiverse
    { title: "Headphone Stand - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=headphone+stand", platform: "thingiverse", rating: 4.8, reviews: 18000 },
    { title: "Pen Cup Organizer - STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=pen+cup", platform: "thingiverse", rating: 4.6, reviews: 9200 },
    // Printables
    { title: "Cable Clip - Free Download", price: "Free", url: "https://www.printables.com/search/models?keyword=cable+clip", platform: "printables", rating: 4.7, reviews: 15000 },
    { title: "Tool Mount - Prusa", price: "Free", url: "https://www.printables.com/search/models?keyword=tool+mount", platform: "printables", rating: 4.5, reviews: 6700 },
  ],
  drone: [
    { title: "Drone Frame - FPV Racing", price: "$45.00", url: "https://www.amazon.com/s?k=drone+frame", platform: "amazon", rating: 4.5, reviews: 1800 },
    { title: "Propeller Guard - Safety", price: "$18.99", url: "https://www.amazon.com/s?k=propeller+guard", platform: "amazon", rating: 4.4, reviews: 2100 },
    // Thingiverse
    { title: "FPV Drone Frame - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=fpv+drone", platform: "thingiverse", rating: 4.6, reviews: 7800 },
    { title: "Landing Gear STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=drone+landing+gear", platform: "thingiverse", rating: 4.4, reviews: 3400 },
    // Printables
    { title: "Prop Guard - Free STL", price: "Free", url: "https://www.printables.com/search/models?keyword=drone+propeller", platform: "printables", rating: 4.7, reviews: 5600 },
  ],
  art: [
    { title: "Abstract Sculpture", price: "$75.00", url: "https://www.amazon.com/s?k=sculpture", platform: "amazon", rating: 4.7, reviews: 1200 },
    // Thingiverse
    { title: "Geometric Vase - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=geometric+vase", platform: "thingiverse", rating: 4.8, reviews: 45000 },
    { title: "Parametric Art - Free", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=parametric+art", platform: "thingiverse", rating: 4.7, reviews: 18000 },
    // Printables
    { title: "Lamp Shade - Free STL", price: "Free", url: "https://www.printables.com/search/models?keyword=lamp+shade", platform: "printables", rating: 4.9, reviews: 32000 },
    { title: "Wall Art - Prusa", price: "Free", url: "https://www.printables.com/search/models?keyword=wall+art", platform: "printables", rating: 4.6, reviews: 12000 },
  ],
  jewelry: [
    { title: "Custom Ring", price: "$39.99", url: "https://www.amazon.com/s?k=ring", platform: "amazon", rating: 4.6, reviews: 3200 },
    // Thingiverse
    { title: "Ring Design - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=ring+design", platform: "thingiverse", rating: 4.7, reviews: 28000 },
    { title: "Earrings Template", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=earrings", platform: "thingiverse", rating: 4.6, reviews: 15000 },
  ],
  toy: [
    { title: "LEGO Compatible Bricks", price: "$24.99", url: "https://www.amazon.com/s?k=lego+bricks", platform: "amazon", rating: 4.6, reviews: 8900 },
    // Thingiverse
    { title: "Fidget Spinner - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=fidget+spinner", platform: "thingiverse", rating: 4.9, reviews: 89000 },
    { title: "LEGO Bricks - Free", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=lego+bricks", platform: "thingiverse", rating: 4.8, reviews: 56000 },
    // Printables
    { title: "Marble Run - Free STL", price: "Free", url: "https://www.printables.com/search/models?keyword=marble+run", platform: "printables", rating: 4.7, reviews: 34000 },
  ],
  home: [
    { title: "Cabinet Handle", price: "$19.99", url: "https://www.amazon.com/s?k=cabinet+handle", platform: "amazon", rating: 4.4, reviews: 4200 },
    // Thingiverse
    { title: "Cabinet Pull - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=cabinet+handle", platform: "thingiverse", rating: 4.7, reviews: 22000 },
    { title: "Plant Pot Modern", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=plant+pot", platform: "thingiverse", rating: 4.8, reviews: 38000 },
    // Printables
    { title: "Coaster Set - Free STL", price: "Free", url: "https://www.printables.com/search/models?keyword=coaster", platform: "printables", rating: 4.9, reviews: 67000 },
  ],
  gaming: [
    { title: "Controller Stand", price: "$24.99", url: "https://www.amazon.com/s?k=controller+stand", platform: "amazon", rating: 4.5, reviews: 3400 },
    // Thingiverse
    { title: "Controller Grip - Free STL", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=controller+grip", platform: "thingiverse", rating: 4.7, reviews: 15000 },
    { title: "Arcade Buttons - Free", price: "Free", url: "https://www.thingiverse.com/search?type=things&q=arcade+buttons", platform: "thingiverse", rating: 4.6, reviews: 8900 },
  ],
};

// Generate free STL files for any search query
function generateSTLFiles(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  const queryCapitalized = query.split(/[\s-]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  // Generic STL ideas that work with any query
  const stlTemplates = [
    { title: `${queryCapitalized} Design - Free STL`, platform: "thingiverse" },
    { title: `${queryCapitalized} Model - STL File`, platform: "thingiverse" },
    { title: `${queryCapitalized} 3D Model - Free Download`, platform: "thingiverse" },
    { title: `DIY ${queryCapitalized} - Print File`, platform: "thingiverse" },
    { title: `${queryCapitalized} Prototype - STL`, platform: "thingiverse" },
    { title: `${queryCapitalized} - Prusa Print File`, platform: "printables" },
    { title: `Custom ${queryCapitalized} - Free STL`, platform: "printables" },
    { title: `${queryCapitalized} CAD Design - Download`, platform: "printables" },
  ];
  
  return stlTemplates.map((item) => ({
    title: item.title,
    price: "Free",
    url: item.platform === "thingiverse"
      ? `https://www.thingiverse.com/search?type=things&q=${encodeURIComponent(query)}`
      : `https://www.printables.com/search/models?keyword=${encodeURIComponent(query)}`,
    platform: item.platform,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 10000) + 1000,
  }));
}

function getProductsForQuery(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  let results: ProductResult[] = [];
  let printFiles: ProductResult[] = [];
  
  // Get matching category products
  if (SAMPLE_DATABASE[q]) {
    results = [...SAMPLE_DATABASE[q]];
  }
  
  // Partial match
  if (results.length < 4) {
    for (const key of Object.keys(SAMPLE_DATABASE)) {
      if (q.includes(key) || key.includes(q)) {
        results = [...results, ...SAMPLE_DATABASE[key]];
      }
      if (results.length >= 15) break;
    }
  }
  
  // Separate Thingiverse/Printables from other platforms
  const stlFiles = results.filter(r => r.platform === "thingiverse" || r.platform === "printables");
  const otherProducts = results.filter(r => r.platform !== "thingiverse" && r.platform !== "printables");
  
  // If less than 5 STL files, generate more
  if (stlFiles.length < 5) {
    const generatedSTLs = generateSTLFiles(query);
    printFiles = generatedSTLs.slice(0, 5 - stlFiles.length);
  }
  
  // Combine: STL files first, then other products
  results = [...printFiles, ...stlFiles, ...otherProducts];
  
  // Shuffle
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }
  
  // Dedupe
  const seen = new Set<string>();
  return results.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 40);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  
  if (!query) {
    return NextResponse.json({ results: [], message: "No query provided" });
  }
  
  const results = getProductsForQuery(query);
  const printableIdeas = generatePrintableIdeas(query);
  
  return NextResponse.json({
    results,
    printableIdeas,
    count: results.length,
    query,
  });
}
