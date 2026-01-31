export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[hsl(var(--background)/0.8)] border-b border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center">
            <span className="text-sm font-bold text-[hsl(var(--background))]">G</span>
          </div>
          <span className="font-semibold text-lg">React Globe</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Features
          </a>
          <a href="#code" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Code
          </a>
          <a href="#pricing" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Pricing
          </a>
        </nav>
        
        <div className="flex items-center gap-3">
          <a 
            href="#pricing" 
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
          >
            Buy Now
          </a>
        </div>
      </div>
    </header>
  );
}
