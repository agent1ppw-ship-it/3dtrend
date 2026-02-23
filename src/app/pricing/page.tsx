import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: 0,
      features: [
        "Search 3D printed products",
        "View marketplace listings",
        "Basic search results",
        "Limited searches per day",
      ],
    },
    {
      name: "Pro",
      price: 12.99,
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited searches",
        "Export to CSV",
        "Save favorites",
        "Priority support",
      ],
    },
    {
      name: "Business",
      price: 49.99,
      features: [
        "Everything in Pro",
        "API access",
        "White label reports",
        "Team collaboration",
        "Custom integrations",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">3</span>
            </div>
            <span className="font-bold text-xl">3DTrend</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-zinc-400 hover:text-white transition">Home</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-zinc-400 text-lg">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-zinc-900 border rounded-2xl p-8 ${
                plan.popular ? "border-[#22c55e] ring-1 ring-[#22c55e]" : "border-zinc-800"
              }`}
            >
              {plan.popular && (
                <span className="bg-[#22c55e] text-black text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h2 className="text-2xl font-bold mt-4">{plan.name}</h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-zinc-400">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-zinc-300">
                    <Check className="w-5 h-5 text-[#22c55e]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 px-6 rounded-lg font-medium transition ${
                  plan.price === 0
                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                    : plan.popular
                    ? "bg-[#22c55e] text-black hover:bg-[#16a34a]"
                    : "bg-zinc-100 text-black hover:bg-white"
                }`}
              >
                {plan.price === 0 ? "Get Started Free" : `Subscribe for $${plan.price}/mo`}
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-zinc-500">
          <p>© 2026 3DTrend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
