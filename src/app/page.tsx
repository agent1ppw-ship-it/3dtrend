import Link from "next/link";
import { Search } from "lucide-react";

export default function Home() {
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
            <Link href="/" className="text-zinc-400 hover:text-white transition">Home</Link>
            <Link href="/pricing" className="text-zinc-400 hover:text-white transition">Pricing</Link>
            <Link href="/login" className="text-zinc-400 hover:text-white transition">Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Find Trending <span className="text-[#22c55e]">3D Printed</span> Products
        </h1>
        <p className="text-xl text-zinc-400 mb-10">
          Discover profitable 3D printed items for sale across Amazon, eBay, Etsy, and more.
        </p>

        {/* Search Box */}
        <form action="/dashboard" className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                name="q"
                placeholder="Search for 3D printed products..."
                className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-lg focusoutline-none focus:border-[#22c55e] transition"
                required
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

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="w-12 h-12 bg-[#22c55e]/20 rounded-xl flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-[#22c55e]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Search</h3>
            <p className="text-zinc-400">Search across multiple marketplaces instantly</p>
          </div>
          <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="w-12 h-12 bg-[#22c55e]/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Market Trends</h3>
            <p className="text-zinc-400">See search volume and sales data</p>
          </div>
          <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="w-12 h-12 bg-[#22c55e]/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
            <p className="text-zinc-400">Bookmark items for later reference</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-zinc-500">
          <p>© 2026 3DTrend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
