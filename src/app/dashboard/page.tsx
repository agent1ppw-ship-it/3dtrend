"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ExternalLink, TrendingUp, TrendingDown, Minus, Package } from "lucide-react";

interface SearchResult {
  title: string;
  price: string;
  url: string;
  platform: string;
  image?: string;
}

interface TrendsData {
  interest: number;
  trend: "up" | "down" | "stable";
  dataPoints: number;
}

const PLATFORMS = [
  { id: "all", name: "All Platforms" },
  { id: "thingiverse", name: "Thingiverse", color: "bg-green-600" },
  { id: "printables", name: "Printables", color: "bg-orange-600" },
  { id: "etsy", name: "Etsy", color: "bg-yellow-500" },
  { id: "ebay", name: "eBay", color: "bg-blue-500" },
  { id: "facebook", name: "Facebook", color: "bg-blue-600" },
  { id: "shopify", name: "Shopify", color: "bg-green-500" },
  { id: "amazon", name: "Amazon", color: "bg-orange-500" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [platform, setPlatform] = useState("all");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&platform=${platform}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform);
    if (query) {
      performSearch(searchQuery);
    }
  };

  const getPlatformColor = (p: string) => {
    const plat = PLATFORMS.find(pl => pl.id === p);
    return plat?.color || "bg-zinc-500";
  };

  const getPlatformName = (p: string) => {
    const plat = PLATFORMS.find(pl => pl.id === p);
    return plat?.name || p;
  };

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
            <Link href="/" className="text-zinc-400 hover:text-white transition">Home</Link>
            <Link href="/categories" className="text-zinc-400 hover:text-white transition">Categories</Link>
            <Link href="/pricing" className="text-zinc-400 hover:text-white transition">Pricing</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for 3D printed products..."
                className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-lg focusoutline-none focus:border-[#22c55e] transition"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-[#22c55e] text-black font-semibold rounded-xl hover:bg-[#16a34a] transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Platform Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePlatformChange(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                platform === p.id 
                  ? `${p.color} text-white` 
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Searching across marketplaces...</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-zinc-400 mb-4">{results.length} results found</p>
            <div className="space-y-4">
              {results.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition">
                  {item.image && (
                    <img src={item.image} alt="" className="w-16 h-16 object-contain rounded bg-zinc-800" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPlatformColor(item.platform)} text-white`}>
                        {getPlatformName(item.platform)}
                      </span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium hover:text-[#22c55e] transition block truncate"
                    >
                      {item.title}
                    </a>
                    <p className="text-[#22c55e] font-bold text-lg mt-1">{item.price}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-zinc-800 transition"
                  >
                    <ExternalLink className="w-5 h-5 text-zinc-400" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-12 bg-zinc-900 rounded-xl">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No results found. Try a different search term.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Enter a search term to find 3D printed products</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
