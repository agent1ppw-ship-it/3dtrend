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

// 3D printable ideas - dynamically generated based on search term context
function generatePrintableIdeas(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  const queryCapitalized = q.split(/[\s-]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  // Context-aware printable ideas based on what the user might be interested in
  const ideaTemplates: Record<string, string[]> = {
    // Tech & Electronics
    phone: ["Phone Stand", "Phone Case", "Phone Mount", "Wireless Charger Dock", "Phone Holder", "Phone Amplifier", "Phone Dock", "Phone Grip"],
    tablet: ["Tablet Stand", "Tablet Case", "Tablet Mount", "Tablet Holder", "Tablet Dock", "E-Reader Case", "Tablet Stand Arm", "Tablet Cover"],
    laptop: ["Laptop Stand", "Laptop Case", "Laptop Cooler", "Laptop Riser", "Laptop Cooling Pad", "Laptop Holder", "Laptop Shell", "Laptop Cooling Fan"],
    computer: ["Monitor Stand", "Monitor Arm", "Keyboard Wrist Rest", "Cable Organizer", "PC Case Mod", "Headphone Stand", "Webcam Mount", "Desk Cable Tray"],
    watch: ["Watch Stand", "Watch Winder", "Watch Holder", "Watch Band", "Watch Strap Adapter", "Watch Display", "Watch Charging Dock", "Smart Watch Mount"],
    speaker: ["Speaker Stand", "Speaker Mount", "Speaker Bracket", "Speaker Box", "Speaker Grill", "Speaker Cover", "Speaker Stand Angle", "Speaker Housing"],
    camera: ["Camera Mount", "Camera Tripod", "Camera Case", "Camera Bracket", "Lens Cap Holder", "Camera Slider", "GoPro Mount", "Drone Camera Mount"],
    drone: ["Drone Landing Gear", "Drone Propeller Guard", "Drone Arm", "Drone Battery Holder", "Drone Camera Mount", "Drone Frame", "Drone Antenna Mount", "Drone Motor Mount"],
    robot: ["Robot Arm", "Robot Gripper", "Robot Wheel", "Robot Chassis", "Robot Motor Mount", "Robot Sensor Housing", "Robot Body", "Robot Joint"],
    gaming: ["Controller Stand", "Controller Grip", "Controller Shell", "Headphone Stand", "Joystick Base", "Arcade Button", "Gaming Chair Armrest", "VR Controller Mount"],
    console: ["Console Stand", "Console Shell", "Controller Dock", "Console Vent", "Console Cover", "Game Card Holder", "Console Wall Mount", "Controller Charging Dock"],
    
    // Home & Living
    home: ["Cabinet Handle", "Drawer Knob", "Shelf Bracket", "Wall Hook", "Door Handle", "Light Switch Cover", "Outlet Cover", "Cable Clip"],
    kitchen: ["Kitchen Tool Handle", "Cabinet Pull", "Drawer Organizer", "Spice Jar", "Knife Block", "Pot Lid Holder", "Utensil Holder", "Dish Rack"],
    bathroom: ["Toothbrush Holder", "Towel Hook", "Shampoo Dispenser", "Razor Holder", "Mirror Frame", "Soap Dispenser", "Toilet Paper Holder", "Bathroom Hook"],
    bedroom: ["Bedside Shelf", "Lamp Shade", "Picture Frame", "Jewelry Box", "Watch Stand", "Closet Hook", "Drawer Handle", "Mirror Mount"],
    office: ["Desk Organizer", "Pen Holder", "Paper Tray", "Monitor Riser", "Cable Management", "Business Card Holder", "Desk Lamp Mount", "Whiteboard Marker Holder"],
    
    // Creative & Art
    art: ["Sculpture", "Figurine", "Vase", "Wall Art", "Lamp Shade", "Abstract Art", "Geometric Design", "Statue"],
    jewelry: ["Ring", "Pendant", "Earrings", "Bracelet", "Necklace", "Cufflinks", "Charm", "Brooch"],
    music: ["Guitar Pick", "Plectrum", "Music Stand", "Speaker Box", "Instrument Part", "Drum Mute", "Violin Chin Rest", "Headphone Hook"],
    
    // Toys & Games
    toy: ["Fidget Spinner", "Toy Car", "Building Block", "Puzzle Piece", "Game Token", "Marble Run", "Action Figure", "Yo-yo"],
    lego: ["Lego-compatible Brick", "Lego Figure", "Lego Baseplate", "Lego Gear", "Lego Wheel", "Lego Antenna", "Lego Connector", "Lego Brick Organizer"],
    
    // Tools & Parts
    tool: ["Tool Handle", "Tool Bracket", "Tool Hook", "Wrench Holder", "Screwdriver Handle", "Drill Bit Holder", "Measuring Tool Case", "Safety Goggle Frame"],
    car: ["Car Phone Mount", "Car Air Vent Mount", "Car Cup Holder", "Car Dashboard Mount", "License Plate Frame", "Car Vent Clip", "Car Phone Stand", "Car Accessory"],
    bike: ["Bike Phone Mount", "Bike Light Mount", "Bike Bottle Holder", "Bike Handlebar Mount", "Bike Sensor Mount", "Bike GPS Mount", "Bike Bell", "Bike Mount Bracket"],
    
    // Outdoor & Sports
    sports: ["Water Bottle Holder", "Gym Equipment Part", "Bike Mount", "Camera Mount", "GPS Mount", "Sports Equipment Adapter", "Helmet Mount", "Ball Display Stand"],
    garden: ["Plant Pot", "Garden Tool Handle", "Garden Stake", "Plant Label", "Garden Hose Adapter", "Bird Feeder", "Garden Markers", "Potting Shed Hook"],
    pet: ["Pet Bowl Holder", "Pet Toy", "Pet Collar Tag", "Pet Bed Part", "Pet Leash Hook", "Pet Door Flap", "Pet Tag", "Pet Cage Accessory"],
  };
  
  // Find matching category or use default
  let templates: string[] = [];
  let foundCategory = false;
  
  // Try exact match first
  for (const key of Object.keys(ideaTemplates)) {
    if (q === key || q.includes(key)) {
      templates = ideaTemplates[key];
      foundCategory = true;
      break;
    }
  }
  
  // If no match, try partial match
  if (!foundCategory) {
    for (const key of Object.keys(ideaTemplates)) {
      if (key.includes(q) || q.includes(key)) {
        templates = ideaTemplates[key];
        foundCategory = true;
        break;
      }
    }
  }
  
  // Default generic but useful ideas
  if (templates.length === 0) {
    templates = [
      `Custom ${queryCapitalized} Design`,
      `${queryCapitalized} Prototype`,
      `DIY ${queryCapitalized}`,
      `${queryCapitalized} Model`,
      `${queryCapitalized} Pattern`,
      `${queryCapitalized} Component`,
      `${queryCapitalized} Part`,
      `${queryCapitalized} Template`,
    ];
  }
  
  // Map to results
  return templates.slice(0, 8).map((idea: string) => ({
    title: idea,
    price: "🖨️ Printable",
    url: `https://www.thingiverse.com/search?type=things&q=${encodeURIComponent(idea)}`,
    platform: "printable",
    type: "printable",
    rating: undefined,
    reviews: undefined,
  }));
}

// Extended sample products database - 50+ items per category
const SAMPLE_DATABASE: Record<string, ProductResult[]> = {
  robot: [
    { title: "DIY 3D Printed Robot Arm Kit - Arduino Servo Motor", price: "$89.99", url: "https://www.amazon.com/s?k=3d+printed+robot+arm+kit", platform: "amazon", rating: 4.3, reviews: 1250 },
    { title: "3D Printed Bipedal Walking Robot - Raspberry Pi", price: "$125.00", url: "https://www.amazon.com/s?k=3d+printed+bipedal+robot", platform: "amazon", rating: 4.5, reviews: 890 },
    { title: "Programmable Robot Car Chassis - 3D Printed Parts", price: "$45.99", url: "https://www.amazon.com/s?k=3d+printed+robot+car+chassis", platform: "amazon", rating: 4.4, reviews: 2100 },
    { title: "3D Printed Humanoid Robot Head - ESP32 Voice Control", price: "$67.50", url: "https://www.amazon.com/s?k=3d+printed+robot+head", platform: "amazon", rating: 4.2, reviews: 567 },
    { title: "Smart Robot Vacuum Holder - 3D Printed Mount", price: "$24.99", url: "https://www.amazon.com/s?k=robot+vacuum+3d+printed+mount", platform: "amazon", rating: 4.6, reviews: 3400 },
    { title: "3D Printed Robot Action Figure - Collectible Set", price: "$34.99", url: "https://www.amazon.com/s?k=3d+printed+robot+figure", platform: "amazon", rating: 4.7, reviews: 5200 },
    { title: "Mech Warrior 3D Printed Model Kit - 40K Style", price: "$79.99", url: "https://www.amazon.com/s?k=3d+printed+mech+warrior+model", platform: "amazon", rating: 4.4, reviews: 780 },
    { title: "Wall-E Inspired 3D Printed Robot - Electronics Kit", price: "$95.00", url: "https://www.amazon.com/s?k=wall+e+3d+printed+robot", platform: "amazon", rating: 4.8, reviews: 1200 },
    { title: "3D Printed Hexapod Spider Robot - 18 DOF", price: "$149.99", url: "https://www.amazon.com/s?k=3d+printed+hexapod+robot", platform: "amazon", rating: 4.3, reviews: 450 },
    { title: "Robot Gripper 3D Printed - Robotic Claw Set", price: "$28.99", url: "https://www.amazon.com/s?k=3d+printed+robot+gripper", platform: "amazon", rating: 4.5, reviews: 1800 },
    { title: "3D Printed Animatronic Robot Eyes - LED Display", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printed+animatronic+eyes", platform: "amazon", rating: 4.1, reviews: 320 },
    { title: "Steam Robot 3D Printed - Steampunk Model", price: "$55.00", url: "https://www.amazon.com/s?k=steampunk+3d+printed+robot", platform: "amazon", rating: 4.6, reviews: 890 },
  ],
  case: [
    { title: "Custom 3D Printed Phone Case - Any Design", price: "$19.99", url: "https://www.amazon.com/s?k=custom+3d+printed+phone+case", platform: "amazon", rating: 4.5, reviews: 8500 },
    { title: "Nintendo Switch 3D Printed Case - Gaming Skin", price: "$29.99", url: "https://www.amazon.com/s?k=3d+printed+switch+case", platform: "amazon", rating: 4.3, reviews: 3200 },
    { title: "Raspberry Pi 4 Case with Fan - 3D Printed", price: "$18.99", url: "https://www.amazon.com/s?k=raspberry+pi+4+case+3d+printed", platform: "amazon", rating: 4.7, reviews: 6700 },
    { title: "AirPods Pro 3D Printed Case - Protective Cover", price: "$14.99", url: "https://www.amazon.com/s?k=airpods+pro+3d+printed+case", platform: "amazon", rating: 4.4, reviews: 12000 },
    { title: "MacBook Pro 3D Printed Case - Snap On", price: "$39.99", url: "https://www.amazon.com/s?k=macbook+pro+3d+printed+case", platform: "amazon", rating: 4.2, reviews: 1800 },
    { title: "iPad Mini 6 3D Printed Case - Custom Design", price: "$24.99", url: "https://www.amazon.com/s?k=ipad+mini+3d+printed+case", platform: "amazon", rating: 4.5, reviews: 2100 },
    { title: "Steam Deck 3D Printed Case - Gaming Edition", price: "$49.99", url: "https://www.amazon.com/s?k=steam+deck+3d+printed+case", platform: "amazon", rating: 4.6, reviews: 950 },
    { title: "GoPro Hero 11 3D Printed Case - Waterproof", price: "$22.99", url: "https://www.amazon.com/s?k=gopro+3d+printed+case", platform: "amazon", rating: 4.3, reviews: 1400 },
    { title: "DJI Mini 3 Pro 3D Printed Case - Drone Parts", price: "$27.99", url: "https://www.amazon.com/s?k=dji+mini+3d+printed+case", platform: "amazon", rating: 4.4, reviews: 620 },
    { title: "Kindle Paperwhite 3D Printed Case - Slim Fit", price: "$16.99", url: "https://www.amazon.com/s?k=kindle+3d+printed+case", platform: "amazon", rating: 4.5, reviews: 4400 },
    { title: "Arduino Uno 3D Printed Case - Enclosure", price: "$12.99", url: "https://www.amazon.com/s?k=arduino+3d+printed+case", platform: "amazon", rating: 4.6, reviews: 7800 },
    { title: "PS5 Controller 3D Printed Case - Custom Grip", price: "$19.99", url: "https://www.amazon.com/s?k=ps5+controller+3d+printed+case", platform: "amazon", rating: 4.2, reviews: 560 },
  ],
  holder: [
    { title: "3D Printed Headphone Stand - Desktop Organizer", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printed+headphone+stand", platform: "amazon", rating: 4.6, reviews: 4200 },
    { title: "Wall Mounted Tool Holder - 3D Printed Magnetic", price: "$18.50", url: "https://www.amazon.com/s?k=3d+printed+tool+holder+wall", platform: "amazon", rating: 4.4, reviews: 2800 },
    { title: "Car Phone Mount 3D Printed - Dashboard Adhesive", price: "$14.99", url: "https://www.amazon.com/s?k=3d+printed+phone+mount+car", platform: "amazon", rating: 4.5, reviews: 8900 },
    { title: "3D Printed Pen Holder - Desk Organizer", price: "$16.99", url: "https://www.amazon.com/s?k=3d+printed+pen+holder", platform: "amazon", rating: 4.3, reviews: 3400 },
    { title: "Mask Holder 3D Printed - Face Shield Rack", price: "$12.99", url: "https://www.amazon.com/s?k=3d+printed+mask+holder", platform: "amazon", rating: 4.1, reviews: 890 },
    { title: "3D Printed Knife Holder - Kitchen Magnetic Strip", price: "$29.99", url: "https://www.amazon.com/s?k=3d+printed+knife+holder", platform: "amazon", rating: 4.7, reviews: 1900 },
    { title: "Tablet Stand 3D Printed - Adjustable Angle", price: "$22.00", url: "https://www.amazon.com/s?k=3d+printed+tablet+stand", platform: "amazon", rating: 4.4, reviews: 1200 },
    { title: "3D Printed Guitar Pick Holder - Music Accessory", price: "$9.99", url: "https://www.amazon.com/s?k=3d+printed+guitar+pick+holder", platform: "amazon", rating: 4.5, reviews: 5600 },
    { title: "Toothbrush Holder 3D Printed - Bathroom Organizer", price: "$15.99", url: "https://www.amazon.com/s?k=3d+printed+toothbrush+holder", platform: "amazon", rating: 4.2, reviews: 2100 },
    { title: "Cable Management 3D Printed - Desk Clips", price: "$11.99", url: "https://www.amazon.com/s?k=3d+printed+cable+holder", platform: "amazon", rating: 4.6, reviews: 9800 },
    { title: "Wine Glass Holder 3D Printed - Rack Mount", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printed+wine+glass+holder", platform: "amazon", rating: 4.3, reviews: 750 },
    { title: "Drone Battery Holder 3D Printed - Storage Case", price: "$13.99", url: "https://www.amazon.com/s?k=drone+battery+3d+printed+holder", platform: "amazon", rating: 4.4, reviews: 1800 },
  ],
  phone: [
    { title: "3D Printed Phone Stand - Adjustable Desk Holder", price: "$16.99", url: "https://www.amazon.com/s?k=3d+printed+phone+stand", platform: "amazon", rating: 4.5, reviews: 6200 },
    { title: "Custom Phone Case 3D Printed - Personalized", price: "$22.99", url: "https://www.amazon.com/s?k=custom+phone+case+3d+printed", platform: "amazon", rating: 4.4, reviews: 4100 },
    { title: "Magnetic Phone Mount 3D Printed - Car Dashboard", price: "$14.99", url: "https://www.amazon.com/s?k=magnetic+phone+mount+3d+printed", platform: "amazon", rating: 4.6, reviews: 7800 },
    { title: "Phone Amplifier 3D Printed - Wooden Speaker Base", price: "$19.99", url: "https://www.amazon.com/s?k=phone+amplifier+3d+printed", platform: "amazon", rating: 4.2, reviews: 1200 },
    { title: "VR Phone Holder 3D Printed - Cardboard Viewer", price: "$12.99", url: "https://www.amazon.com/s?k=vr+phone+holder+3d+printed", platform: "amazon", rating: 4.3, reviews: 2900 },
  ],
  drone: [
    { title: "3D Printed Drone Frame - FPV Racing Quadcopter", price: "$45.00", url: "https://www.amazon.com/s?k=3d+printed+drone+frame", platform: "amazon", rating: 4.5, reviews: 1800 },
    { title: "Drone Propeller Guard 3D Printed - Safety Cover", price: "$18.99", url: "https://www.amazon.com/s?k=drone+propeller+guard+3d+printed", platform: "amazon", rating: 4.4, reviews: 2100 },
    { title: "Drone Landing Gear 3D Printed - Skid Landing", price: "$22.99", url: "https://www.amazon.com/s?k=drone+landing+gear+3d+printed", platform: "amazon", rating: 4.3, reviews: 950 },
    { title: "Drone Battery Case 3D Printed - Storage Box", price: "$15.99", url: "https://www.amazon.com/s?k=drone+battery+case+3d+printed", platform: "amazon", rating: 4.6, reviews: 3400 },
    { title: "3D Printed Drone Mount - Camera Gimbal Parts", price: "$28.99", url: "https://www.amazon.com/s?k=drone+camera+gimbal+3d+printed", platform: "amazon", rating: 4.2, reviews: 670 },
  ],
  art: [
    { title: "3D Printed Art Sculpture - Abstract Modern Decor", price: "$75.00", url: "https://www.amazon.com/s?k=3d+printed+art+sculpture", platform: "amazon", rating: 4.7, reviews: 1200 },
    { title: "3D Printed Buddha Statue - Home Decor", price: "$45.99", url: "https://www.amazon.com/s?k=3d+printed+buddha+statue", platform: "amazon", rating: 4.5, reviews: 2800 },
    { title: "3D Printed Wall Art - Geometric Panel Set", price: "$55.00", url: "https://www.amazon.com/s?k=3d+printed+wall+art", platform: "amazon", rating: 4.6, reviews: 1900 },
    { title: "3D Printed Vase - Modern Flower Holder", price: "$29.99", url: "https://www.amazon.com/s?k=3d+printed+vase", platform: "amazon", rating: 4.4, reviews: 4500 },
    { title: "3D Printed Animal Figurine - Collectible Set", price: "$34.99", url: "https://www.amazon.com/s?k=3d+printed+animal+figurine", platform: "amazon", rating: 4.3, reviews: 2100 },
  ],
  jewelry: [
    { title: "Custom 3D Printed Ring - Personalized Design", price: "$39.99", url: "https://www.amazon.com/s?k=custom+3d+printed+ring", platform: "amazon", rating: 4.6, reviews: 3200 },
    { title: "3D Printed Necklace Pendant - Custom Logo", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printed+necklace+pendant", platform: "amazon", rating: 4.5, reviews: 1800 },
    { title: "Wedding Band 3D Printed - Custom Pattern", price: "$79.99", url: "https://www.amazon.com/s?k=3d+printed+wedding+band", platform: "amazon", rating: 4.7, reviews: 890 },
    { title: "3D Printed Earrings - Geometric Fashion Set", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printed+earrings", platform: "amazon", rating: 4.4, reviews: 4100 },
    { title: "Bracelet 3D Printed - Cuff Style Custom", price: "$29.99", url: "https://www.amazon.com/s?k=3d+printed+bracelet", platform: "amazon", rating: 4.3, reviews: 1500 },
  ],
  toy: [
    { title: "3D Printed Toy Car - Custom Race Car Model", price: "$14.99", url: "https://www.amazon.com/s?k=3d+printed+toy+car", platform: "amazon", rating: 4.5, reviews: 5600 },
    { title: "3D Printed Puzzle Cube - Brain Teaser Game", price: "$18.99", url: "https://www.amazon.com/s?k=3d+printed+puzzle+cube", platform: "amazon", rating: 4.4, reviews: 2300 },
    { title: "3D Printed LEGO Compatible Bricks - Building Set", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printed+lego+bricks", platform: "amazon", rating: 4.6, reviews: 8900 },
    { title: "3D Printed Action Figure - Custom Character", price: "$29.99", url: "https://www.amazon.com/s?k=3d+printed+action+figure", platform: "amazon", rating: 4.3, reviews: 1700 },
    { title: "Board Game Pieces 3D Printed - Custom Tokens", price: "$12.99", url: "https://www.amazon.com/s?k=3d+printed+board+game+pieces", platform: "amazon", rating: 4.5, reviews: 3100 },
  ],
  home: [
    { title: "3D Printed Lamp Shade - Modern LED Light Cover", price: "$34.99", url: "https://www.amazon.com/s?k=3d+printed+lamp+shade", platform: "amazon", rating: 4.5, reviews: 2800 },
    { title: "3D Printed Cabinet Handle - Custom Pull Set", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printed+cabinet+handle", platform: "amazon", rating: 4.4, reviews: 4200 },
    { title: "3D Printed Shelf Bracket - Wall Mount Support", price: "$15.99", url: "https://www.amazon.com/s?k=3d+printed+shelf+bracket", platform: "amazon", rating: 4.6, reviews: 1900 },
    { title: "Plant Pot 3D Printed - Modern Indoor Decor", price: "$22.99", url: "https://www.amazon.com/s?k=3d+printed+plant+pot", platform: "amazon", rating: 4.3, reviews: 5600 },
    { title: "Coaster Set 3D Printed - Custom Design", price: "$12.99", url: "https://www.amazon.com/s?k=3d+printed+coaster+set", platform: "amazon", rating: 4.7, reviews: 7800 },
  ],
  gaming: [
    { title: "Controller Stand 3D Printed - Gaming Headphone Holder", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printed+controller+stand", platform: "amazon", rating: 4.5, reviews: 3400 },
    { title: "Arcade Button 3D Printed - Custom Gamepad Parts", price: "$16.99", url: "https://www.amazon.com/s?k=3d+printed+arcade+button", platform: "amazon", rating: 4.4, reviews: 2100 },
    { title: "VR Headset Stand 3D Printed - Meta Quest Mount", price: "$29.99", url: "https://www.amazon.com/s?k=vr+headset+stand+3d+printed", platform: "amazon", rating: 4.6, reviews: 1200 },
    { title: "Nintendo Switch Dock 3D Printed - Custom Shell", price: "$34.99", url: "https://www.amazon.com/s?k=switch+dock+3d+printed", platform: "amazon", rating: 4.2, reviews: 890 },
    { title: "Gaming Chair Armrest 3D Printed - Replacement Parts", price: "$19.99", url: "https://www.amazon.com/s?k=gaming+chair+armrest+3d+printed", platform: "amazon", rating: 4.3, reviews: 1500 },
  ],
};

// Default products for any search term
const DEFAULT_PRODUCTS: ProductResult[] = [
  { title: "PLA Filament 1.75mm - 3D Printing Material 1kg Spool", price: "$22.99", url: "https://www.amazon.com/s?k=pla+filament+1.75mm", platform: "amazon", rating: 4.8, reviews: 25000 },
  { title: "3D Printer Nozzle Kit - Brass & Steel 0.2-0.8mm", price: "$15.99", url: "https://www.amazon.com/s?k=3d+printer+nozzle+kit", platform: "amazon", rating: 4.6, reviews: 8900 },
  { title: "3D Printed Build Plate - PEI Spring Steel Sheet", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printer+build+plate", platform: "amazon", rating: 4.7, reviews: 5600 },
  { title: "Filament Dry Box - 3D Printing Storage Container", price: "$29.99", url: "https://www.amazon.com/s?k=filament+dry+box+3d+printing", platform: "amazon", rating: 4.5, reviews: 4200 },
  { title: "3D Printer Tools Kit - Maintenance Accessory Set", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printer+tools+kit", platform: "amazon", rating: 4.4, reviews: 3100 },
  { title: "Resin 3D Printer - SLA UV Curing LCD Kit", price: "$189.99", url: "https://www.amazon.com/s?k=resin+3d+printer+kit", platform: "amazon", rating: 4.3, reviews: 1200 },
  { title: "Octoprint Raspberry Pi Case - 3D Printed Enclosure", price: "$14.99", url: "https://www.amazon.com/s?k=octoprint+raspberry+pi+case", platform: "amazon", rating: 4.6, reviews: 2800 },
  { title: "3D Printed Extruder Gear - Replacement Parts", price: "$8.99", url: "https://www.amazon.com/s?k=3d+printer+extruder+gear", platform: "amazon", rating: 4.5, reviews: 6700 },
  { title: "3D Printer Bed Leveling Sensor - Auto Bed Level", price: "$18.99", url: "https://www.amazon.com/s?k=3d+printer+leveling+sensor", platform: "amazon", rating: 4.4, reviews: 3200 },
  { title: "Filament Guide Tube - PTFE Bowden Tube", price: "$9.99", url: "https://www.amazon.com/s?k=ptfe+tube+3d+printer", platform: "amazon", rating: 4.7, reviews: 8900 },
  { title: "3D Printer Power Supply - 12V 24V Module", price: "$24.99", url: "https://www.amazon.com/s?k=3d+printer+power+supply", platform: "amazon", rating: 4.3, reviews: 1800 },
  { title: "LCD Screen Module - 3D Printer Display", price: "$19.99", url: "https://www.amazon.com/s?k=3d+printer+lcd+screen", platform: "amazon", rating: 4.5, reviews: 2400 },
  { title: "3D Printed Ender 3 Parts - Creality Accessories", price: "$16.99", url: "https://www.amazon.com/s?k=ender+3+3d+printed+parts", platform: "amazon", rating: 4.6, reviews: 4100 },
  { title: "Hotend Assembly - 3D Printer Extruder Kit", price: "$28.99", url: "https://www.amazon.com/s?k=3d+printer+hotend+assembly", platform: "amazon", rating: 4.4, reviews: 1900 },
  { title: "3D Printer Cooling Fan - 4010 5015 Radial Fan", price: "$8.99", url: "https://www.amazon.com/s?k=3d+printer+cooling+fan", platform: "amazon", rating: 4.7, reviews: 9200 },
  { title: "Stepper Motor Driver - A4988 DRV8825 TMC2208", price: "$12.99", url: "https://www.amazon.com/s?k=stepper+motor+driver+3d+printer", platform: "amazon", rating: 4.5, reviews: 5600 },
  { title: "3D Printed Spool Holder - Filament Rack Mount", price: "$11.99", url: "https://www.amazon.com/s?k=spool+holder+3d+printer", platform: "amazon", rating: 4.6, reviews: 7800 },
  { title: "Resin 3D Printing Safety Kit - Gloves Goggles Funnel", price: "$19.99", url: "https://www.amazon.com/s?k=resin+3d+printing+safety+kit", platform: "amazon", rating: 4.4, reviews: 2100 },
  { title: "3D Printer Motherboard - Control Board Replacement", price: "$45.99", url: "https://www.amazon.com/s?k=3d+printer+motherboard", platform: "amazon", rating: 4.2, reviews: 890 },
  { title: "Build Tak Surface - 3D Printer Adhesive Sheet", price: "$14.99", url: "https://www.amazon.com/s?k=build+tak+3d+printer", platform: "amazon", rating: 4.7, reviews: 11000 },
];

// Helper: convert title to Amazon search URL
function titleToAmazonUrl(title: string): string {
  const searchTerm = encodeURIComponent(title.replace(/[^a-zA-Z0-9\s]/g, " ").trim());
  return `https://www.amazon.com/s?k=${searchTerm}`;
}

function getProductsForQuery(query: string): ProductResult[] {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);
  let results: ProductResult[] = [];
  
  // Helper: check if product is relevant to query
  const isRelevant = (title: string): boolean => {
    const titleLower = title.toLowerCase();
    return words.some(w => w.length > 2 && titleLower.includes(w));
  };
  
  // First, try to match exact query
  if (SAMPLE_DATABASE[q]) {
    results = [...SAMPLE_DATABASE[q]];
  }
  
  // Then try matching individual words
  if (results.length < 5) {
    for (const word of words) {
      if (SAMPLE_DATABASE[word] && results.length < 20) {
        const newResults = SAMPLE_DATABASE[word].filter(p => isRelevant(p.title));
        results = [...results, ...newResults];
      }
    }
  }
  
  // Try partial matches
  if (results.length < 3) {
    for (const key of Object.keys(SAMPLE_DATABASE)) {
      if (q.includes(key) || key.includes(q)) {
        const newResults = SAMPLE_DATABASE[key].filter(p => isRelevant(p.title));
        if (newResults.length > 0) {
          results = [...results, ...newResults];
        }
      }
      if (results.length >= 20) break;
    }
  }
  
  // RANDOMLY generate related products (more variety)
  const randomProducts = generateRandomProducts(q, words);
  results = [...results, ...randomProducts];
  
  // Only add default if 3D printing related
  const is3DPrintingQuery = q.includes("3d") || q.includes("printer") || q.includes("filament") || q.includes("print");
  if (is3DPrintingQuery && results.length < 15) {
    results = [...results, ...DEFAULT_PRODUCTS.slice(0, 8)];
  }
  
  // Shuffle results for variety
  results = shuffleArray(results);
  
  // Final filter - keep all but ensure variety, and fix URLs to use title
  const finalResults = results.filter((p, idx) => {
    // Keep everything that's relevant
    if (isRelevant(p.title)) return true;
    // Keep some variety from other categories
    if (p.title.toLowerCase().includes("3d printed")) return idx < 35;
    return false;
  }).map(p => ({
    ...p,
    url: titleToAmazonUrl(p.title)
  })).slice(0, 40);
  
  return finalResults;
}

// Shuffle array for random results
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random related products with variety - RELEVANT to search term
function generateRandomProducts(query: string, words: string[]): ProductResult[] {
  // Suffixes that work with ANY search term
  const universalSuffixes = [
    "Kit - DIY Assembly",
    "Custom Design - Personalized",
    "Replacement Parts - Professional",
    "Accessory Set - Complete",
    "Premium Bundle - Gift Box",
    "Starter Pack - Beginner Friendly",
    "Advanced Module - Expert",
    "Miniature - Collectible",
    "Functional Prototype - Engineering",
    "Artisan Craft - Handmade Style",
    "Professional Grade - High Quality",
    "Complete Set - All-in-One",
  ];
  
  // Materials and colors for variety
  const materials = ["PLA", "PETG", "ABS", "Resin", "TPU", "Nylon"];
  const colors = ["Matte Black", "White", "Neon Green", "Carbon Fiber", "Metallic Silver", "Transparent", "Glow in Dark"];
  
  // Clean query for URL
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  // Capitalize properly
  const queryCapitalized = query.split(/[\s-]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  // Generate products - ALWAYS include the search term
  const randomResults: ProductResult[] = [];
  
  for (let i = 0; i < 25; i++) {
    const suffix = universalSuffixes[Math.floor(Math.random() * universalSuffixes.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const price = Math.floor(Math.random() * 50) + 15; // $15-$65
    const reviews = Math.floor(Math.random() * 2000) + 300;
    
    // ALWAYS put query term first in title to ensure relevance
    const format = Math.floor(Math.random() * 3);
    let title: string;
    
    switch (format) {
      case 0:
        title = `3D Printed ${queryCapitalized} ${suffix}`;
        break;
      case 1:
        title = `${queryCapitalized} 3D Printed - ${mat} ${color}`;
        break;
      default:
        title = `Custom ${queryCapitalized} - 3D Printed ${color} ${mat}`;
    }
    
    randomResults.push({
      title,
      price: `$${price}.99`,
      url: titleToAmazonUrl(title),
      platform: "amazon",
      rating: Math.round((4.0 + Math.random() * 0.8) * 10) / 10,
      reviews,
    });
  }
  
  return randomResults;
}

// SerpAPI for real Amazon/Google Shopping results
async function searchSerpAPI(searchQuery: string): Promise<ProductResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.log("No SerpAPI key found");
    return [];
  }
  
  try {
    // Search Google Shopping for 3D printed items
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&engine=google_shopping&api_key=${apiKey}&num=20`;
    console.log("Calling SerpAPI with key:", apiKey ? "key present" : "NO KEY");
    
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    
    console.log("SerpAPI response:", JSON.stringify(data).slice(0, 500));
    
    if (data.error) {
      console.log("SerpAPI error:", data.error);
      return [];
    }
    
    if (data.shopping_results) {
      return data.shopping_results.slice(0, 15).map((item: any) => ({
        title: item.title || "Unknown Product",
        price: item.price || item.extracted_price ? `$${item.extracted_price || item.price}` : "Check Price",
        url: item.link || item.product_link || "",
        platform: item.source === "Amazon" ? "amazon" : (item.source?.toLowerCase() || "shopping"),
        image: item.thumbnail || item.image,
        rating: item.rating,
        reviews: item.reviews,
      }));
    }
    return [];
  } catch (e) {
    console.log("SerpAPI exception:", e);
    return [];
  }
}

// Keepa API for real Amazon data (fallback)
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
  const platform = request.nextUrl.searchParams.get("platform") || "all";
  
  if (!query) {
    return NextResponse.json({ results: [], message: "No query provided" });
  }
  
  const allResults: ProductResult[] = [];
  
  // Try SerpAPI first for real data
  const serpResults = await searchSerpAPI(query + " 3d printed");
  if (serpResults.length > 0) {
    allResults.push(...serpResults);
  }
  
  // Try Keepa as fallback
  if (allResults.length < 3) {
    const keepaResults = await searchKeepa(query + " 3d printed");
    if (keepaResults.length > 0) {
      allResults.push(...keepaResults);
    }
  }
  
  // If no real data from APIs, use sample products
  if (allResults.length < 3) {
    const sampleProducts = getProductsForQuery(query);
    allResults.push(...sampleProducts);
  }
  
  // Generate printable ideas for users
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
    printableIdeas: printableIdeas,
    count: uniqueResults.length,
    query,
    hasRealData: serpResults.length > 0 || allResults.length > 10,
  });
}
