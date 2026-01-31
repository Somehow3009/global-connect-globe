import { GlobeScene } from "@/components/Globe/GlobeScene";

export function HeroSection() {
  return (
    <section className="relative pt-16 min-h-screen flex flex-col">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--primary)/0.1)] rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--secondary)/0.1)] rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Text content */}
        <div className="text-center pt-20 px-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] mb-6">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">React Three Fiber Component</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Interactive 3D Globe</span>
            <br />
            <span className="text-[hsl(var(--foreground))]">for React</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-8 animate-fade-up-delay-1">
            A stunning, production-ready globe component with accurate geography, 
            animated connections, and beautiful visual effects.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
            <a 
              href="#pricing"
              className="px-8 py-3 rounded-xl font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity glow-primary"
            >
              Get Component — $49
            </a>
            <a 
              href="#code"
              className="px-8 py-3 rounded-xl font-semibold border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] transition-colors"
            >
              View Code
            </a>
          </div>
        </div>
        
        {/* Globe */}
        <div className="flex-1 min-h-[500px] lg:min-h-[600px] relative mt-8 animate-fade-up-delay-3">
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-full max-w-4xl aspect-[16/10] rounded-3xl overflow-hidden gradient-border glow-primary"
              style={{ background: 'hsl(var(--background))' }}
            >
              <GlobeScene />
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">Scroll to explore</span>
        <svg className="w-5 h-5 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
