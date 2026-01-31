const plans = [
  {
    name: "Standard",
    price: "$49",
    description: "Perfect for individual developers",
    features: [
      "Full source code",
      "1 developer license",
      "Unlimited projects",
      "6 months of updates",
      "Email support"
    ],
    highlighted: false
  },
  {
    name: "Extended",
    price: "$149",
    description: "Best for teams and agencies",
    features: [
      "Full source code",
      "Unlimited developers (same team)",
      "Unlimited projects",
      "12 months of updates",
      "Priority support",
      "Customization guide"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "$499",
    description: "For large organizations",
    features: [
      "Full source code",
      "Organization-wide license",
      "Unlimited projects",
      "Lifetime updates",
      "Priority support",
      "Custom modifications",
      "1-on-1 onboarding call"
    ],
    highlighted: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            One-time payment. No subscriptions. Lifetime access.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.highlighted 
                  ? 'bg-[hsl(var(--card))] border-[hsl(var(--primary))] glow-primary scale-105' 
                  : 'bg-[hsl(var(--card)/0.5)] border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-[hsl(var(--muted-foreground))]"> / one-time</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[hsl(var(--muted-foreground))]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90'
                    : 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                Get {plan.name}
              </button>
            </div>
          ))}
        </div>
        
        {/* Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--muted))]">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
