"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";

interface SearchResult {
  title: string;
  price: string;
  url: string;
  platform: "amazon" | "ebay" | "etsy";
  image?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [platform, setPlatform] = useState("all");
  const [savedItems, setSavedItems] = useState<string[]>([]);

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

  const toggleSave = (url: string) => {
    setSavedItems(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const platformColors = {
    amazon: "bg-orange-500",
    ebay: "bg-blue-500",
    etsy: "bg-yellow-500",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">3</span>
            </div>
            <span className="font-bold text-xl">3DTrend</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-zinc-400 hover:text-white transition">Home</a>
            <a href="/pricing" className="text-zinc-400 hover:text-white transition">Pricing</a>
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

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setPlatform("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              platform === "all" ? "bg-[#22c55e] text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setPlatform("amazon")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              platform === "amazon" ? "bg-orange-500 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            Amazon
          </button>
          <button
            onClick={() => setPlatform("ebay")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              platform === "ebay" ? "bg-blue-500 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            eBay
          </button>
          <button
            onClick={() => setPlatform("etsy")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              platform === "etsy" ? "bg-yellow-500 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            Etsy
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Searching for 3D printed products...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-zinc-400 mb-4">{results.length} results found</p>
            {results.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${platformColors[item.platform]} text-white`}>
                      {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSave(item.url)}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition"
                  >
                    {savedItems.includes(item.url) ? (
                      <BookmarkCheck className="w-5 h-5 text-[#22c55e]" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-zinc-400" />
                    )}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-zinc-800 transition"
                  >
                    <ExternalLink className="w-5 h-5 text-zinc-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">No results found. Try a different search term.</p>
          </div>
        ) : (
          <div className="text-center py-12">
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
