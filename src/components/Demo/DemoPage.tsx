import { GlobeScene } from "@/components/Globe/GlobeScene";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { PricingSection } from "./PricingSection";
import { CodePreview } from "./CodePreview";
import { Footer } from "./Footer";

export function DemoPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CodePreview />
      <PricingSection />
      <Footer />
    </div>
  );
}
