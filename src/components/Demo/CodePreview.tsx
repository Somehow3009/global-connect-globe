export function CodePreview() {
  return (
    <section id="code" className="py-24 px-6 bg-[hsl(var(--card)/0.5)]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple to <span className="gradient-text">integrate</span>
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            Just import and use. No complex configuration needed.
          </p>
        </div>
        
        <div className="rounded-2xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          {/* Code header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="w-3 h-3 rounded-full bg-[hsl(0_70%_50%/0.8)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(45_70%_50%/0.8)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(120_70%_40%/0.8)]" />
            <span className="ml-4 text-xs text-[hsl(var(--muted-foreground))]">App.tsx</span>
          </div>
          
          {/* Code content */}
          <pre className="p-6 overflow-x-auto">
            <code className="text-sm font-mono">
              <span className="text-[hsl(var(--secondary))]">import</span>
              <span className="text-[hsl(var(--foreground))]"> {"{ GlobeScene }"} </span>
              <span className="text-[hsl(var(--secondary))]">from</span>
              <span className="text-[hsl(var(--primary))]"> './components/Globe'</span>
              <span className="text-[hsl(var(--foreground))]">;</span>
              <br /><br />
              <span className="text-[hsl(var(--secondary))]">function</span>
              <span className="text-[hsl(var(--foreground))]"> </span>
              <span className="text-[hsl(45_80%_60%)]">App</span>
              <span className="text-[hsl(var(--foreground))]">() {"{"}</span>
              <br />
              <span className="text-[hsl(var(--foreground))]">  </span>
              <span className="text-[hsl(var(--secondary))]">return</span>
              <span className="text-[hsl(var(--foreground))]"> (</span>
              <br />
              <span className="text-[hsl(var(--foreground))]">    </span>
              <span className="text-[hsl(var(--muted-foreground))]">&lt;</span>
              <span className="text-[hsl(0_70%_60%)]">div</span>
              <span className="text-[hsl(var(--primary))]"> className</span>
              <span className="text-[hsl(var(--foreground))]">=</span>
              <span className="text-[hsl(var(--primary))]">"h-screen"</span>
              <span className="text-[hsl(var(--muted-foreground))]">&gt;</span>
              <br />
              <span className="text-[hsl(var(--foreground))]">      </span>
              <span className="text-[hsl(var(--muted-foreground))]">&lt;</span>
              <span className="text-[hsl(120_60%_50%)]">GlobeScene</span>
              <span className="text-[hsl(var(--foreground))]"> </span>
              <span className="text-[hsl(var(--muted-foreground))]">/&gt;</span>
              <br />
              <span className="text-[hsl(var(--foreground))]">    </span>
              <span className="text-[hsl(var(--muted-foreground))]">&lt;/</span>
              <span className="text-[hsl(0_70%_60%)]">div</span>
              <span className="text-[hsl(var(--muted-foreground))]">&gt;</span>
              <br />
              <span className="text-[hsl(var(--foreground))]">  );</span>
              <br />
              <span className="text-[hsl(var(--foreground))]">{"}"}</span>
            </code>
          </pre>
        </div>
        
        {/* Tech stack */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {['React 18', 'Three.js', 'TypeScript', 'Tailwind'].map((tech) => (
            <span 
              key={tech}
              className="px-3 py-1 text-xs font-medium rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
