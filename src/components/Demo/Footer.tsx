export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[hsl(var(--border))]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center">
              <span className="text-sm font-bold text-[hsl(var(--background))]">G</span>
            </div>
            <span className="font-semibold">React Globe Vietnam</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">Documentation</a>
            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">License</a>
            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">Support</a>
          </div>
          
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            © 2025 All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
