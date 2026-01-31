const features = [
  {
    icon: "🗺️",
    title: "Accurate Geography",
    description: "TopoJSON-based land detection with precise country borders from Natural Earth 50m data."
  },
  {
    icon: "⚡",
    title: "Optimized Performance",
    description: "Web Worker for heavy computations, precomputed positions, and efficient Three.js rendering."
  },
  {
    icon: "🎨",
    title: "Fully Customizable",
    description: "Easy configuration for colors, dot density, connection cities, and visual effects."
  },
  {
    icon: "🎮",
    title: "Interactive Controls",
    description: "Smooth drag-to-rotate, scroll-to-zoom, and elegant auto-rotation when idle."
  },
  {
    icon: "📱",
    title: "Responsive Design",
    description: "Works beautifully on all screen sizes from mobile to 4K displays."
  },
  {
    icon: "🔧",
    title: "TypeScript Ready",
    description: "Full TypeScript support with exported types for seamless integration."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for a <span className="gradient-text">world-class</span> globe
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-2xl mx-auto">
            Built with modern React patterns and optimized for production use.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                {feature.title}
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
