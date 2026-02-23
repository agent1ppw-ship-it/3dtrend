"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ExternalLink, Package, Sparkles } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface SearchResult {
  title: string;
  price: string;
  url: string;
  platform: string;
  category?: string;
  image?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/search");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchCategory = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearching(true);
    try {
      const res = await fetch(`/api/search?category=${categoryId}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedCategory(null);
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const platformColors: Record<string, string> = {
    amazon: "bg-orange-500",
    ebay: "bg-blue-500",
    etsy: "bg-yellow-500",
  };

  const categoryIcons: Record<string, string> = {
    "amazon-devices": "📱",
    "appliances": "🏠",
    "arts-crafts": "🎨",
    "automotive": "🚗",
    "baby": "👶",
    "beauty": "💄",
    "books": "📚",
    "cds-vinyl": "💿",
    "cell-phones": "📞",
    "clothing": "👕",
    "collectibles": "🏆",
    "computers": "💻",
    "electronics": "📺",
    "gift-cards": "🎁",
    "grocery": "🍎",
    "health": "💊",
    "home-kitchen": "🍳",
    "industrial": "🏭",
    "luggage": "🧳",
    "movies-tv": "🎬",
    "musical-instruments": "🎸",
    "office": "📎",
    "patio-garden": "🌿",
    "pet-supplies": "🐕",
    "software": "💾",
    "sports": "⚽",
    "tools": "🔧",
    "toys": "🎮",
    "video-games": "🎯",
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
            <Link href="/categories" className="text-[#22c55e] font-medium">Categories</Link>
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

        {/* Category Header */}
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-6 h-6 text-[#22c55e]" />
          <h2 className="text-2xl font-bold">Browse 3D Printed Items by Category</h2>
        </div>
        
        {selectedCategory && (
          <button
            onClick={() => { setSelectedCategory(null); setResults([]); }}
            className="text-zinc-400 hover:text-white mb-4"
          >
            ← Back to all categories
          </button>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : selectedCategory ? (
          /* Results for selected category */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#22c55e]" />
              <p className="text-zinc-400">
                {searching ? "Searching..." : `${results.length} 3D printed items found`}
              </p>
            </div>
            
            {searching ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-zinc-400 mt-4">Finding 3D printed products...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition">
                    {item.image && (
                      <img src={item.image} alt="" className="w-16 h-16 object-contain rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${platformColors[item.platform]} text-white`}>
                          {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                        </span>
                        {item.category && (
                          <span className="text-zinc-500 text-xs">{item.category}</span>
                        )}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-medium hover:text-[#22c55e] transition block truncate"
                      >
                        {item.title}
                      </a>
                      <p className="text-[#22c55e] font-bold mt-1">{item.price}</p>
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
            ) : (
              <div className="text-center py-12 bg-zinc-900 rounded-xl">
                <p className="text-zinc-400">No 3D printed items found in this category.</p>
                <p className="text-zinc-500 text-sm mt-2">Try a different category or search term.</p>
              </div>
            )}
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => searchCategory(cat.id)}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#22c55e] transition text-left group"
              >
                <span className="text-2xl mb-2 block">{categoryIcons[cat.id] || "📦"}</span>
                <h3 className="font-medium text-white group-hover:text-[#22c55e] transition line-clamp-2">
                  {cat.name}
                </h3>
                <p className="text-zinc-500 text-sm mt-1">3D printed items →</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
