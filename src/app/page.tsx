import Link from "next/link";
import { TrendingUp, Flame, Star, Download, ExternalLink } from "lucide-react";

// Trending 3D printing data
const TRENDING_DATA = {
  categories: [
    { id: "robot", name: "Robotics & Automation", icon: "🤖", count: 12500 },
    { id: "home", name: "Home Decor & Organization", icon: "🏠", count: 9800 },
    { id: "gaming", name: "Gaming Accessories", icon: "🎮", count: 8400 },
    { id: "wearables", name: "Wearables & Fashion", icon: "👕", count: 7200 },
    { id: "toy", name: "Toys & Games", icon: "🎲", count: 6800 },
    { id: "art", name: "Art & Sculptures", icon: "🎨", count: 5900 },
    { id: "tool", name: "Tools & Gadgets", icon: "🔧", count: 5500 },
    { id: "jewelry", name: "Jewelry & Accessories", icon: "💍", count: 4800 },
  ],
  popular: [
    { title: "Bipedal Walking Robot", downloads: 45000, rating: 4.9, platform: "thingiverse" },
    { title: "Phone Stand with Cable Management", downloads: 38000, rating: 4.8, platform: "thingiverse" },
    { title: "Articulated Dragon", downloads: 32000, rating: 4.9, platform: "thingiverse" },
    { title: "Parametric Vase", downloads: 28000, rating: 4.7, platform: "printables" },
    { title: "Customizable Ring", downloads: 25000, rating: 4.8, platform: "thingiverse" },
    { title: "Fidget Spinner Collection", downloads: 22000, rating: 4.6, platform: "thingiverse" },
    { title: "Raspberry Pi Case", downloads: 20000, rating: 4.9, platform: "printables" },
    { title: "Cable Clip Set", downloads: 18000, rating: 4.7, platform: "thingiverse" },
  ],
  newThisWeek: [
    { title: "Foldable Phone Stand", price: "Free", platform: "thingiverse" },
    { title: "Modular Desk Organizer", price: "Free", platform: "printables" },
    { title: "Gaming Controller Stand", price: "Free", platform: "thingiverse" },
    { title: "Smart Watch Dock", price: "Free", platform: "printables" },
    { title: "Adjustable Tablet Mount", price: "Free", platform: "thingiverse" },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">3</span>
              </div>
              <span className="font-bold text-xl">3DTrend</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-[#22c55e] font-medium">Trending</Link>
            <Link href="/pricing" className="text-zinc-400 hover:text-white transition">Pricing</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-[#22c55e]" />
            <h1 className="text-4xl font-bold">Trending 3D Prints</h1>
          </div>
          <p className="text-zinc-400 text-lg">Discover what's popular in the 3D printing community</p>
        </div>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Trending Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRENDING_DATA.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/dashboard?q=${cat.id}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-[#22c55e] transition group"
              >
                <span className="text-3xl mb-2 block">{cat.icon}</span>
                <h3 className="font-medium text-white group-hover:text-[#22c55e] transition">{cat.name}</h3>
                <p className="text-zinc-500 text-sm">{cat.count.toLocaleString()} prints</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Most Popular */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Most Popular
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {TRENDING_DATA.popular.slice(0, 4).map((item, i) => (
              <a
                key={i}
                href={`https://www.${item.platform}.com/search?q=${encodeURIComponent(item.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-[#22c55e] transition group"
              >
                <span className="text-2xl font-bold text-zinc-700 w-8">{i + 1}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-white group-hover:text-[#22c55e]">{item.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {item.downloads.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {item.rating}
                    </span>
                  </div>
                </div>
                <span className="text-[#22c55e] text-sm capitalize">{item.platform}</span>
              </a>
            ))}
          </div>
        </section>

        {/* New This Week */}
        <section>
          <h2 className="text-2xl font-bold mb-6">🆕 New This Week</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRENDING_DATA.newThisWeek.map((item, i) => (
              <a
                key={i}
                href={`https://www.${item.platform}.com/search?q=${encodeURIComponent(item.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-green-500 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium group-hover:text-green-500">{item.title}</span>
                  <span className="text-green-500 text-sm">{item.price}</span>
                </div>
                <span className="text-zinc-500 text-sm capitalize">{item.platform}</span>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-zinc-400 mb-4">Explore thousands of free STL files on Thingiverse and Printables</p>
        </div>
      </main>
    </div>
  );
}
